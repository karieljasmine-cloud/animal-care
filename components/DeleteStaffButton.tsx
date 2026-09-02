"use client";

import { useTransition } from "react";
import { deleteStaff } from "@/app/actions/staff";

export default function DeleteStaffButton({ id, name }: { id: string; name: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm(`「${name}」を削除しますか？`)) return;
    startTransition(async () => {
      try {
        await deleteStaff(id);
      } catch (e) {
        alert(e instanceof Error ? e.message : "削除に失敗しました");
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="text-red-500 hover:text-red-700 text-xs disabled:opacity-50"
    >
      {isPending ? "削除中..." : "削除"}
    </button>
  );
}
