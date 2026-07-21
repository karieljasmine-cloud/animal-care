import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format, subDays, startOfDay } from "date-fns";
import { ja } from "date-fns/locale";
import ExcretionChartClient from "@/components/ExcretionChartClient";
import { unstable_cache } from "next/cache";

const DAYS = 7;

function getChartData(fromDateStr: string, species: string) {
  return unstable_cache(
    async () => {
      const from = new Date(fromDateStr);
      const [animals, records] = await Promise.all([
        prisma.animal.findMany({
          where: { isActive: true, ...(species ? { species } : {}) },
          orderBy: { name: "asc" },
          select: { id: true, name: true },
        }),
        prisma.dailyRecord.findMany({
          where: { recordDate: { gte: from } },
          select: { id: true, animalId: true, recordDate: true, stoolCondition: true, urineAmount: true, timeOfDay: true },
        }),
      ]);
      return { animals, records };
    },
    ["excretion-chart", fromDateStr, species || "all"],
    { revalidate: 30, tags: ["daily-records", "animals"] }
  )();
}

function weekLabel(offset: number) {
  if (offset === 0) return "今週";
  if (offset === 1) return "先週";
  return `${offset}週前`;
}

export default async function StoolChartPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string; species?: string }>;
}) {
  const sp = await searchParams;
  const weekOffset = Math.max(0, parseInt(sp.week ?? "0") || 0);
  const species = sp.species ?? "";

  const today = startOfDay(new Date());
  const anchor = subDays(today, weekOffset * 7);
  const dates = Array.from({ length: DAYS }, (_, i) => subDays(anchor, DAYS - 1 - i));
  const from = dates[0];

  const { animals, records } = await getChartData(format(from, "yyyy-MM-dd"), species);

  const initialData: Record<string, { stoolCondition: string | null; urineAmount: string | null; recordId: string | null }> = {};
  for (const r of records) {
    const tod = r.timeOfDay ?? "AM";
    const key = `${r.animalId}_${format(new Date(r.recordDate), "yyyy-MM-dd")}_${tod}`;
    initialData[key] = {
      stoolCondition: r.stoolCondition,
      urineAmount: r.urineAmount,
      recordId: r.id,
    };
  }

  const startLabel = format(dates[0], "M/d(E)", { locale: ja });
  const endLabel = format(dates[DAYS - 1], "M/d(E)", { locale: ja });

  const speciesTabs = [
    { value: "", label: "全体" },
    { value: "犬", label: "🐕 犬" },
    { value: "猫", label: "🐈 猫" },
  ];

  function weekUrl(w: number) {
    const p = new URLSearchParams();
    p.set("week", String(w));
    if (species) p.set("species", species);
    return `/daily-records/chart?${p.toString()}`;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">排泄チェック表</h1>
        <Link href="/daily-records" className="text-sm text-green-600 hover:underline">
          ← 日次記録へ
        </Link>
      </div>

      {/* 種別タブ */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {speciesTabs.map(({ value, label }) => (
          <Link
            key={value}
            href={`/daily-records/chart?${new URLSearchParams({ ...(value ? { species: value } : {}), week: String(weekOffset) }).toString()}`}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              species === value
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* 週ナビゲーション */}
      <div className="flex items-stretch mb-4 bg-white rounded-lg shadow-sm overflow-hidden">
        <Link
          href={weekUrl(weekOffset + 1)}
          className="flex-1 flex items-center gap-1 py-3 px-4 text-sm text-gray-600 hover:text-green-600 font-medium hover:bg-green-50 transition-colors"
        >
          ← 前の週
        </Link>
        <div className="text-center py-2 px-3 border-x border-gray-100 shrink-0">
          <div className="text-sm font-semibold text-gray-700">{weekLabel(weekOffset)}</div>
          <div className="text-xs text-gray-400">{startLabel} 〜 {endLabel}</div>
        </div>
        {weekOffset > 0 ? (
          <Link
            href={weekUrl(weekOffset - 1)}
            className="flex-1 flex items-center justify-end gap-1 py-3 px-4 text-sm text-gray-600 hover:text-green-600 font-medium hover:bg-green-50 transition-colors"
          >
            次の週 →
          </Link>
        ) : (
          <span className="flex-1 flex items-center justify-end gap-1 py-3 px-4 text-sm text-gray-300">次の週 →</span>
        )}
      </div>

      <div className="mb-3 bg-gray-50 rounded-lg p-3 text-xs text-gray-600 flex flex-wrap gap-x-4 gap-y-1">
        <span className="font-medium">タップで切替：
          （未記録）→ <span className="text-green-700 font-bold">○</span>（良好）→ <span className="text-amber-700 font-bold">△</span>（軟便/少）→ <span className="text-red-700 font-bold">×</span>（下痢）→ <span className="text-slate-500 font-bold">－</span>（出なかった）→ （未記録）
        </span>
      </div>

      <ExcretionChartClient
        animals={animals}
        dates={dates}
        initialData={initialData}
      />

      <p className="mt-3 text-xs text-gray-400">
        ※ ☀朝=AM　★夜=PM　各ボタンをタップするたびに切り替わります
      </p>
    </div>
  );
}
