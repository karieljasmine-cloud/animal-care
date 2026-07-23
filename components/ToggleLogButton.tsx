"use client";

import { useState, useTransition, useRef } from "react";
import { toggleMedicationLog } from "@/app/actions/medications";

export default function ToggleLogButton({
  medicationId,
  logDate,
  timeOfDay,
  initialGiven,
  staffName,
  logRemainingDoses,
  remainingDoses,
  medicationType = "pill",
}: {
  medicationId: string;
  logDate: string;
  timeOfDay: string;
  initialGiven: boolean;
  staffName: string | null;
  logRemainingDoses?: number | null;
  remainingDoses?: number | null;
  medicationType?: string;
}) {
  const [given, setGiven] = useState(initialGiven);
  const [enteringCount, setEnteringCount] = useState(false);
  const [showUndo, setShowUndo] = useState(false);
  const [countValue, setCountValue] = useState("");
  const [countError, setCountError] = useState(false);
  const [displayStaffName, setDisplayStaffName] = useState(staffName);
  const [displayRemaining, setDisplayRemaining] = useState(logRemainingDoses ?? null);
  const [, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const isPill = medicationType === "pill";

  function handleClick() {
    if (given) {
      setShowUndo(true);
      return;
    }
    if (isPill) {
      setCountValue("");
      setCountError(false);
      setEnteringCount(true);
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      // 目薬・軟膏：残量不要のためそのまま記録
      setGiven(true);
      startTransition(async () => {
        const fd = new FormData();
        fd.append("medicationId", medicationId);
        fd.append("logDate", logDate);
        fd.append("timeOfDay", timeOfDay);
        fd.append("existing", "false");
        await toggleMedicationLog(fd);
      });
    }
  }

  function handleConfirm() {
    if (isPill && countValue === "") {
      setCountError(true);
      inputRef.current?.focus();
      return;
    }
    const count = countValue !== "" ? parseInt(countValue) : null;
    setEnteringCount(false);
    setCountError(false);
    setGiven(true);
    setDisplayRemaining(count !== null && !isNaN(count) ? count : null);
    startTransition(async () => {
      const fd = new FormData();
      fd.append("medicationId", medicationId);
      fd.append("logDate", logDate);
      fd.append("timeOfDay", timeOfDay);
      fd.append("existing", "false");
      if (count !== null && !isNaN(count) && count >= 0) fd.append("remainingDoses", count.toString());
      await toggleMedicationLog(fd);
    });
  }

  function handleUndo() {
    setShowUndo(false);
    setGiven(false);
    setDisplayStaffName(null);
    setDisplayRemaining(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.append("medicationId", medicationId);
      fd.append("logDate", logDate);
      fd.append("timeOfDay", timeOfDay);
      fd.append("existing", "true");
      await toggleMedicationLog(fd);
    });
  }

  return (
    <>
      {given ? (
        <button
          onClick={handleClick}
          title="タップして取り消し確認"
          className="w-full rounded-md bg-green-500 border border-green-600 text-white py-1 px-1 flex flex-col items-center justify-center min-h-[44px] cursor-pointer hover:bg-green-600 transition-colors"
        >
          <span className="text-[10px] font-bold leading-tight truncate w-full text-center">
            {displayStaffName?.slice(0, 5) ?? "投与済"}
          </span>
          {displayRemaining !== null ? (
            <span className="text-[10px] leading-tight text-green-100">
              残{displayRemaining}
            </span>
          ) : (
            <span className="text-[9px] leading-tight text-green-200">✓</span>
          )}
        </button>
      ) : (
        <button
          onClick={handleClick}
          title="投与済みにする"
          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center mx-auto transition-colors cursor-pointer ${
            enteringCount
              ? "border-green-400 bg-green-50"
              : "border-gray-300 text-gray-300 hover:border-green-400 hover:text-green-400"
          }`}
        />
      )}

      {/* 投与記録パネル（錠剤のみ） */}
      {enteringCount && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl">
          <div className="max-w-md mx-auto p-4">
            <p className="text-sm font-semibold text-gray-700 mb-1">
              投与後の残量を入力してください
              <span className="text-red-500 ml-1">*必須</span>
            </p>
            {remainingDoses !== null && remainingDoses !== undefined && (
              <p className="text-xs text-gray-400 mb-2">前回記録: {remainingDoses}錠</p>
            )}
            <div className="flex items-center gap-3 mb-1">
              <input
                ref={inputRef}
                type="number"
                min="0"
                value={countValue}
                onChange={(e) => { setCountValue(e.target.value); setCountError(false); }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleConfirm();
                  if (e.key === "Escape") setEnteringCount(false);
                }}
                placeholder="0"
                className={`w-28 border-2 rounded-xl px-3 py-3 text-2xl text-center font-bold outline-none ${
                  countError ? "border-red-500 bg-red-50" : "border-gray-300 focus:border-green-500"
                }`}
              />
              <span className="text-gray-500 text-sm">錠・包</span>
            </div>
            {countError && (
              <p className="text-xs text-red-500 mb-3">残量を入力してください</p>
            )}
            {!countError && <div className="mb-4" />}
            <div className="flex gap-2">
              <button
                onClick={handleConfirm}
                className="flex-1 bg-green-600 text-white rounded-xl py-3 font-semibold text-sm active:bg-green-700"
              >
                ✓ 記録する
              </button>
              <button
                onClick={() => { setEnteringCount(false); setCountError(false); }}
                className="px-4 bg-gray-100 text-gray-400 rounded-xl py-3 text-sm active:bg-gray-200"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 取り消し確認パネル */}
      {showUndo && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl">
          <div className="max-w-md mx-auto p-4">
            <p className="text-sm font-semibold text-gray-700 mb-1">この投与記録を取り消しますか？</p>
            {displayStaffName && (
              <p className="text-xs text-gray-400 mb-1">記録者: {displayStaffName}</p>
            )}
            {displayRemaining !== null && (
              <p className="text-xs text-gray-400 mb-1">記録した残量: {displayRemaining}錠・包</p>
            )}
            <p className="text-xs text-red-400 mb-4">取り消すと記録が削除されます</p>
            <div className="flex gap-2">
              <button
                onClick={handleUndo}
                className="flex-1 bg-red-500 text-white rounded-xl py-3 font-semibold text-sm active:bg-red-600"
              >
                取り消す
              </button>
              <button
                onClick={() => setShowUndo(false)}
                className="flex-1 bg-gray-100 text-gray-600 rounded-xl py-3 text-sm active:bg-gray-200"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
