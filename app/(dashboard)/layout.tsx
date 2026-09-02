import { auth } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import ScrollToTop from "@/components/ScrollToTop";
import ForceSignOut from "@/components/ForceSignOut";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // middleware は JWT の有無しか見ないため、ここに到達したのに session が無い
  // ＝アクセス無効化 or アカウント削除でセッションが失効したケース。
  // redirect すると middleware と往復ループになるので、クライアントで確実にサインアウトさせる。
  if (!session?.user) {
    return <ForceSignOut reason="このアカウントのアクセスは無効化されています" />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        userName={session.user.name ?? ""}
        userRole={(session.user as { role?: string }).role ?? "staff"}
      />
      <ScrollToTop />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {children}
      </main>
    </div>
  );
}
