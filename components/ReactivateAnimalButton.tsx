"use client";

import { useTransition } from "react";
import { reactivateAnimal } from "@/app/actions/animals";

export default function ReactivateAnimalButton({ id, name }: { id: string; name: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm(`「${name}」を在籍中に戻しますか？\n（譲渡日・死亡日・死因の記録がクリアされます）`)) return;
    startTransition(async () => {
      await reactivateAnimal(id);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm hover:bg-green-200 transition-colors disabled:opacity-50"
    >
      {isPending ? "処理中..." : "在籍に戻す"}
    </button>
  );
}
