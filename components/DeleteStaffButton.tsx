"use client";

import { deleteStaff } from "@/app/actions/staff";

export default function DeleteStaffButton({ id, name }: { id: string; name: string }) {
  async function handleDelete() {
    if (!confirm(`「${name}」を削除しますか？`)) return;
    await deleteStaff(id);
  }

  return (
    <button
      onClick={handleDelete}
      className="text-red-500 hover:text-red-700 text-xs"
    >
      削除
    </button>
  );
}
