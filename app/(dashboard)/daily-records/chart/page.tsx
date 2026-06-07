import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format, subDays, startOfDay } from "date-fns";
import ExcretionChartClient from "@/components/ExcretionChartClient";
import { unstable_cache } from "next/cache";

const DAYS = 7;

const getChartData = unstable_cache(
  async () => {
    const today = startOfDay(new Date());
    const from = subDays(today, DAYS - 1);
    const [animals, records] = await Promise.all([
      prisma.animal.findMany({
        where: { isActive: true },
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
  ["excretion-chart"],
  { revalidate: 30, tags: ["daily-records", "animals"] }
);

export default async function StoolChartPage() {
  const today = startOfDay(new Date());
  const { animals, records } = await getChartData();

  const dates = Array.from({ length: DAYS }, (_, i) => subDays(today, DAYS - 1 - i));

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

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">排泄チェック表</h1>
        <Link href="/daily-records" className="text-sm text-green-600 hover:underline">
          ← 日次記録へ
        </Link>
      </div>

      <div className="mb-3 bg-gray-50 rounded-lg p-3 text-xs text-gray-600 flex flex-wrap gap-x-4 gap-y-1">
        <span className="font-medium">タップで切替：— → <span className="text-green-600 font-bold">○</span>（良好）→ <span className="text-yellow-600 font-bold">△</span>（軟便/少）→ <span className="text-red-500 font-bold">×</span>（下痢/なし）→ —</span>
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
