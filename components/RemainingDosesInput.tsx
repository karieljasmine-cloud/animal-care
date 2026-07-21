"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateRemainingDosesDirectly } from "@/app/actions/medications";

export default function RemainingDosesInput({
  medicationId,
  initialValue,
}: {
  medicationId: string;
  initialValue: number | null;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialValue?.toString() ?? "");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const isLow = initialValue !== null && initialValue <= 3;

  async function handleSave() {
    const num = value === "" ? null : parseInt(value);
    if (value !== "" && (isNaN(num!) || num! < 0)) return;
    setBusy(true);
    try {
      await updateRemainingDosesDirectly(medicationId, num ?? null);
      setEditing(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1 mt-0.5">
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          min="0"
          className="w-14 border border-gray-300 rounded px-1 py-0.5 text-xs text-gray-700"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") setEditing(false);
          }}
        />
        <span className="text-xs text-gray-400">回</span>
        <button
          onClick={handleSave}
          disabled={busy}
          className="text-xs text-green-600 font-medium disabled:opacity-50"
        >
          保存
        </button>
        <button
          onClick={() => setEditing(false)}
          disabled={busy}
          className="text-xs text-gray-400"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className={`text-xs mt-0.5 font-semibold block text-left hover:underline ${
        initialValue === null
          ? "text-gray-300 hover:text-gray-500"
          : isLow
          ? "text-red-500"
          : "text-gray-400"
      }`}
      title="クリックで残量を直接入力"
    >
      {initialValue === null ? "残量: 未設定 ✏️" : `残量: ${initialValue}回${isLow ? " ⚠️" : ""}`}
    </button>
  );
}
