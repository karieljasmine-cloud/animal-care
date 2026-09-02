"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";

export default function ForceSignOut({ reason }: { reason?: string }) {
  useEffect(() => {
    signOut({ callbackUrl: "/login" });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm text-center">
        <div className="text-4xl mb-3">🔒</div>
        <p className="font-semibold text-gray-800">
          {reason ?? "このアカウントは利用できません"}
        </p>
        <p className="text-sm text-gray-500 mt-2">ログイン画面に戻ります…</p>
      </div>
    </div>
  );
}
