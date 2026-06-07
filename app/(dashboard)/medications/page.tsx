import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { unstable_cache } from "next/cache";

const getMedications = unstable_cache(
  () =>
    prisma.medication.findMany({
      orderBy: { startDate: "desc" },
      include: {
        animal: { select: { id: true, name: true } },
        staff: { select: { name: true } },
      },
    }),
  ["medications-list"],
  { revalidate: 60, tags: ["medications"] }
);

export default async function MedicationsPage() {
  const medications = await getMedications();

  const active = medications.filter((m) => !m.endDate || new Date(m.endDate) >= new Date());
  const past = medications.filter((m) => m.endDate && new Date(m.endDate) < new Date());

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">投薬記録</h1>
        <div className="flex gap-2 flex-wrap">
          <Link
            href="/medications/chart"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
          >
            📋 投薬チェック表
          </Link>
          <Link
            href="/medications/new"
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
          >
            ＋ 投薬を追加
          </Link>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">投薬中 ({active.length}件)</h2>
        <MedicationList medications={active} />
      </div>

      {past.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-500 mb-3">過去の投薬 ({past.length}件)</h2>
          <MedicationList medications={past} dimmed />
        </div>
      )}
    </div>
  );
}

function MedicationList({
  medications,
  dimmed = false,
}: {
  medications: Array<{
    id: string;
    medicineName: string;
    dosage: string | null;
    frequency: string | null;
    startDate: Date;
    endDate: Date | null;
    administeredAt: Date | null;
    notes: string | null;
    animal: { id: string; name: string };
    staff: { name: string };
  }>;
  dimmed?: boolean;
}) {
  if (medications.length === 0) {
    return <p className="text-gray-400 text-sm py-2">データがありません</p>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className={dimmed ? "bg-gray-100" : "bg-green-50"}>
          <tr>
            <th className="text-left px-4 py-3 font-medium text-gray-600">個体名</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">薬品名</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">用量</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">頻度</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">開始日</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">終了日</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">担当</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {medications.map((med, i) => (
            <tr
              key={med.id}
              className={`border-t ${i % 2 === 0 ? "bg-white" : "bg-gray-50"} ${dimmed ? "opacity-60" : ""}`}
            >
              <td className="px-4 py-3">
                <Link href={`/animals/${med.animal.id}`} className="text-green-700 hover:underline">
                  {med.animal.name}
                </Link>
              </td>
              <td className="px-4 py-3 font-medium text-gray-800">{med.medicineName}</td>
              <td className="px-4 py-3 text-gray-600">{med.dosage ?? "-"}</td>
              <td className="px-4 py-3 text-gray-600">{med.frequency ?? "-"}</td>
              <td className="px-4 py-3 text-gray-600">
                {format(new Date(med.startDate), "yyyy/MM/dd", { locale: ja })}
              </td>
              <td className="px-4 py-3 text-gray-600">
                {med.endDate ? format(new Date(med.endDate), "yyyy/MM/dd", { locale: ja }) : "継続中"}
              </td>
              <td className="px-4 py-3 text-gray-500">{med.staff.name}</td>
              <td className="px-4 py-3">
                <Link href={`/medications/${med.id}/edit`} className="text-green-600 hover:underline text-xs">
                  編集
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
