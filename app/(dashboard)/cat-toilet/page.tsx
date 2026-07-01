import { prisma } from "@/lib/prisma";
import { differenceInDays, format } from "date-fns";
import { ja } from "date-fns/locale";
import CatToiletButtons from "@/components/CatToiletButtons";

const SAND_ALERT_DAYS = 30;
const SHEET_ALERT_DAYS = 7;

export default async function CatToiletPage() {
  const cats = await prisma.animal.findMany({
    where: { isActive: true, species: "猫" },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      catToiletLogs: {
        orderBy: { changedAt: "desc" },
        take: 2,
        select: { logType: true, changedAt: true },
      },
    },
  });

  const now = new Date();

  function getLastLog(logs: { logType: string; changedAt: Date }[], type: "sand" | "sheet") {
    return logs.find((l) => l.logType === type) ?? null;
  }

  function daysSince(date: Date | null): number | null {
    if (!date) return null;
    return differenceInDays(now, date);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">🐈 猫トイレ管理</h1>
      </div>

      <div className="mb-4 text-xs text-gray-500 bg-gray-50 rounded-lg px-4 py-2 flex flex-wrap gap-x-4 gap-y-1">
        <span>🟡 <span className="text-amber-700 font-medium">砂（全替）</span>：{SAND_ALERT_DAYS}日以上でアラート</span>
        <span>🟡 <span className="text-sky-700 font-medium">シーツ</span>：{SHEET_ALERT_DAYS}日以上でアラート</span>
      </div>

      {cats.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-400 text-sm">
          アクティブな猫の個体が登録されていません
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {cats.map((cat) => {
            const sandLog = getLastLog(cat.catToiletLogs, "sand");
            const sheetLog = getLastLog(cat.catToiletLogs, "sheet");
            const sandDays = daysSince(sandLog?.changedAt ?? null);
            const sheetDays = daysSince(sheetLog?.changedAt ?? null);
            const sandAlert = sandDays === null || sandDays >= SAND_ALERT_DAYS;
            const sheetAlert = sheetDays === null || sheetDays >= SHEET_ALERT_DAYS;

            return (
              <div
                key={cat.id}
                className={`bg-white rounded-xl shadow-sm p-4 border-l-4 ${
                  sandAlert || sheetAlert ? "border-red-400" : "border-green-400"
                }`}
              >
                <div className="font-bold text-gray-800 text-base mb-3">🐱 {cat.name}</div>

                {/* 砂（全替） */}
                <div className={`rounded-lg px-3 py-2 mb-2 ${sandAlert ? "bg-red-50" : "bg-amber-50"}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">🪣 猫砂（全替）</span>
                    {sandAlert && (
                      <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                        ⚠️ 要交換
                      </span>
                    )}
                  </div>
                  <div className={`text-xs mt-1 ${sandAlert ? "text-red-600" : "text-gray-500"}`}>
                    {sandLog ? (
                      <>
                        最終交換：{format(sandLog.changedAt, "M月d日(E)", { locale: ja })}
                        　<span className="font-semibold">{sandDays}日経過</span>
                      </>
                    ) : (
                      <span className="text-red-500 font-medium">記録なし ⚠️</span>
                    )}
                  </div>
                </div>

                {/* シーツ */}
                <div className={`rounded-lg px-3 py-2 ${sheetAlert ? "bg-red-50" : "bg-sky-50"}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">📋 トイレシーツ</span>
                    {sheetAlert && (
                      <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                        ⚠️ 要交換
                      </span>
                    )}
                  </div>
                  <div className={`text-xs mt-1 ${sheetAlert ? "text-red-600" : "text-gray-500"}`}>
                    {sheetLog ? (
                      <>
                        最終交換：{format(sheetLog.changedAt, "M月d日(E)", { locale: ja })}
                        　<span className="font-semibold">{sheetDays}日経過</span>
                      </>
                    ) : (
                      <span className="text-red-500 font-medium">記録なし ⚠️</span>
                    )}
                  </div>
                </div>

                <CatToiletButtons animalId={cat.id} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
