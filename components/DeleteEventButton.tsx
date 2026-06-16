"use client";

import { deleteAnimalEvent } from "@/app/actions/events";

export default function DeleteEventButton({ id }: { id: string }) {
  async function handleDelete() {
    if (!confirm("このイベントを削除しますか？")) return;
    await deleteAnimalEvent(id);
  }

  return (
    <button
      onClick={handleDelete}
      className="text-red-400 hover:text-red-600 text-xs whitespace-nowrap shrink-0 px-2 py-1 rounded hover:bg-red-50 transition-colors"
    >
      削除
    </button>
  );
}
