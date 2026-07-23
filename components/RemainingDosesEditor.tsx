"use client";

import { useState, useTransition, useRef } from "react";
import { updateRemainingDosesDirectly } from "@/app/actions/medications";

export default function RemainingDosesEditor({
  medicationId,
  initialCount,
}: {
  medicationId: string;
  initialCount: number | null;
}) {
  const [count, setCount] = useState(initialCount);
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const isLow = count !== null && count <= 3;

  function startEdit() {
    setInputVal(count !== null ? count.toString() : "");
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function save() {
    const parsed = inputVal === "" ? null : parseInt(inputVal);
    setCount(parsed !== null && !isNaN(parsed) ? parsed : null);
    setEditing(false);
    startTransition(async () => {
      await updateRemainingDosesDirectly(
        medicationId,
        inputVal === "" ? null : parseInt(inputVal)
      );
    });
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1 mt-0.5">
        <input
          ref={inputRef}
          type="number"
          min="0"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") setEditing(false);
          }}
          className="w-14 border border-green-400 rounded px-1 py-0.5 text-xs text-center focus:outline-none"
        />
        <span className="text-[10px] text-gray-400">錠・包</span>
        <button
          onClick={save}
          className="text-green-600 text-xs font-bold hover:text-green-700"
        >
          ✓
        </button>
        <button
          onClick={() => setEditing(false)}
          className="text-gray-400 text-xs hover:text-gray-600"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={startEdit}
      className={`flex items-center gap-1 mt-0.5 text-xs font-semibold group ${
        isLow ? "text-red-500" : count !== null ? "text-gray-500" : "text-gray-300"
      }`}
      title="タップして残量を修正"
    >
      {count !== null ? (
        <>
          残量: {count}錠・包{isLow ? " ⚠️" : ""}
        </>
      ) : (
        <span>残量を入力</span>
      )}
      <span className="text-gray-200 group-hover:text-gray-400 text-[10px] ml-0.5">✏</span>
    </button>
  );
}
