import { prisma } from "@/lib/prisma";
import { updateAnimalEvent } from "@/app/actions/events";
import Link from "next/link";
import SubmitButton from "@/components/SubmitButton";
import { format } from "date-fns";
import { notFound } from "next/navigation";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const ev = await prisma.animalEvent.findUnique({
    where: { id },
    include: { animal: { select: { name: true } } },
  });

  if (!ev) notFound();

  const dateStr = format(new Date(ev.eventDate), "yyyy-MM-dd");

  const action = updateAnimalEvent.bind(null, id);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">特記事項を編集</h1>
        <Link href="/events" className="text-sm text-green-600 hover:underline">
          ← カレンダーへ
        </Link>
      </div>

      <form action={action} className="bg-white rounded-xl shadow-sm p-6 space-y-5 max-w-lg">
        {/* 個体（変更不可） */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">個体</label>
          <div className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500">
            {ev.animal.name}
          </div>
        </div>

        {/* 日付 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            日付 <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="eventDate"
            defaultValue={dateStr}
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
                  defaultChecked={ev.eventType === value}
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
            defaultValue={ev.title}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* メモ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">メモ</label>
          <textarea
            name="notes"
            rows={2}
            defaultValue={ev.notes ?? ""}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="flex gap-3">
          <SubmitButton
            className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-60"
            loadingText="保存中..."
          >
            保存する
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
