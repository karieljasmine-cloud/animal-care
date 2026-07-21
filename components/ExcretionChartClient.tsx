"use client";

import { useState } from "react";
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

const TIMES = ["AM", "PM"] as const;

function stoolCls(v: string | null) {
  if (!v) return "text-gray-400 bg-gray-50 border-gray-200";
  if (v === "良好") return "text-green-900 bg-green-100 border-green-400";
  if (v === "軟便") return "text-amber-900 bg-amber-100 border-amber-400";
  if (v === "下痢") return "text-red-900 bg-red-100 border-red-500";
  return "text-slate-700 bg-slate-100 border-slate-400";
}
function urineCls(v: string | null) {
  if (!v) return "text-gray-400 bg-gray-50 border-gray-200";
  if (v === "普通") return "text-blue-900 bg-blue-100 border-blue-400";
  if (v === "少ない") return "text-orange-900 bg-orange-100 border-orange-400";
  return "text-slate-700 bg-slate-100 border-slate-400";
}

export default function ExcretionChartClient({ animals, dates, initialData }: Props) {
  const [data, setData] = useState<Record<string, CellData>>(initialData);
  const [pendingKeys, setPendingKeys] = useState<Set<string>>(new Set());

  const handleChange = (
    animalId: string,
    dateStr: string,
    timeOfDay: string,
    field: "stool" | "urine",
    rawValue: string
  ) => {
    const newValue = rawValue === "" ? null : rawValue;
    const baseKey = `${animalId}_${dateStr}_${timeOfDay}`;
    const pendingKey = `${baseKey}_${field}`;

    const current = data[baseKey] ?? { stoolCondition: null, urineAmount: null, recordId: null };

    setData(prev => ({
      ...prev,
      [baseKey]: {
        ...current,
        [field === "stool" ? "stoolCondition" : "urineAmount"]: newValue,
      },
    }));
    setPendingKeys(prev => new Set([...prev, pendingKey]));

    quickUpdateExcretion(animalId, dateStr, timeOfDay, field, newValue)
      .then(result => {
        setData(prev => ({
          ...prev,
          [baseKey]: {
            stoolCondition: result.stoolCondition,
            urineAmount: result.urineAmount,
            recordId: result.recordId,
          },
        }));
      })
      .catch(() => {
        setData(prev => ({ ...prev, [baseKey]: current }));
      })
      .finally(() => {
        setPendingKeys(prev => {
          const next = new Set(prev);
          next.delete(pendingKey);
          return next;
        });
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
                  className={`px-1 py-1 text-center text-xs font-medium border-b border-r min-w-[82px] ${
                    t === "AM" ? "text-orange-400 bg-orange-50" : "text-indigo-400 bg-indigo-50"
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
            <tr key={animal.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="sticky left-0 z-10 bg-inherit px-2 py-1 font-medium text-gray-800 border-b border-r text-sm whitespace-nowrap">
                {animal.name}
              </td>
              {dates.map((d) =>
                TIMES.map((t) => {
                  const dateStr = format(d, "yyyy-MM-dd");
                  const key = `${animal.id}_${dateStr}_${t}`;
                  const cell = data[key] ?? { stoolCondition: null, urineAmount: null, recordId: null };
                  const stoolPending = pendingKeys.has(`${key}_stool`);
                  const urinePending = pendingKeys.has(`${key}_urine`);
                  return (
                    <td key={`${d.toISOString()}_${t}`} className="px-1 py-1.5 border-b border-r">
                      <div className="flex flex-col gap-1 w-[78px]">
                        <div className="flex items-center gap-0.5">
                          <span className="text-[9px] text-gray-400 w-3 shrink-0">便</span>
                          <select
                            value={cell.stoolCondition ?? ""}
                            onChange={(e) => handleChange(animal.id, dateStr, t, "stool", e.target.value)}
                            disabled={stoolPending}
                            className={`w-full text-xs font-bold rounded border py-1 px-0.5 cursor-pointer disabled:opacity-50 ${stoolCls(cell.stoolCondition)}`}
                          >
                            <option value="">未記録</option>
                            <option value="良好">○ 良好</option>
                            <option value="軟便">△ 軟便</option>
                            <option value="下痢">× 下痢</option>
                            <option value="なし">－ なし</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-0.5">
                          <span className="text-[9px] text-gray-400 w-3 shrink-0">尿</span>
                          <select
                            value={cell.urineAmount ?? ""}
                            onChange={(e) => handleChange(animal.id, dateStr, t, "urine", e.target.value)}
                            disabled={urinePending}
                            className={`w-full text-xs font-bold rounded border py-1 px-0.5 cursor-pointer disabled:opacity-50 ${urineCls(cell.urineAmount)}`}
                          >
                            <option value="">未記録</option>
                            <option value="普通">○ 普通</option>
                            <option value="少ない">△ 少ない</option>
                            <option value="なし">－ なし</option>
                          </select>
                        </div>
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
