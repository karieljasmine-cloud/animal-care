"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { toggleMedicationLog } from "@/app/actions/medications";

export default function ToggleLogButton({
  medicationId,
  logDate,
  timeOfDay,
  initialGiven,
  staffName,
}: {
  medicationId: string;
  logDate: string;
  timeOfDay: string;
  initialGiven: boolean;
  staffName: string | null;
}) {
  const [given, setGiven] = useState(initialGiven);
  const [enteringCount, setEnteringCount] = useState(false);
  const [countValue, setCountValue] = useState("");
  const [, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setGiven(initialGiven);
  }, [initialGiven]);

  function handleClick() {
    if (given) {
      setGiven(false);
      startTransition(async () => {
        const fd = new FormData();
        fd.append("medicationId", medicationId);
        fd.append("logDate", logDate);
        fd.append("timeOfDay", timeOfDay);
        fd.append("existing", "true");
        await toggleMedicationLog(fd);
      });
    } else {
      setCountValue("");
      setEnteringCount(true);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }

  function handleConfirm() {
    const count = countValue !== "" ? parseInt(countValue) : null;
    setEnteringCount(false);
    setGiven(true);
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

  return (
    <>
      <button
        onClick={handleClick}
        title={given ? `${staffName ?? "不明"}が投与 — 取り消す` : "投与済みにする"}
        className={`w-12 h-12 rounded-full border-2 flex flex-col items-center justify-center mx-auto transition-colors cursor-pointer ${
          given
            ? "bg-green-500 border-green-500 text-white hover:bg-red-400 hover:border-red-400"
            : enteringCount
            ? "border-green-400 text-green-400 bg-green-50"
            : "border-gray-300 text-gray-300 hover:border-green-400 hover:text-green-400"
        }`}
      >
        <span className="text-sm font-bold leading-none">{given ? "✓" : ""}</span>
        {given && staffName && (
          <span className="text-[9px] leading-none mt-0.5 truncate max-w-[36px]">
            {staffName.slice(0, 3)}
          </span>
        )}
      </button>

      {enteringCount && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl">
          <div className="max-w-md mx-auto p-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">投与後の残量（空欄でも記録できます）</p>
            <div className="flex items-center gap-3 mb-4">
              <input
                ref={inputRef}
                type="number"
                min="0"
                value={countValue}
                onChange={(e) => setCountValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleConfirm();
                  if (e.key === "Escape") setEnteringCount(false);
                }}
                placeholder="0"
                className="w-28 border-2 border-gray-300 rounded-xl px-3 py-3 text-2xl text-center font-bold focus:border-green-500 outline-none"
              />
              <span className="text-gray-500 text-sm">錠・包</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleConfirm}
                className="flex-1 bg-green-600 text-white rounded-xl py-3 font-semibold text-sm active:bg-green-700"
              >
                ✓ 記録する
              </button>
              <button
                onClick={() => setEnteringCount(false)}
                className="px-4 bg-gray-100 text-gray-400 rounded-xl py-3 text-sm active:bg-gray-200"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
