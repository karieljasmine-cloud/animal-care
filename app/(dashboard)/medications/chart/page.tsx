import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { format, subDays, startOfDay, addDays, differenceInDays } from "date-fns";
import { ja } from "date-fns/locale";
import { unstable_cache } from "next/cache";
import ToggleLogButton from "@/components/ToggleLogButton";

const SPECIES_ORDER = ["犬", "猫", "うさぎ", "その他"];
const SPECIES_ICON: Record<string, string> = { 犬: "🐕", 猫: "🐈", うさぎ: "🐇", その他: "🐾" };

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
        select: {
          id: true, medicineName: true, dosage: true, frequency: true,
          remainingDoses: true, openedAt: true, expiresAfterDays: true, notes: true,
          animal: { select: { id: true, name: true, species: true } },
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

function weekLabel(offset: number) {
  if (offset === 0) return "今週";
  if (offset === 1) return "先週";
  return `${offset}週前`;
}

export default async function MedicationChartPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const [sp, session] = await Promise.all([searchParams, auth()]);
  const weekOffset = Math.max(0, parseInt(sp.week ?? "0") || 0);
  const isAdmin = (session?.user as { role?: string })?.role === "admin";

  const today = startOfDay(new Date());
  const anchor = subDays(today, weekOffset * 7);
  const dates = Array.from({ length: DAYS }, (_, i) => subDays(anchor, DAYS - 1 - i));
  const from = dates[0];

  const rawMedications = await getMedicationChartData(format(from, "yyyy-MM-dd"));
  const medications = [...rawMedications].sort((a, b) => {
    const si = (s: string) => { const i = SPECIES_ORDER.indexOf(s); return i >= 0 ? i : SPECIES_ORDER.length; };
    const dr = si(a.animal.species) - si(b.animal.species);
    if (dr !== 0) return dr;
    if (a.animal.name !== b.animal.name) return a.animal.name.localeCompare(b.animal.name, "ja");
    return a.medicineName.localeCompare(b.medicineName, "ja");
  });

  type LogInfo = { staffName: string | null };
  const logMap = new Map<string, LogInfo>();
  for (const med of medications) {
    for (const log of med.logs) {
      const key = `${med.id}_${format(new Date(log.logDate), "yyyy-MM-dd")}_${log.timeOfDay}`;
      logMap.set(key, { staffName: log.staff?.name ?? null });
    }
  }

  const times = ["AM", "PM"];
  const startLabel = format(dates[0], "M/d(E)", { locale: ja });
  const endLabel = format(dates[DAYS - 1], "M/d(E)", { locale: ja });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">投薬チェック表</h1>
        <div className="flex gap-2 flex-wrap">
          <Link href="/medications" className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200">
            📋 投薬一覧
          </Link>
          {isAdmin && (
            <Link href="/medications/new" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
              ＋ 投薬を追加
            </Link>
          )}
        </div>
      </div>

      {/* 週ナビゲーション */}
      <div className="flex items-center justify-between mb-4 bg-white rounded-lg shadow-sm px-4 py-2">
        <Link
          href={`/medications/chart?week=${weekOffset + 1}`}
          className="text-sm text-gray-600 hover:text-green-600 font-medium px-3 py-1.5 rounded hover:bg-green-50 transition-colors"
        >
          ← 前の週
        </Link>
        <div className="text-center">
          <div className="text-sm font-semibold text-gray-700">{weekLabel(weekOffset)}</div>
          <div className="text-xs text-gray-400">{startLabel} 〜 {endLabel}</div>
        </div>
        {weekOffset > 0 ? (
          <Link
            href={`/medications/chart?week=${weekOffset - 1}`}
            className="text-sm text-gray-600 hover:text-green-600 font-medium px-3 py-1.5 rounded hover:bg-green-50 transition-colors"
          >
            次の週 →
          </Link>
        ) : (
          <span className="text-sm text-gray-300 px-3 py-1.5">次の週 →</span>
        )}
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
                <th className="sticky left-0 z-10 bg-green-50 px-2 sm:px-4 py-2 text-left font-medium text-gray-600 border-b border-r min-w-[72px] sm:min-w-[100px]">
                  個体
                </th>
                <th className="sticky left-[72px] sm:left-[100px] z-10 bg-green-50 px-2 sm:px-4 py-2 text-left font-medium text-gray-600 border-b border-r min-w-[140px] sm:min-w-[180px] max-w-[140px] sm:max-w-[180px]">
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
                <th className="sticky left-0 z-10 bg-green-50 border-b border-r min-w-[72px] sm:min-w-[100px]"></th>
                <th className="sticky left-[72px] sm:left-[100px] z-10 bg-green-50 border-b border-r min-w-[140px] sm:min-w-[180px] max-w-[140px] sm:max-w-[180px]"></th>
                {dates.map((d) =>
                  times.map((t) => (
                    <th
                      key={`${d.toISOString()}_${t}`}
                      className={`px-1 py-1 text-center text-xs font-medium border-b border-r w-14 sm:w-16 ${
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
                const isFirstOfSpecies = i === 0 || medications[i - 1].animal.species !== med.animal.species;
                return (
                  <tr key={med.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="sticky left-0 z-10 bg-inherit px-2 sm:px-4 py-2 font-medium text-gray-800 border-b border-r text-xs sm:text-sm">
                      {isFirstOfSpecies && (
                        <div className="text-xs text-gray-400 font-normal -mt-0.5 mb-0.5">
                          {SPECIES_ICON[med.animal.species] ?? "🐾"} {med.animal.species}
                        </div>
                      )}
                      {med.animal.name}
                    </td>
                    <td className="sticky left-[72px] sm:left-[100px] z-10 bg-inherit px-2 sm:px-4 py-2 border-b border-r min-w-[140px] sm:min-w-[180px] max-w-[140px] sm:max-w-[180px]">
                      <div className="font-medium text-gray-800 text-xs sm:text-sm">{med.medicineName}</div>
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
                      {med.notes && (
                        <div className="text-xs text-gray-500 mt-0.5 italic overflow-hidden" style={{display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>{med.notes}</div>
                      )}
                      {med.openedAt && med.expiresAfterDays && (() => {
                        const expiryDate = addDays(new Date(med.openedAt!), med.expiresAfterDays!);
                        const daysLeft = differenceInDays(expiryDate, today);
                        return (
                          <div className={`text-xs mt-0.5 font-semibold ${daysLeft < 0 ? "text-red-500" : daysLeft <= 7 ? "text-orange-500" : "text-blue-500"}`}>
                            {daysLeft < 0 ? `期限切れ ${Math.abs(daysLeft)}日前 ⚠️` : `開封後残${daysLeft}日`}
                          </div>
                        );
                      })()}
                    </td>
                    {dates.map((d) =>
                      times.map((t) => {
                        const dateStr = format(d, "yyyy-MM-dd");
                        const key = `${med.id}_${dateStr}_${t}`;
                        const logInfo = logMap.get(key);
                        const given = !!logInfo;
                        const isFuture = d > today;
                        return (
                          <td key={key} className="px-0.5 py-1.5 text-center border-b border-r">
                            {isFuture ? (
                              <span className="w-10 h-10 flex items-center justify-center mx-auto text-gray-200 text-xs">—</span>
                            ) : (
                              <ToggleLogButton
                                medicationId={med.id}
                                logDate={`${dateStr}T00:00:00`}
                                timeOfDay={t}
                                initialGiven={given}
                                staffName={logInfo?.staffName ?? null}
                              />
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
