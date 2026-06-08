"use client";

import { useTransition } from "react";
import { deleteMedication } from "@/app/actions/medications";

export default function DeleteMedicationButton({ id, name }: { id: string; name: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm(`「${name}」の投薬記録を削除しますか？\n（投薬チェック表のログもすべて削除されます）`)) return;
    startTransition(async () => {
      await deleteMedication(id);
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
