import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

// middleware（Edge）では Prisma を含まない Edge 安全な設定のみを使う。
// アクセス無効化・権限変更の厳密な判定は lib/auth.ts（Node）側の
// jwt コールバックと (dashboard)/layout.tsx で行う。
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const pathname = req.nextUrl.pathname;
  const isLoginPage = pathname === "/login";
  const isApiAuth = pathname.startsWith("/api/auth");

  if (isApiAuth) return NextResponse.next();

  if (!isLoggedIn && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isLoggedIn && isLoginPage) {
    const role = (req.auth?.user as { role?: string })?.role ?? "staff";
    const home = role === "staff" ? "/daily-records" : "/animals";
    return NextResponse.redirect(new URL(home, req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|uploads).*)"],
};
