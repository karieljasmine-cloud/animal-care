import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { unstable_cache } from "next/cache";

const getAnimals = unstable_cache(
  () =>
    prisma.animal.findMany({
      orderBy: [{ isActive: "desc" }, { name: "asc" }],
      include: { _count: { select: { dailyRecords: true } } },
    }),
  ["animals-list"],
  { revalidate: 60, tags: ["animals"] }
);

export default async function AnimalsPage() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role ?? "staff";
  if (role === "staff") redirect("/daily-records");

  const canEdit = role === "admin";

  const animals = await getAnimals();

  const active = animals.filter((a) => a.isActive);
  const inactive = animals.filter((a) => !a.isActive);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">個体台帳</h1>
        <div className="flex gap-2 flex-wrap">
          {canEdit && (
            <a
              href="/api/animals/export"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              📊 Excelエクスポート
            </a>
          )}
          {canEdit && (
            <Link
              href="/animals/new"
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
            >
              ＋ 新規登録
            </Link>
          )}
          {!canEdit && (
            <span className="text-xs bg-blue-50 text-blue-600 px-3 py-2 rounded-lg border border-blue-200">
              閲覧のみ
            </span>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">在籍中 ({active.length}頭)</h2>
        <AnimalTable animals={active} canEdit={canEdit} />
      </div>

      {inactive.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-500 mb-3">退籍済み ({inactive.length}頭)</h2>
          <AnimalTable animals={inactive} inactive canEdit={canEdit} />
        </div>
      )}
    </div>
  );
}

function AnimalTable({
  animals,
  inactive = false,
  canEdit,
}: {
  animals: Array<{
    id: string;
    name: string;
    species: string;
    breed: string | null;
    sex: string;
    birthDate: Date | null;
    intakeDate: Date;
    conditions: string | null;
    transferDate: Date | null;
    deathDate: Date | null;
    _count: { dailyRecords: number };
  }>;
  inactive?: boolean;
  canEdit: boolean;
}) {
  if (animals.length === 0) {
    return <p className="text-gray-400 text-sm py-4">データがありません</p>;
  }

  return (
    <>
      {/* モバイル: カードレイアウト */}
      <div className="md:hidden space-y-2">
        {animals.map((animal) => (
          <Link
            key={animal.id}
            href={`/animals/${animal.id}`}
            className={`block bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow ${inactive ? "opacity-60" : ""}`}
          >
            <div className="flex justify-between items-center">
              <div className="font-semibold text-gray-800">
                {animal.name}
                {animal.deathDate && <span className="ml-1 text-gray-400 text-xs">†</span>}
                {animal.transferDate && <span className="ml-1 text-blue-400 text-xs">→</span>}
              </div>
              <span className="text-green-500 text-xl font-light">›</span>
            </div>
            <div className="text-sm text-gray-500 mt-0.5">
              {animal.species}{animal.breed && <span className="text-gray-400"> / {animal.breed}</span>}
              {" · "}{animal.sex === "male" ? "♂ オス" : "♀ メス"}
            </div>
            <div className="text-xs text-gray-400 mt-1.5 flex flex-wrap gap-3">
              <span>受入: {format(new Date(animal.intakeDate), "yyyy/MM/dd", { locale: ja })}</span>
              <span>記録 {animal._count.dailyRecords}件</span>
            </div>
            {animal.conditions && (
              <div className="text-xs text-orange-600 mt-1">持病: {animal.conditions}</div>
            )}
          </Link>
        ))}
      </div>

      {/* デスクトップ: テーブルレイアウト */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className={inactive ? "bg-gray-100" : "bg-green-50"}>
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">名前</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">種類/品種</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">性別</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">生年月日</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">受け入れ日</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">持病</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">記録数</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {animals.map((animal, i) => (
              <tr
                key={animal.id}
                className={`border-t ${i % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-green-50 transition-colors`}
              >
                <td className="px-4 py-3 font-medium text-gray-800">
                  {animal.name}
                  {animal.deathDate && <span className="ml-1 text-gray-400 text-xs">†</span>}
                  {animal.transferDate && <span className="ml-1 text-blue-400 text-xs">→</span>}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {animal.species}
                  {animal.breed && <span className="text-gray-400"> / {animal.breed}</span>}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {animal.sex === "male" ? "♂ オス" : "♀ メス"}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {animal.birthDate
                    ? format(new Date(animal.birthDate), "yyyy/MM/dd", { locale: ja })
                    : "-"}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {format(new Date(animal.intakeDate), "yyyy/MM/dd", { locale: ja })}
                </td>
                <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                  {animal.conditions || "-"}
                </td>
                <td className="px-4 py-3 text-gray-500 text-center">
                  {animal._count.dailyRecords}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/animals/${animal.id}`} className="text-green-600 hover:text-green-800 font-medium">
                    詳細
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
