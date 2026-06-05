"use client";

import { deleteAnimal } from "@/app/actions/animals";

export default function DeleteAnimalButton({ id, name }: { id: string; name: string }) {
  async function handleDelete() {
    if (!confirm(`「${name}」を削除しますか？この操作は元に戻せません。`)) return;
    await deleteAnimal(id);
  }

  return (
    <button
      onClick={handleDelete}
      className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm hover:bg-red-200 transition-colors"
    >
      削除
    </button>
  );
}
