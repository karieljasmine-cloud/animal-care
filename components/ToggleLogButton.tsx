"use client";

import { useState, useTransition, useEffect } from "react";
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
  const [, startTransition] = useTransition();

  useEffect(() => {
    setGiven(initialGiven);
  }, [initialGiven]);

  function handleClick() {
    const wasGiven = given;
    setGiven(!given); // 即時切り替え
    startTransition(async () => {
      const formData = new FormData();
      formData.append("medicationId", medicationId);
      formData.append("logDate", logDate);
      formData.append("timeOfDay", timeOfDay);
      formData.append("existing", wasGiven ? "true" : "false");
      await toggleMedicationLog(formData);
    });
  }

  return (
    <button
      onClick={handleClick}
      title={given ? `${staffName ?? "不明"}が投与 — 取り消す` : "投与済みにする"}
      className={`w-12 h-12 rounded-full border-2 flex flex-col items-center justify-center mx-auto transition-colors cursor-pointer ${
        given
          ? "bg-green-500 border-green-500 text-white hover:bg-red-400 hover:border-red-400"
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
  );
}
