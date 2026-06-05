import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format, subDays, startOfDay } from "date-fns";
import { ja } from "date-fns/locale";

const DAYS = 7;

function stoolColor(condition: string | null): string {
  if (!condition || condition === "なし") return "text-gray-300";
  if (condition.includes("良")) return "text-green-600 font-bold";
  if (condition.includes("軟")) return "text-yellow-600 font-bold";
  if (condition.includes("下痢") || condition.includes("血")) return "text-red-600 font-bold";
  return "text-gray-500";
}

function stoolSymbol(condition: string | null): string {
  if (!condition) return "—";
  if (condition === "なし") return "無";
  if (condition.includes("良")) return "○";
  if (condition.includes("軟")) return "△";
  if (condition.includes("下痢") || condition.includes("血")) return "×";
  return condition.slice(0, 2);
}

function urineSymbol(amount: string | null): string {
  if (!amount) return "—";
  if (amount === "多い") return "多";
  if (amount === "普通") return "普";
  if (amount === "少ない") return "少";
  if (amount === "なし") return "無";
  return amount.slice(0, 2);
}

function urineColor(amount: string | null): string {
  if (!amount || amount === "なし") return "text-gray-300";
  if (amount === "多い") return "text-blue-600";
  if (amount === "普通") return "text-blue-400";
  if (amount === "少ない") return "text-orange-400";
  return "text-gray-400";
}

export default async function StoolChartPage() {
  const today = startOfDay(new Date());
  const from = subDays(today, DAYS - 1);

  const animals = await prisma.animal.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const records = await prisma.dailyRecord.findMany({
    where: { recordDate: { gte: from } },
    select: {
      animalId: true,
      recordDate: true,
      stoolCondition: true,
      urineAmount: true,
      timeOfDay: true,
      id: true,
    },
  });

  const dates = Array.from({ length: DAYS }, (_, i) => subDays(today, DAYS - 1 - i));

  type Entry = { stoolCondition: string | null; urineAmount: string | null; id: string };
  const map = new Map<string, Entry>();
  for (const r of records) {
    const tod = r.timeOfDay ?? "AM";
    const key = `${r.animalId}_${format(new Date(r.recordDate), "yyyy-MM-dd")}_${tod}`;
    map.set(key, {
      stoolCondition: r.stoolCondition,
      urineAmount: r.urineAmount,
      id: r.id,
    });
  }

  const times = ["AM", "PM"] as const;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">排泄チェック表</h1>
        <Link href="/daily-records" className="text-sm text-green-600 hover:underline">
          ← 日次記録一覧へ
        </Link>
      </div>

      <div className="mb-3 flex flex-wrap gap-4 text-sm">
        <span className="flex items-center gap-1 font-medium text-gray-600">便:</span>
        <span className="flex items-center gap-1"><span className="text-green-600 font-bold">○</span> 良好</span>
        <span className="flex items-center gap-1"><span className="text-yellow-600 font-bold">△</span> 軟便</span>
        <span className="flex items-center gap-1"><span className="text-red-600 font-bold">×</span> 下痢/血便</span>
        <span className="mx-2 text-gray-300">|</span>
        <span className="flex items-center gap-1 font-medium text-gray-600">尿:</span>
        <span className="flex items-center gap-1"><span className="text-blue-600">多</span> 多い</span>
        <span className="flex items-center gap-1"><span className="text-blue-400">普</span> 普通</span>
        <span className="flex items-center gap-1"><span className="text-orange-400">少</span> 少ない</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="text-sm border-collapse min-w-max">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-green-50 px-4 py-3 text-left font-medium text-gray-600 border-b border-r min-w-[120px]">
                個体名
              </th>
              {dates.map((d) => (
                <th
                  key={d.toISOString()}
                  colSpan={2}
                  className="px-2 py-3 text-center font-medium text-gray-600 border-b border-r"
                >
                  <div className="text-xs text-gray-400">{format(d, "M/d", { locale: ja })}</div>
                  <div className="text-xs">{format(d, "(E)", { locale: ja })}</div>
                </th>
              ))}
            </tr>
            <tr>
              <th className="sticky left-0 z-10 bg-green-50 border-b border-r"></th>
              {dates.map((d) =>
                times.map((t) => (
                  <th
                    key={`${d.toISOString()}_${t}`}
                    className={`px-2 py-1 text-center text-xs font-medium border-b border-r w-14 ${
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
            {animals.map((animal, i) => (
              <tr key={animal.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                <td className="sticky left-0 z-10 bg-inherit px-4 py-2 font-medium text-gray-800 border-b border-r">
                  {animal.name}
                </td>
                {dates.map((d) =>
                  times.map((t) => {
                    const dateStr = format(d, "yyyy-MM-dd");
                    const key = `${animal.id}_${dateStr}_${t}`;
                    const entry = map.get(key);
                    return (
                      <td key={`${d.toISOString()}_${t}`} className="px-1 py-1 text-center border-b border-r">
                        {entry ? (
                          <Link
                            href={`/daily-records/${entry.id}/edit`}
                            title={`便: ${entry.stoolCondition ?? "未記録"} / 尿: ${entry.urineAmount ?? "未記録"}`}
                            className="flex flex-col items-center gap-0.5 px-1 py-1 rounded hover:bg-gray-100 transition-colors min-w-[48px]"
                          >
                            <span className={`text-xs leading-none ${stoolColor(entry.stoolCondition)}`}>
                              便{stoolSymbol(entry.stoolCondition)}
                            </span>
                            <span className={`text-xs leading-none ${urineColor(entry.urineAmount)}`}>
                              尿{urineSymbol(entry.urineAmount)}
                            </span>
                          </Link>
                        ) : (
                          <Link
                            href={`/daily-records/new?animalId=${animal.id}&date=${dateStr}&timeOfDay=${t}`}
                            title="記録を追加"
                            className="flex items-center justify-center w-10 h-10 rounded hover:bg-green-50 text-gray-300 hover:text-green-500 transition-colors mx-auto text-lg"
                          >
                            +
                          </Link>
                        )}
                      </td>
                    );
                  })
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-gray-400">
        ※ ☀朝=AM　★夜=PM　セルをクリックすると編集、「+」をクリックすると新規記録を追加できます
      </p>
    </div>
  );
}
