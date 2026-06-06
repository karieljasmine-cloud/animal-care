"use client";

import { useTransition, useState } from "react";
import { quickUpdateExcretion } from "@/app/actions/daily-records";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

type CellData = {
  stoolCondition: string | null;
  urineAmount: string | null;
  recordId: string | null;
};

type Props = {
  animals: { id: string; name: string }[];
  dates: Date[];
  initialData: Record<string, CellData>;
};

const STOOL_CYCLE: (string | null)[] = [null, "良好", "軟便", "下痢"];
const URINE_CYCLE: (string | null)[] = [null, "普通", "少ない", "なし"];
const TIMES = ["AM", "PM"] as const;

function stoolSym(v: string | null) {
  if (!v) return "—";
  if (v === "良好") return "○";
  if (v === "軟便") return "△";
  return "×";
}
function urineSym(v: string | null) {
  if (!v) return "—";
  if (v === "普通") return "○";
  if (v === "少ない") return "△";
  return "×";
}
function stoolCls(v: string | null) {
  if (!v) return "text-gray-300 bg-gray-50";
  if (v === "良好") return "text-green-600 bg-green-50 border border-green-200";
  if (v === "軟便") return "text-yellow-600 bg-yellow-50 border border-yellow-200";
  return "text-red-500 bg-red-50 border border-red-200";
}
function urineCls(v: string | null) {
  if (!v) return "text-gray-300 bg-gray-50";
  if (v === "普通") return "text-blue-500 bg-blue-50 border border-blue-200";
  if (v === "少ない") return "text-orange-400 bg-orange-50 border border-orange-200";
  return "text-red-400 bg-red-50 border border-red-200";
}

export default function ExcretionChartClient({ animals, dates, initialData }: Props) {
  const [data, setData] = useState<Record<string, CellData>>(initialData);
  const [isPending, startTransition] = useTransition();

  const handleClick = (
    animalId: string,
    dateStr: string,
    timeOfDay: string,
    field: "stool" | "urine"
  ) => {
    const key = `${animalId}_${dateStr}_${timeOfDay}`;
    const current = data[key] ?? { stoolCondition: null, urineAmount: null, recordId: null };
    const currentValue = field === "stool" ? current.stoolCondition : current.urineAmount;
    const cycle = field === "stool" ? STOOL_CYCLE : URINE_CYCLE;
    const nextValue = cycle[(cycle.indexOf(currentValue) + 1) % cycle.length];

    setData(prev => ({
      ...prev,
      [key]: {
        ...current,
        [field === "stool" ? "stoolCondition" : "urineAmount"]: nextValue,
      },
    }));

    startTransition(async () => {
      try {
        const result = await quickUpdateExcretion(animalId, dateStr, timeOfDay, field, currentValue);
        setData(prev => ({
          ...prev,
          [key]: {
            stoolCondition: result.stoolCondition,
            urineAmount: result.urineAmount,
            recordId: result.recordId,
          },
        }));
      } catch {
        setData(prev => ({ ...prev, [key]: current }));
      }
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
      <table className="text-sm border-collapse">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-green-50 px-3 py-2 text-left font-medium text-gray-600 border-b border-r min-w-[72px]">
              個体
            </th>
            {dates.map((d) => (
              <th
                key={d.toISOString()}
                colSpan={2}
                className="px-2 py-2 text-center font-medium text-gray-600 border-b border-r"
              >
                <div className="text-xs font-bold text-gray-600">{format(d, "M/d", { locale: ja })}</div>
                <div className="text-xs text-gray-400">{format(d, "(E)", { locale: ja })}</div>
              </th>
            ))}
          </tr>
          <tr>
            <th className="sticky left-0 z-10 bg-green-50 border-b border-r" />
            {dates.map((d) =>
              TIMES.map((t) => (
                <th
                  key={`${d.toISOString()}_${t}`}
                  className={`px-1 py-1 text-center text-xs font-medium border-b border-r min-w-[56px] ${
                    t === "AM" ? "text-orange-400 bg-orange-50/40" : "text-indigo-400 bg-indigo-50/40"
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
            <tr key={animal.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/40"}>
              <td className="sticky left-0 z-10 bg-inherit px-2 py-1 font-medium text-gray-800 border-b border-r text-sm whitespace-nowrap">
                {animal.name}
              </td>
              {dates.map((d) =>
                TIMES.map((t) => {
                  const dateStr = format(d, "yyyy-MM-dd");
                  const key = `${animal.id}_${dateStr}_${t}`;
                  const cell = data[key] ?? { stoolCondition: null, urineAmount: null, recordId: null };
                  return (
                    <td key={`${d.toISOString()}_${t}`} className="px-1 py-1 border-b border-r">
                      <div className="flex flex-col gap-0.5 w-[54px]">
                        <button
                          onClick={() => handleClick(animal.id, dateStr, t, "stool")}
                          disabled={isPending}
                          className={`w-full h-[42px] rounded flex items-center justify-center gap-0.5 font-bold text-lg transition-all active:scale-95 disabled:opacity-50 ${stoolCls(cell.stoolCondition)}`}
                        >
                          <span className="text-[9px] font-normal text-gray-400 leading-none">便</span>
                          <span className="leading-none">{stoolSym(cell.stoolCondition)}</span>
                        </button>
                        <button
                          onClick={() => handleClick(animal.id, dateStr, t, "urine")}
                          disabled={isPending}
                          className={`w-full h-[42px] rounded flex items-center justify-center gap-0.5 font-bold text-lg transition-all active:scale-95 disabled:opacity-50 ${urineCls(cell.urineAmount)}`}
                        >
                          <span className="text-[9px] font-normal text-gray-400 leading-none">尿</span>
                          <span className="leading-none">{urineSym(cell.urineAmount)}</span>
                        </button>
                      </div>
                    </td>
                  );
                })
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
