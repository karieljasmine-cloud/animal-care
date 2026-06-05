import type { Metadata } from "next";
import "./globals.css";

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
      <body className="min-h-full bg-gray-50">{children}</body>
    </html>
  );
}
