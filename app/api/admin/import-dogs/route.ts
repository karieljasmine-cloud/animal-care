import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const dogs = [
  "のび太", "おユキ", "エルサ", "メルちゃん", "イヴ",
  "レオ", "雪華綺晶", "Pucci", "ティファニー", "ローゼ",
  "JILL", "コフィー", "COCO", "ポセイドン", "イリス",
  "マリオ", "獅子丸", "フック", "ドーラ", "ルイ",
  "ななこ", "CECIL", "ハリー", "シルバー", "アルマ",
  "カール", "ラッディー", "サマンサ", "ピンキー", "ダイアン",
  "ティアラ", "サクラ", "シャーリー", "テンプル", "ベビー",
  "チックル", "ボス", "チャッキー", "シャナ", "アテーナ",
  "アルテミス",
];

export async function POST() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const results: { name: string; status: string }[] = [];

  for (const name of dogs) {
    const existing = await prisma.animal.findFirst({ where: { name } });
    if (existing) {
      results.push({ name, status: "skipped" });
      continue;
    }
    await prisma.animal.create({
      data: {
        name,
        species: "犬",
        sex: "不明",
        intakeDate: new Date("2026-06-08"),
        isActive: true,
      },
    });
    results.push({ name, status: "created" });
  }

  const created = results.filter((r) => r.status === "created").length;
  const skipped = results.filter((r) => r.status === "skipped").length;

  return NextResponse.json({ created, skipped, results });
}
