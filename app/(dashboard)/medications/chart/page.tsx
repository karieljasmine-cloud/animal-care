import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { format, subDays, startOfDay } from "date-fns";
import { ja } from "date-fns/locale";
import { revalidatePath, updateTag, unstable_cache } from "next/cache";

const DAYS = 7;

function getMedicationChartData(fromDateStr: string) {
  return unstable_cache(
    async () => {
      const from = new Date(fromDateStr);
      const now = new Date();
      return prisma.medication.findMany({
        where: {
          animal: { isActive: true },
          OR: [{ endDate: null }, { endDate: { gte: now } }],
        },
        orderBy: [{ animal: { name: "asc" } }, { medicineName: "asc" }],
        include: {
          animal: { select: { id: true, name: true } },
          logs: {
            where: { logDate: { gte: from } },
            select: { id: true, logDate: true, timeOfDay: true, staff: { select: { name: true } } },
          },
        },
      });
    },
    ["medication-chart", fromDateStr],
    { revalidate: 30, tags: ["medications"] }
  )();
}

export default async function MedicationChartPage() {
  const today = startOfDay(new Date());
  const dates = Array.from({ length: DAYS }, (_, i) => subDays(today, DAYS - 1 - i));
  const from = dates[0];

  const medications = await getMedicationChartData(format(from, "yyyy-MM-dd"));

  async function toggleLog(formData: FormData) {
    "use server";
    const sess = await auth();
    const sId = (sess?.user as { id?: string })?.id;
    const medicationId = formData.get("medicationId") as string;
    const logDate = new Date(formData.get("logDate") as string);
    const timeOfDay = formData.get("timeOfDay") as string;
    const existing = formData.get("existing") as string;

    if (existing === "true") {
      await prisma.medicationLog.deleteMany({ where: { medicationId, logDate, timeOfDay } });
      await prisma.medication.updateMany({
        where: { id: medicationId, remainingDoses: { gt: 0 } },
        data: { remainingDoses: { increment: 1 } },
      });
    } else {
      await prisma.medicationLog.create({
        data: { medicationId, logDate, timeOfDay, staffId: sId ?? null },
      });
      await prisma.medication.updateMany({
        where: { id: medicationId, remainingDoses: { gt: 0 } },
        data: { remainingDoses: { decrement: 1 } },
      });
    }
    updateTag("medications");
    revalidatePath("/medications/chart");
  }

  type LogInfo = { staffName: string | null };
  const logMap = new Map<string, LogInfo>();
  for (const med of medications) {
    for (const log of med.logs) {
      const key = `${med.id}_${format(new Date(log.logDate), "yyyy-MM-dd")}_${log.timeOfDay}`;
      logMap.set(key, { staffName: log.staff?.name ?? null });
    }
  }

  const times = ["AM", "PM"];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">投薬チェック表</h1>
        <Link href="/medications" className="text-sm text-green-600 hover:underline">
          ← 投薬記録一覧へ
        </Link>
      </div>

      <div className="mb-3 flex flex-wrap gap-4 text-sm">
        <span className="flex items-center gap-1">
          <span className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs">✓</span>
          投与済み（スタッフ名表示）
        </span>
        <span className="flex items-center gap-1">
          <span className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center text-xs"></span>
          未投与（クリックで記録）
        </span>
        <span className="flex items-center gap-1">
          <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-xs rounded font-bold">残少</span>
          残量3回以下で赤表示
        </span>
      </div>

      {medications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-400">
          現在投薬中の個体はいません
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
          <table className="text-sm border-collapse min-w-max">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-green-50 px-4 py-2 text-left font-medium text-gray-600 border-b border-r min-w-[100px]">
                  個体
                </th>
                <th className="sticky left-[100px] z-10 bg-green-50 px-4 py-2 text-left font-medium text-gray-600 border-b border-r min-w-[180px]">
                  薬品名 / 用量・頻度
                </th>
                {dates.map((d) => (
                  <th
                    key={d.toISOString()}
                    colSpan={2}
                    className="px-2 py-2 text-center font-medium text-gray-600 border-b border-r"
                  >
                    <div className="text-xs text-gray-400">{format(d, "M/d", { locale: ja })}</div>
                    <div className="text-xs">{format(d, "(E)", { locale: ja })}</div>
                  </th>
                ))}
              </tr>
              <tr>
                <th className="sticky left-0 z-10 bg-green-50 border-b border-r"></th>
                <th className="sticky left-[100px] z-10 bg-green-50 border-b border-r"></th>
                {dates.map((d) =>
                  times.map((t) => (
                    <th
                      key={`${d.toISOString()}_${t}`}
                      className={`px-2 py-1 text-center text-xs font-medium border-b border-r w-16 ${
                        t === "AM" ? "text-orange-400" : "text-indigo-400"
                      }`}
                    >
                      {t === "AM" ? "☀朝" : "★夜"}
                    </th>
                  ))
                )}
              </tr>
            </thead>
            <tbody>
              {medications.map((med, i) => {
                const isLow = med.remainingDoses !== null && med.remainingDoses <= 3;
                return (
                  <tr key={med.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                    <td className="sticky left-0 z-10 bg-inherit px-4 py-2 font-medium text-gray-800 border-b border-r">
                      {med.animal.name}
                    </td>
                    <td className="sticky left-[100px] z-10 bg-inherit px-4 py-2 border-b border-r">
                      <div className="font-medium text-gray-800">{med.medicineName}</div>
                      {(med.dosage || med.frequency) && (
                        <div className="text-xs text-gray-400">
                          {[med.dosage, med.frequency].filter(Boolean).join(" · ")}
                        </div>
                      )}
                      {med.remainingDoses !== null && (
                        <div className={`text-xs mt-0.5 font-semibold ${isLow ? "text-red-500" : "text-gray-400"}`}>
                          残量: {med.remainingDoses}回{isLow && " ⚠️"}
                        </div>
                      )}
                    </td>
                    {dates.map((d) =>
                      times.map((t) => {
                        const dateStr = format(d, "yyyy-MM-dd");
                        const key = `${med.id}_${dateStr}_${t}`;
                        const logInfo = logMap.get(key);
                        const given = !!logInfo;
                        const isFuture = d > today;
                        return (
                          <td key={key} className="px-1 py-2 text-center border-b border-r">
                            {isFuture ? (
                              <span className="w-8 h-8 flex items-center justify-center mx-auto text-gray-200 text-xs">—</span>
                            ) : (
                              <form action={toggleLog}>
                                <input type="hidden" name="medicationId" value={med.id} />
                                <input type="hidden" name="logDate" value={`${dateStr}T00:00:00`} />
                                <input type="hidden" name="timeOfDay" value={t} />
                                <input type="hidden" name="existing" value={given ? "true" : "false"} />
                                <button
                                  type="submit"
                                  title={
                                    given
                                      ? `${logInfo.staffName ?? "不明"}が投与 — 取り消す`
                                      : "投与済みにする"
                                  }
                                  className={`w-11 h-11 rounded-full border-2 flex flex-col items-center justify-center mx-auto transition-colors cursor-pointer ${
                                    given
                                      ? "bg-green-500 border-green-500 text-white hover:bg-red-400 hover:border-red-400"
                                      : "border-gray-300 text-gray-300 hover:border-green-400 hover:text-green-400"
                                  }`}
                                >
                                  <span className="text-sm font-bold leading-none">{given ? "✓" : ""}</span>
                                  {given && logInfo.staffName && (
                                    <span className="text-[9px] leading-none mt-0.5 truncate max-w-[36px]">
                                      {logInfo.staffName.slice(0, 3)}
                                    </span>
                                  )}
                                </button>
                              </form>
                            )}
                          </td>
                        );
                      })
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-3 text-xs text-gray-400">
        ※ ☀朝=AM　★夜=PM　ボタンをクリックで投与済み/未投与を切り替えできます。ホバーで投与スタッフ名を確認できます。
      </p>
    </div>
  );
}
