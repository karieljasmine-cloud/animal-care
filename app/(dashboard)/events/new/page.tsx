import { prisma } from "@/lib/prisma";
import { createAnimalEvent } from "@/app/actions/events";
import Link from "next/link";
import SubmitButton from "@/components/SubmitButton";
import { format } from "date-fns";

const SPECIES_ORDER = ["犬", "猫", "うさぎ", "その他"];
const SPECIES_ICON: Record<string, string> = { 犬: "🐕", 猫: "🐈", うさぎ: "🐇", その他: "🐾" };

export default async function NewEventPage() {
  const rawAnimals = await prisma.animal.findMany({
    where: { isActive: true },
    select: { id: true, name: true, nameKana: true, species: true },
  });

  const si = (s: string) => { const i = SPECIES_ORDER.indexOf(s); return i >= 0 ? i : 99; };
  const animals = [...rawAnimals].sort((a, b) => {
    const dr = si(a.species) - si(b.species);
    if (dr !== 0) return dr;
    return (a.nameKana || a.name).localeCompare(b.nameKana || b.name, "ja");
  });
  const speciesGroups = [...new Set(animals.map((a) => a.species))].sort((a, b) => si(a) - si(b));

  const todayStr = format(new Date(), "yyyy-MM-dd");

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">特記事項を記録</h1>
        <Link href="/events" className="text-sm text-green-600 hover:underline">
          ← カレンダーへ
        </Link>
      </div>

      <form action={createAnimalEvent} className="bg-white rounded-xl shadow-sm p-6 space-y-5 max-w-lg">
        {/* 個体 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            個体 <span className="text-red-500">*</span>
          </label>
          <select
            name="animalId"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">選択してください</option>
            {speciesGroups.map((sp) => (
              <optgroup key={sp} label={`${SPECIES_ICON[sp] ?? "🐾"} ${sp}`}>
                {animals.filter((a) => a.species === sp).map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* 日付 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            日付 <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="eventDate"
            defaultValue={todayStr}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* 種別 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            種別 <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: "adHocMed", label: "💊 突発的なお薬", desc: "下痢薬・整腸剤など" },
              { value: "care", label: "✂️ ケア", desc: "トリミング・特別ケアなど" },
              { value: "injury", label: "🩹 怪我・異常", desc: "傷・体調異常など" },
              { value: "inHeat", label: "🌸 ヒート", desc: "発情期間" },
            ].map(({ value, label, desc }) => (
              <label key={value} className="relative cursor-pointer">
                <input
                  type="radio"
                  name="eventType"
                  value={value}
                  required
                  className="peer sr-only"
                />
                <div className="border-2 border-gray-200 rounded-lg p-2 text-center peer-checked:border-green-500 peer-checked:bg-green-50 hover:border-gray-300 transition-colors">
                  <div className="text-sm font-medium">{label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* 内容 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            内容 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            required
            placeholder="例：下痢薬（整腸錠）投与、爪切り、右前脚に軽い擦り傷、ヒート開始"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* メモ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">メモ</label>
          <textarea
            name="notes"
            rows={2}
            placeholder="追加のメモがあれば..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="flex gap-3">
          <SubmitButton
            className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-60"
            loadingText="記録中..."
          >
            記録する
          </SubmitButton>
          <Link
            href="/events"
            className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            キャンセル
          </Link>
        </div>
      </form>
    </div>
  );
}
