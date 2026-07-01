"use client";

import { createDailyRecord, updateDailyRecord } from "@/app/actions/daily-records";
import { format } from "date-fns";
import { useState } from "react";

type Animal = { id: string; name: string; species: string };

type RecordData = {
  id: string;
  animalId: string;
  recordDate: Date;
  timeOfDay: string | null;
  energyLevel: number | null;
  appetite: string | null;
  foodAmount: string | null;
  urineAmount: string | null;
  stoolCondition: string | null;
  stoolPhotoUrl: string | null;
  brushing: boolean;
  nailTrimming: boolean;
  trimming: boolean;
  shampoo: boolean;
  earCleaning: boolean;
  inHeat: boolean;
  injury: string | null;
  injuryPhotoUrl: string | null;
  notes: string | null;
};

export default function DailyRecordForm({
  animals,
  defaultAnimalId,
  defaultDate,
  defaultTimeOfDay,
  record,
}: {
  animals: Animal[];
  defaultAnimalId?: string;
  defaultDate?: string;
  defaultTimeOfDay?: string;
  record?: RecordData;
}) {
  const [stoolPreview, setStoolPreview] = useState<string | null>(record?.stoolPhotoUrl ?? null);
  const [injuryPreview, setInjuryPreview] = useState<string | null>(record?.injuryPhotoUrl ?? null);

  const action = record ? updateDailyRecord.bind(null, record.id) : createDailyRecord;

  return (
    <form action={action} encType="multipart/form-data" className="bg-white rounded-xl shadow-sm p-6 space-y-6">
      {/* 基本 */}
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">個体 *</label>
          <select
            name="animalId"
            required
            defaultValue={record?.animalId ?? defaultAnimalId ?? ""}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">選択してください</option>
            {animals.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.species})
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">記録日 *</label>
            <input
              type="date"
              name="recordDate"
              required
              defaultValue={
                record
                  ? format(new Date(record.recordDate), "yyyy-MM-dd")
                  : (defaultDate ?? new Date().toISOString().split("T")[0])
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">時間帯</label>
            <select
              name="timeOfDay"
              defaultValue={record?.timeOfDay ?? defaultTimeOfDay ?? "AM"}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="AM">☀ 朝</option>
              <option value="PM">★ 夜</option>
            </select>
          </div>
        </div>
      </div>

      {/* 健康状態 */}
      <Section title="健康状態">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">元気の良さ</label>
            <select
              name="energyLevel"
              defaultValue={record?.energyLevel?.toString() ?? ""}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">選択</option>
              <option value="1">⭐ とても元気がない</option>
              <option value="2">⭐⭐ 元気がない</option>
              <option value="3">⭐⭐⭐ 普通</option>
              <option value="4">⭐⭐⭐⭐ 元気</option>
              <option value="5">⭐⭐⭐⭐⭐ とても元気</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">食欲</label>
            <select
              name="appetite"
              defaultValue={record?.appetite ?? ""}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">選択</option>
              <option value="良好">良好</option>
              <option value="普通">普通</option>
              <option value="少ない">少ない</option>
              <option value="食べない">食べない</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">食事量</label>
            <input
              type="text"
              name="foodAmount"
              defaultValue={record?.foodAmount ?? ""}
              placeholder="例: 完食"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </Section>

      {/* 排泄 */}
      <Section title="排泄">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">尿の量</label>
            <select
              name="urineAmount"
              defaultValue={record?.urineAmount ?? ""}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">選択</option>
              <option value="多い">多い</option>
              <option value="普通">普通</option>
              <option value="少ない">少ない</option>
              <option value="なし">なし</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">便の状態</label>
            <select
              name="stoolCondition"
              defaultValue={record?.stoolCondition ?? ""}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">選択</option>
              <option value="良好">良好</option>
              <option value="軟便">軟便</option>
              <option value="下痢">下痢</option>
              <option value="血便">血便</option>
              <option value="なし">なし</option>
            </select>
          </div>
        </div>
        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">便の写真</label>
          <input
            type="file"
            name="stoolPhoto"
            accept="image/*"
            className="w-full text-sm text-gray-500"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setStoolPreview(URL.createObjectURL(file));
            }}
          />
          {stoolPreview && (
            <img src={stoolPreview} alt="便の写真" className="mt-1 h-16 rounded object-cover" />
          )}
        </div>
      </Section>

      {/* ケア */}
      <Section title="ケア">
        <div className="flex flex-wrap gap-5">
          {[
            { name: "brushing", label: "毛ブラシ", checked: record?.brushing },
            { name: "nailTrimming", label: "爪切り", checked: record?.nailTrimming },
            { name: "trimming", label: "トリミング", checked: record?.trimming },
            { name: "shampoo", label: "シャンプー", checked: record?.shampoo },
            { name: "earCleaning", label: "耳掃除", checked: record?.earCleaning },
            { name: "inHeat", label: "ヒート", checked: record?.inHeat },
          ].map((item) => (
            <label key={item.name} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name={item.name}
                defaultChecked={item.checked ?? false}
                className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">{item.label}</span>
            </label>
          ))}
        </div>
      </Section>

      {/* 怪我 */}
      <Section title="怪我・異常">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">怪我・異常の内容</label>
          <input
            type="text"
            name="injury"
            defaultValue={record?.injury ?? ""}
            placeholder="怪我や異常がある場合に記入"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">怪我の写真</label>
          <input
            type="file"
            name="injuryPhoto"
            accept="image/*"
            className="text-sm text-gray-500"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setInjuryPreview(URL.createObjectURL(file));
            }}
          />
          {injuryPreview && (
            <img src={injuryPreview} alt="怪我の写真" className="mt-1 h-20 rounded object-cover" />
          )}
        </div>
      </Section>

      {/* 備考 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">備考・特記事項</label>
        <textarea
          name="notes"
          rows={3}
          defaultValue={record?.notes ?? ""}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          {record ? "更新する" : "記録する"}
        </button>
        <a
          href="/daily-records"
          className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          キャンセル
        </a>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-medium text-gray-700 border-b pb-2 mb-4">{title}</h3>
      {children}
    </div>
  );
}
