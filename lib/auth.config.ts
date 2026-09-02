import type { NextAuthConfig } from "next-auth";

/**
 * Edge で安全に読み込める認証設定（Prisma などの Node 専用モジュールを含まない）。
 * middleware（proxy）はこの設定だけを使う。
 * DB アクセスを伴う本設定は lib/auth.ts 側で組み立てる。
 */
export const authConfig = {
  trustHost: true,
  providers: [],
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = (user as { id?: string }).id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
