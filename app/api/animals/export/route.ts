import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const animals = await prisma.animal.findMany({
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
    include: {
      vaccines: { orderBy: { vaccinatedAt: "asc" } },
      weightRecords: { orderBy: { recordedAt: "desc" }, take: 1 },
    },
  });

  const fmt = (d: Date | null | undefined) =>
    d ? format(new Date(d), "yyyy/MM/dd", { locale: ja }) : "";

  const rows = animals.map((a) => ({
    名前: a.name,
    種類: a.species,
    品種: a.breed ?? "",
    性別: a.sex === "male" ? "オス" : "メス",
    生年月日: fmt(a.birthDate),
    受け入れ日: fmt(a.intakeDate),
    繁殖者氏名: a.breederName ?? "",
    持病: a.conditions ?? "",
    最新体重_kg: a.weightRecords[0]?.weight ?? "",
    接種ワクチン: a.vaccines.map((v) => v.vaccineName).join("、"),
    譲渡日: fmt(a.transferDate),
    譲渡先: a.transferTo ?? "",
    死亡日: fmt(a.deathDate),
    死亡原因: a.deathCause ?? "",
    在籍状況: a.isActive ? "在籍中" : "退籍済み",
    備考: a.notes ?? "",
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);

  // 列幅を設定
  ws["!cols"] = [
    { wch: 12 }, { wch: 8 }, { wch: 12 }, { wch: 6 },
    { wch: 12 }, { wch: 12 }, { wch: 16 }, { wch: 20 },
    { wch: 10 }, { wch: 30 }, { wch: 12 }, { wch: 16 },
    { wch: 12 }, { wch: 20 }, { wch: 10 }, { wch: 20 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, "個体台帳");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  const date = format(new Date(), "yyyyMMdd");

  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename*=UTF-8''%E5%80%8B%E4%BD%93%E5%8F%B0%E5%B8%B3_${date}.xlsx`,
    },
  });
}
