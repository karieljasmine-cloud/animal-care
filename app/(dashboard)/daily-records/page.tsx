import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { unstable_cache } from "next/cache";

const getActiveAnimals = unstable_cache(
  () =>
    prisma.animal.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, species: true },
    }),
  ["active-animals"],
  { revalidate: 60, tags: ["animals"] }
);

function getDailyRecords(animalId?: string) {
  return unstable_cache(
    () =>
      prisma.dailyRecord.findMany({
        where: animalId ? { animalId } : undefined,
        orderBy: { recordDate: "desc" },
        take: 50,
        include: {
          animal: { select: { id: true, name: true } },
          staff: { select: { name: true } },
        },
      }),
    ["daily-records", animalId ?? "all"],
    { revalidate: 30, tags: ["daily-records"] }
  )();
}

const SPECIES_ICON: Record<string, string> = {
  犬: "🐕",
  猫: "🐈",
  うさぎ: "🐇",
  その他: "🐾",
};

export default async function DailyRecordsPage({
  searchParams,
}: {
  searchParams: Promise<{ animalId?: string }>;
}) {
  const { animalId } = await searchParams;

  const [records, animals] = await Promise.all([
    getDailyRecords(animalId),
    getActiveAnimals(),
  ]);

  const selectedAnimal = animals.find((a) => a.id === animalId);

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold text-gray-800">
          日次記録
          {selectedAnimal && (
            <span className="text-lg font-normal text-gray-500 ml-2">
              — {selectedAnimal.name}
            </span>
          )}
        </h1>
        <Link
          href="/daily-records/chart"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          📊 便チェック表
        </Link>
      </div>

      {/* 動物グリッド — 記録登録のショートカット */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            個体を選んで記録
          </h2>
          {selectedAnimal && (
            <Link href="/daily-records" className="text-xs text-green-600 hover:underline">
              ← 全個体に戻る
            </Link>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {animals.map((animal) => {
            const icon = SPECIES_ICON[animal.species] ?? "🐾";
            const isSelected = animal.id === animalId;
            return (
              <div
                key={animal.id}
                className={`bg-white rounded-xl shadow-sm p-3 flex items-center justify-between gap-2 border-2 transition-colors ${
                  isSelected ? "border-green-500" : "border-transparent"
                }`}
              >
                <Link
                  href={`/daily-records?animalId=${animal.id}`}
                  className="flex items-center gap-2 min-w-0 flex-1"
                >
                  <span className="text-lg">{icon}</span>
                  <span className={`text-sm font-medium truncate ${isSelected ? "text-green-700" : "text-gray-800"}`}>
                    {animal.name}
                  </span>
                </Link>
                <Link
                  href={`/daily-records/new?animalId=${animal.id}`}
                  className="shrink-0 bg-green-600 text-white text-xs px-2 py-1 rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
                >
                  ＋ 記録
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* 記録一覧 */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          {selectedAnimal ? `${selectedAnimal.name} の記録` : "最近の記録"}
        </h2>
        <span className="text-xs text-gray-400">{records.length}件</span>
      </div>

      <div className="space-y-3">
        {records.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-400">
            記録がありません
          </div>
        ) : (
          records.map((record) => (
            <div key={record.id} className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-semibold text-gray-800">{record.animal.name}</span>
                  <span className="text-gray-400 text-sm">
                    {format(new Date(record.recordDate), "yyyy年MM月dd日 (E)", { locale: ja })}
                  </span>
                  <span className="text-gray-400 text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                    {record.staff.name}
                  </span>
                </div>
                <Link
                  href={`/daily-records/${record.id}/edit`}
                  className="text-sm text-green-600 hover:underline shrink-0"
                >
                  編集
                </Link>
              </div>

              <div className="mt-2 flex flex-wrap gap-3 text-sm">
                {record.energyLevel !== null && (
                  <Badge label="元気" value={"⭐".repeat(record.energyLevel)} />
                )}
                {record.appetite && <Badge label="食欲" value={record.appetite} />}
                {record.foodAmount && <Badge label="食事量" value={record.foodAmount} />}
                {record.urineAmount && <Badge label="尿" value={record.urineAmount} />}
                {record.stoolCondition && <Badge label="便" value={record.stoolCondition} />}
                {record.brushing && <Tag>ブラッシング</Tag>}
                {record.nailTrimming && <Tag>爪切り</Tag>}
                {record.trimming && <Tag>トリミング</Tag>}
                {record.shampoo && <Tag>シャンプー</Tag>}
                {record.inHeat && <Tag color="pink">発情</Tag>}
              </div>

              {record.injury && (
                <p className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-1 rounded-lg">
                  ⚠️ 怪我: {record.injury}
                </p>
              )}
              {record.notes && (
                <p className="mt-1 text-sm text-gray-500">{record.notes}</p>
              )}
              {(record.stoolPhotoUrl || record.injuryPhotoUrl) && (
                <div className="mt-2 flex gap-2">
                  {record.stoolPhotoUrl && (
                    <a href={record.stoolPhotoUrl} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline">
                      📷 便の写真
                    </a>
                  )}
                  {record.injuryPhotoUrl && (
                    <a href={record.injuryPhotoUrl} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline">
                      📷 怪我の写真
                    </a>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Badge({ label, value }: { label: string; value: string }) {
  return (
    <span className="text-gray-600">
      <span className="text-gray-400">{label}: </span>{value}
    </span>
  );
}

function Tag({ children, color = "green" }: { children: React.ReactNode; color?: string }) {
  const colors: Record<string, string> = {
    green: "bg-green-100 text-green-700",
    pink: "bg-pink-100 text-pink-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  );
}
