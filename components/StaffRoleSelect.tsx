"use client";

import { useTransition } from "react";
import { updateStaffRole } from "@/app/actions/staff";

export default function StaffRoleSelect({
  id,
  role,
  disabled,
}: {
  id: string;
  role: string;
  disabled?: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    if (next === role) return;
    if (!confirm(`権限を「${label(next)}」に変更しますか？`)) {
      e.target.value = role;
      return;
    }
    startTransition(async () => {
      try {
        await updateStaffRole(id, next);
      } catch (err) {
        alert(err instanceof Error ? err.message : "変更に失敗しました");
      }
    });
  }

  return (
    <select
      defaultValue={role}
      onChange={handleChange}
      disabled={disabled || isPending}
      className="border border-gray-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
    >
      <option value="staff">スタッフ</option>
      <option value="viewer">閲覧者</option>
      <option value="admin">管理者</option>
    </select>
  );
}

function label(role: string) {
  return role === "admin" ? "管理者" : role === "viewer" ? "閲覧者" : "スタッフ";
}
