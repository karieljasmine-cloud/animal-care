"use client";

import { useState, useTransition } from "react";
import { deactivateAnimal } from "@/app/actions/animals";

export default function RetireAnimalButton({ id, name }: { id: string; name: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("transfer");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("animalId", id);
    startTransition(async () => {
      await deactivateAnimal(formData);
      setOpen(false);
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-orange-100 text-orange-700 px-4 py-2 rounded-lg text-sm hover:bg-orange-200 transition-colors"
      >
        退籍させる
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h2 className="text-lg font-bold text-gray-800 mb-1">退籍処理</h2>
            <p className="text-sm text-gray-500 mb-4">「{name}」</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">理由</label>
                <select
                  name="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option value="transfer">譲渡</option>
                  <option value="death">死亡</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {reason === "death" ? "死亡日" : "譲渡日"}
                </label>
                <input
                  type="date"
                  name="date"
                  defaultValue={new Date().toISOString().split("T")[0]}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {reason === "death" ? "死亡原因（任意）" : "譲渡先（任意）"}
                </label>
                <input
                  type="text"
                  name="details"
                  placeholder={reason === "death" ? "例: 老衰" : "例: 山田家"}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                退籍させると日次記録・投薬管理から非表示になります。個体台帳には「退籍済み」として記録が残ります（法定保存）。
              </p>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={isPending}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-700 disabled:opacity-50"
                >
                  {isPending ? "処理中..." : "退籍させる"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
