import type { Metadata } from "next";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";

export const metadata: Metadata = {
  title: "保護動物管理システム",
  description: "動物保護団体向け個体管理・日次記録システム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full bg-gray-50">
        <NextTopLoader color="#16a34a" showSpinner={false} height={3} />
        {children}
      </body>
    </html>
  );
}
