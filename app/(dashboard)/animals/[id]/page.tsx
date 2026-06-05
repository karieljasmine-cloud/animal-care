import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import DeleteAnimalButton from "@/components/DeleteAnimalButton";

import { auth } from "@/lib/auth";

export default async function AnimalDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const session = await auth();
  const role = (session?.user as { role?: string })?.role ?? "staff";
  if (role === "staff") {
    const { redirect } = await import("next/navigation");
    redirect("/daily-records");
  }
  const canEdit = role === "admin";

  const animal = await prisma.animal.findUnique({
    where: { id },
    include: {
      vaccines: { orderBy: { vaccinatedAt: "desc" } },
      weightRecords: { orderBy: { recordedAt: "desc" }, take: 10 },
      dailyRecords: {
        orderBy: { recordDate: "desc" },
        take: 5,
        include: { staff: { select: { name: true } } },
      },
      medications: {
        orderBy: { startDate: "desc" },
        include: { staff: { select: { name: true } } },
      },
    },
  });

  if (!animal) notFound();

  const fmt = (d: Date | null | undefined) =>
    d ? format(new Date(d), "yyyy年MM月dd日", { locale: ja }) : "-";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <Link href="/animals" className="text-green-600 text-sm hover:underline">
            ← 個体台帳へ戻る
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 mt-1 flex items-center gap-2">
            {animal.name}
            {!animal.isActive && (
              <span className="text-sm bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">退籍済み</span>
            )}
          </h1>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/animals/${id}/edit`}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
            >
              編集
            </Link>
            <DeleteAnimalButton id={id} name={animal.name} />
          </div>
        )}
      </div>

      {/* 基本情報 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-semibold text-gray-700 mb-4 border-b pb-2">基本情報</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <Info label="種類" value={animal.species} />
          <Info label="品種" value={animal.breed} />
          <Info label="性別" value={animal.sex === "male" ? "♂ オス" : "♀ メス"} />
          <Info label="生年月日" value={fmt(animal.birthDate)} />
          <Info label="受け入れ日" value={fmt(animal.intakeDate)} />
          <Info label="繁殖者・譲渡元" value={animal.breederName} />
          <Info label="持病" value={animal.conditions} fullWidth />
          {animal.transferDate && (
            <>
              <Info label="譲渡日" value={fmt(animal.transferDate)} />
              <Info label="譲渡先" value={animal.transferTo} />
            </>
          )}
          {animal.deathDate && (
            <>
              <Info label="死亡日" value={fmt(animal.deathDate)} />
              <Info label="死亡原因" value={animal.deathCause} />
            </>
          )}
          {animal.notes && <Info label="備考" value={animal.notes} fullWidth />}
        </div>
      </div>

      {/* 体重記録 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-gray-700">体重記録</h2>
          <Link
            href={`/animals/${id}/weight/new`}
            className="text-sm text-green-600 hover:underline"
          >
            ＋ 体重を記録
          </Link>
        </div>
        {animal.weightRecords.length === 0 ? (
          <p className="text-gray-400 text-sm">記録がありません</p>
        ) : (
          <div className="space-y-2">
            {animal.weightRecords.map((w) => (
              <div key={w.id} className="flex items-center gap-4 text-sm">
                <span className="text-gray-500 w-28">
                  {format(new Date(w.recordedAt), "yyyy/MM/dd")}
                </span>
                <span className="font-semibold text-gray-800">{w.weight} kg</span>
                {w.notes && <span className="text-gray-400">{w.notes}</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ワクチン */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-gray-700">接種ワクチン</h2>
          <Link
            href={`/animals/${id}/vaccine/new`}
            className="text-sm text-green-600 hover:underline"
          >
            ＋ ワクチンを追加
          </Link>
        </div>
        {animal.vaccines.length === 0 ? (
          <p className="text-gray-400 text-sm">記録がありません</p>
        ) : (
          <div className="space-y-2">
            {animal.vaccines.map((v) => (
              <div key={v.id} className="flex items-center gap-4 text-sm">
                <span className="font-medium text-gray-800 w-40">{v.vaccineName}</span>
                <span className="text-gray-500">
                  接種: {format(new Date(v.vaccinatedAt), "yyyy/MM/dd")}
                </span>
                {v.nextDueDate && (
                  <span className="text-orange-500">
                    次回: {format(new Date(v.nextDueDate), "yyyy/MM/dd")}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 最近の日次記録 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-gray-700">最近の日次記録</h2>
          <Link
            href={`/daily-records?animalId=${id}`}
            className="text-sm text-green-600 hover:underline"
          >
            全て見る
          </Link>
        </div>
        {animal.dailyRecords.length === 0 ? (
          <p className="text-gray-400 text-sm">記録がありません</p>
        ) : (
          <div className="space-y-2">
            {animal.dailyRecords.map((r) => (
              <div key={r.id} className="flex items-center gap-4 text-sm border-b last:border-0 pb-2">
                <span className="text-gray-500 w-28">
                  {format(new Date(r.recordDate), "yyyy/MM/dd")}
                </span>
                <span className="text-gray-600">元気: {"⭐".repeat(r.energyLevel ?? 0)}</span>
                <span className="text-gray-600">食事: {r.appetite ?? "-"}</span>
                <span className="text-gray-500 text-xs">{r.staff.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 投薬記録 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-gray-700">投薬記録</h2>
          <Link
            href={`/medications/new?animalId=${id}`}
            className="text-sm text-green-600 hover:underline"
          >
            ＋ 投薬を追加
          </Link>
        </div>
        {animal.medications.length === 0 ? (
          <p className="text-gray-400 text-sm">記録がありません</p>
        ) : (
          <div className="space-y-2">
            {animal.medications.map((m) => (
              <div key={m.id} className="text-sm border-b last:border-0 pb-2">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-800">{m.medicineName}</span>
                  {m.dosage && <span className="text-gray-500">{m.dosage}</span>}
                  {m.frequency && <span className="text-gray-500">{m.frequency}</span>}
                </div>
                <div className="text-gray-400 text-xs mt-0.5">
                  {format(new Date(m.startDate), "yyyy/MM/dd")} 〜{" "}
                  {m.endDate ? format(new Date(m.endDate), "yyyy/MM/dd") : "継続中"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Info({
  label,
  value,
  fullWidth = false,
}: {
  label: string;
  value: string | null | undefined;
  fullWidth?: boolean;
}) {
  return (
    <div className={fullWidth ? "col-span-2 md:col-span-3" : ""}>
      <dt className="text-xs text-gray-400 mb-0.5">{label}</dt>
      <dd className="text-gray-800">{value || "-"}</dd>
    </div>
  );
}
