"use client";

import { useTransition } from "react";
import { setStaffActive } from "@/app/actions/staff";

export default function StaffAccessButton({
  id,
  name,
  isActive,
}: {
  id: string;
  name: string;
  isActive: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const msg = isActive
      ? `「${name}」のアプリへのアクセスを無効化しますか？\n（記録はそのまま残り、ログインできなくなります）`
      : `「${name}」のアクセスを再度有効にしますか？`;
    if (!confirm(msg)) return;
    startTransition(async () => {
      try {
        await setStaffActive(id, !isActive);
      } catch (err) {
        alert(err instanceof Error ? err.message : "変更に失敗しました");
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={
        isActive
          ? "text-amber-600 hover:text-amber-800 text-xs disabled:opacity-50"
          : "text-green-600 hover:text-green-800 text-xs disabled:opacity-50"
      }
    >
      {isPending ? "処理中..." : isActive ? "アクセス無効化" : "アクセス再有効化"}
    </button>
  );
}
