import { PrismaClient } from "../app/generated/prisma";

const prisma = new PrismaClient();

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

async function main() {
  console.log(`${dogs.length}頭の登録を開始します...`);

  let created = 0;
  let skipped = 0;

  for (const name of dogs) {
    const existing = await prisma.animal.findFirst({ where: { name } });
    if (existing) {
      console.log(`スキップ（既存）: ${name}`);
      skipped++;
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
    console.log(`登録完了: ${name}`);
    created++;
  }

  console.log(`\n完了: ${created}頭を新規登録、${skipped}頭はスキップしました`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
