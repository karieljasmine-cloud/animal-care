"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

export default function Navbar({ userName, userRole }: { userName: string; userRole: string }) {
  const pathname = usePathname();

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
    { href: "/medications", label: "投薬記録", icon: "💊" },
    ...(isAdmin ? [{ href: "/staff", label: "スタッフ管理", icon: "👥" }] : []),
  ];

  return (
    <nav className="bg-green-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <Link href={canSeeAnimals ? "/animals" : "/daily-records"} className="font-bold text-lg flex items-center gap-2">
              🐾 保護動物管理
            </Link>
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
      </div>
    </nav>
  );
}
