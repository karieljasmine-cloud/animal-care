"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteCatToiletLog, updateCatToiletLog } from "@/app/actions/cat-toilet";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

export default function CatToiletLogItem({
  id,
  changedAt,
}: {
  id: string;
  changedAt: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [dateValue, setDateValue] = useState(
    format(new Date(changedAt), "yyyy-MM-dd'T'HH:mm")
  );
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (!confirm("この記録を削除しますか？")) return;
    setBusy(true);
    try {
      await deleteCatToiletLog(id);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleUpdate() {
    setBusy(true);
    try {
      await updateCatToiletLog(id, dateValue);
      setEditing(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1 py-1 flex-wrap">
        <input
          type="datetime-local"
          value={dateValue}
          onChange={(e) => setDateValue(e.target.value)}
          className="border border-gray-300 rounded px-1.5 py-0.5 text-xs text-gray-700"
        />
        <button
          onClick={handleUpdate}
          disabled={busy}
          className="text-xs text-white bg-green-500 px-2 py-0.5 rounded disabled:opacity-50"
        >
          保存
        </button>
        <button
          onClick={() => setEditing(false)}
          disabled={busy}
          className="text-xs text-gray-500 px-2 py-0.5 rounded border border-gray-300"
        >
          取消
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-xs text-gray-500">
        {format(new Date(changedAt), "M/d(E) HH:mm", { locale: ja })}
      </span>
      <div className="flex gap-3">
        <button
          onClick={() => setEditing(true)}
          disabled={busy}
          className="text-xs text-blue-500 hover:text-blue-700 disabled:opacity-50"
        >
          日付編集
        </button>
        <button
          onClick={handleDelete}
          disabled={busy}
          className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
        >
          削除
        </button>
      </div>
    </div>
  );
}
