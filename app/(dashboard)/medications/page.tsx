import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { format, differenceInDays, addDays } from "date-fns";
import { ja } from "date-fns/locale";
import { unstable_cache } from "next/cache";
import DeleteMedicationButton from "@/components/DeleteMedicationButton";

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
  const session = await auth();
  const role = (session?.user as { role?: string })?.role ?? "staff";
  const canEdit = role === "admin";
  const canAdd = role === "admin" || role === "staff";

  const medications = await getMedications();

  const now = new Date();
  const active = medications.filter((m) => !m.endDate || new Date(m.endDate) >= now);
  const past = medications.filter((m) => m.endDate && new Date(m.endDate) < now);

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
          {canAdd && (
            <Link
              href="/medications/new"
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
            >
              ＋ 投薬を追加
            </Link>
          )}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">投薬中 ({active.length}件)</h2>
        <MedicationList medications={active} canEdit={canEdit} />
      </div>

      {past.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-500 mb-3">過去の投薬 ({past.length}件)</h2>
          <MedicationList medications={past} dimmed canEdit={canEdit} />
        </div>
      )}
    </div>
  );
}

type MedItem = {
  id: string;
  medicineName: string;
  dosage: string | null;
  frequency: string | null;
  startDate: Date;
  endDate: Date | null;
  remainingDoses: number | null;
  openedAt: Date | null;
  expiresAfterDays: number | null;
  notes: string | null;
  animal: { id: string; name: string };
  staff: { name: string };
};

function ExpiryBadge({ openedAt, expiresAfterDays }: { openedAt: Date | null; expiresAfterDays: number | null }) {
  if (!openedAt || !expiresAfterDays) return null;
  const expiryDate = addDays(new Date(openedAt), expiresAfterDays);
  const daysLeft = differenceInDays(expiryDate, new Date());
  if (daysLeft < 0) {
    return (
      <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-xs rounded font-bold">
        期限切れ {Math.abs(daysLeft)}日前
      </span>
    );
  }
  if (daysLeft <= 7) {
    return (
      <span className="px-1.5 py-0.5 bg-orange-100 text-orange-600 text-xs rounded font-bold">
        残{daysLeft}日
      </span>
    );
  }
  return (
    <span className="px-1.5 py-0.5 bg-blue-50 text-blue-500 text-xs rounded">
      残{daysLeft}日
    </span>
  );
}

function MedicationList({
  medications,
  dimmed = false,
  canEdit,
}: {
  medications: MedItem[];
  dimmed?: boolean;
  canEdit: boolean;
}) {
  if (medications.length === 0) {
    return <p className="text-gray-400 text-sm py-2">データがありません</p>;
  }

  return (
    <>
      {/* モバイル: カードレイアウト */}
      <div className="md:hidden space-y-2">
        {medications.map((med) => {
          const expiryDate = med.openedAt && med.expiresAfterDays
            ? addDays(new Date(med.openedAt), med.expiresAfterDays)
            : null;
          return (
            <div
              key={med.id}
              className={`bg-white rounded-xl shadow-sm p-4 ${dimmed ? "opacity-60" : ""}`}
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-800 truncate">{med.medicineName}</div>
                  <Link href={`/animals/${med.animal.id}`} className="text-sm text-green-700 hover:underline">
                    {med.animal.name}
                  </Link>
                </div>
                {med.openedAt && med.expiresAfterDays && (
                  <ExpiryBadge openedAt={med.openedAt} expiresAfterDays={med.expiresAfterDays} />
                )}
              </div>
              <div className="text-xs text-gray-500 mt-1.5 flex flex-wrap gap-2">
                {med.dosage && <span>{med.dosage}</span>}
                {med.frequency && <span>{med.frequency}</span>}
                {med.remainingDoses !== null && (
                  <span className={med.remainingDoses <= 3 ? "text-red-500 font-semibold" : ""}>
                    残量: {med.remainingDoses}回
                  </span>
                )}
              </div>
              {med.openedAt && (
                <div className="text-xs text-blue-600 mt-1">
                  開封日: {format(new Date(med.openedAt), "yyyy/MM/dd", { locale: ja })}
                  {expiryDate && <span className="ml-2">期限: {format(expiryDate, "yyyy/MM/dd", { locale: ja })}</span>}
                </div>
              )}
              {med.notes && (
                <div className="text-xs text-gray-500 mt-1 italic">{med.notes}</div>
              )}
              <div className="text-xs text-gray-400 mt-1">
                {format(new Date(med.startDate), "yyyy/MM/dd", { locale: ja })} 〜{" "}
                {med.endDate ? format(new Date(med.endDate), "yyyy/MM/dd", { locale: ja }) : "継続中"}
              </div>
              {canEdit && (
                <div className="flex gap-3 mt-2 pt-2 border-t border-gray-100">
                  <Link href={`/medications/${med.id}/edit`} className="text-green-600 hover:underline text-xs">
                    編集
                  </Link>
                  <DeleteMedicationButton id={med.id} name={med.medicineName} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* デスクトップ: テーブルレイアウト */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className={dimmed ? "bg-gray-100" : "bg-green-50"}>
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">個体名</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">薬品名</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">用量 / 頻度</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">開封日 / 期限</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">開始〜終了</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">担当</th>
              {canEdit && <th className="px-4 py-3"></th>}
            </tr>
          </thead>
          <tbody>
            {medications.map((med, i) => {
              const expiryDate = med.openedAt && med.expiresAfterDays
                ? addDays(new Date(med.openedAt), med.expiresAfterDays)
                : null;
              return (
                <tr
                  key={med.id}
                  className={`border-t ${i % 2 === 0 ? "bg-white" : "bg-gray-50"} ${dimmed ? "opacity-60" : ""}`}
                >
                  <td className="px-4 py-3">
                    <Link href={`/animals/${med.animal.id}`} className="text-green-700 hover:underline">
                      {med.animal.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{med.medicineName}</div>
                    {med.notes && (
                      <div className="text-xs text-gray-500 mt-0.5 italic">{med.notes}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {med.dosage && <div>{med.dosage}</div>}
                    {med.frequency && <div>{med.frequency}</div>}
                    {med.remainingDoses !== null && (
                      <div className={med.remainingDoses <= 3 ? "text-red-500 font-semibold" : "text-gray-400"}>
                        残量: {med.remainingDoses}回
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {med.openedAt ? (
                      <div className="space-y-0.5">
                        <div className="text-gray-600">
                          開封: {format(new Date(med.openedAt), "yyyy/MM/dd", { locale: ja })}
                        </div>
                        {expiryDate && (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500">期限: {format(expiryDate, "yyyy/MM/dd", { locale: ja })}</span>
                            <ExpiryBadge openedAt={med.openedAt} expiresAfterDays={med.expiresAfterDays} />
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    <div>{format(new Date(med.startDate), "yyyy/MM/dd", { locale: ja })}</div>
                    <div>{med.endDate ? format(new Date(med.endDate), "yyyy/MM/dd", { locale: ja }) : "継続中"}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{med.staff.name}</td>
                  {canEdit && (
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link href={`/medications/${med.id}/edit`} className="text-green-600 hover:underline text-xs">
                          編集
                        </Link>
                        <DeleteMedicationButton id={med.id} name={med.medicineName} />
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
