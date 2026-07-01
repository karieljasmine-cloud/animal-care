"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";

export default function Navbar({ userName, userRole }: { userName: string; userRole: string }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const canSeeAnimals = userRole === "admin" || userRole === "viewer";
  const isAdmin = userRole === "admin";

  const roleLabel: Record<string, string> = {
    admin: "管理者",
    viewer: "閲覧者",
    staff: "スタッフ",
  };

  const navItems = [
    ...(canSeeAnimals ? [{ href: "/animals", label: "個体台帳", icon: "🐾" }] : []),
    { href: "/daily-records", label: "日次記録", icon: "📋" },
    { href: "/medications/chart", label: "投薬記録", icon: "💊" },
    { href: "/events", label: "特記事項", icon: "📅" },
    ...(canSeeAnimals ? [{ href: "/cat-toilet", label: "猫トイレ", icon: "🐈" }] : []),
    ...(isAdmin ? [{ href: "/staff", label: "スタッフ管理", icon: "👥" }] : []),
    ...(isAdmin ? [{ href: "/admin/audit-log", label: "操作履歴", icon: "📜" }] : []),
  ];

  return (
    <nav className="bg-green-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* ロゴ */}
          <Link href={canSeeAnimals ? "/animals" : "/daily-records"} className="font-bold text-lg flex items-center gap-2">
            🐾 保護動物管理
          </Link>

          {/* PC用ナビ */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    pathname.startsWith(item.href)
                      ? "bg-green-900 text-white"
                      : "hover:bg-green-600 text-green-100"
                  }`}
                >
                  {item.icon} {item.label}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-green-200">{userName}</span>
              <span className="text-xs bg-green-600 px-2 py-0.5 rounded-full text-green-100">
                {roleLabel[userRole] ?? userRole}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-sm bg-green-800 hover:bg-green-900 px-3 py-1 rounded-md transition-colors"
              >
                ログアウト
              </button>
            </div>
          </div>

          {/* スマホ用ハンバーガーボタン */}
          <button
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="メニュー"
          >
            <span className={`block w-6 h-0.5 bg-white transition-transform ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-6 h-0.5 bg-white transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-6 h-0.5 bg-white transition-transform ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>
      </div>

      {/* スマホ用ドロップダウンメニュー */}
      {menuOpen && (
        <div className="md:hidden bg-green-800 px-4 pb-4 flex flex-col gap-2">
          <div className="pt-2 pb-1 text-xs text-green-300 border-b border-green-600">
            {userName}（{roleLabel[userRole] ?? userRole}）
          </div>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className={`px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                pathname.startsWith(item.href)
                  ? "bg-green-900 text-white"
                  : "hover:bg-green-600 text-green-100"
              }`}
            >
              {item.icon} {item.label}
            </Link>
          ))}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-left text-sm bg-green-700 hover:bg-green-900 px-3 py-2.5 rounded-md transition-colors text-green-100"
          >
            🚪 ログアウト
          </button>
        </div>
      )}
    </nav>
  );
}
