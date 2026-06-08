"use client";

import { createMedication, updateMedication } from "@/app/actions/medications";
import { format } from "date-fns";

type Animal = { id: string; name: string };

type MedicationData = {
  id: string;
  animalId: string;
  medicineName: string;
  dosage: string | null;
  frequency: string | null;
  startDate: Date;
  endDate: Date | null;
  administeredAt: Date | null;
  remainingDoses: number | null;
  openedAt: Date | null;
  expiresAfterDays: number | null;
  notes: string | null;
};

function fmtDate(d: Date | null | undefined) {
  if (!d) return "";
  return format(new Date(d), "yyyy-MM-dd");
}

export default function MedicationForm({
  animals,
  defaultAnimalId,
  medication,
}: {
  animals: Animal[];
  defaultAnimalId?: string;
  medication?: MedicationData;
}) {
  const action = medication
    ? updateMedication.bind(null, medication.id)
    : createMedication;

  return (
    <form action={action} className="bg-white rounded-xl shadow-sm p-6 space-y-4 max-w-lg">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">個体 *</label>
        <select
          name="animalId"
          required
          defaultValue={medication?.animalId ?? defaultAnimalId ?? ""}
          disabled={!!medication}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
        >
          <option value="">選択してください</option>
          {animals.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">薬品名 *</label>
        <input
          type="text"
          name="medicineName"
          required
          defaultValue={medication?.medicineName ?? ""}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="例: フィラリア予防薬"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">用量</label>
          <input
            type="text"
            name="dosage"
            defaultValue={medication?.dosage ?? ""}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="例: 1錠"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">頻度</label>
          <input
            type="text"
            name="frequency"
            defaultValue={medication?.frequency ?? ""}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="例: 1日2回"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">開始日 *</label>
          <input
            type="date"
            name="startDate"
            required
            defaultValue={fmtDate(medication?.startDate) || new Date().toISOString().split("T")[0]}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">終了日</label>
          <input
            type="date"
            name="endDate"
            defaultValue={fmtDate(medication?.endDate)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* 残量（錠・回数） */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          残量（錠数・回数）
          <span className="ml-2 text-xs font-normal text-gray-400">チェック表で投与のたびに自動カウントダウン</span>
        </label>
        <input
          type="number"
          name="remainingDoses"
          min="0"
          defaultValue={medication?.remainingDoses?.toString() ?? ""}
          placeholder="例: 30"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* 目薬・液体薬：開封日管理 */}
      <div className="border border-blue-100 rounded-lg p-4 bg-blue-50/50 space-y-3">
        <p className="text-xs font-medium text-blue-700">👁 目薬・液体薬の開封日管理（任意）</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">開封日</label>
            <input
              type="date"
              name="openedAt"
              defaultValue={fmtDate(medication?.openedAt)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              開封後使用期限
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                name="expiresAfterDays"
                min="1"
                defaultValue={medication?.expiresAfterDays?.toString() ?? ""}
                placeholder="例: 28"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              />
              <span className="text-sm text-gray-500 whitespace-nowrap">日間</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-400">開封日と使用期限日数を入力すると、投薬記録一覧に残り日数が表示されます</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">備考</label>
        <textarea
          name="notes"
          rows={2}
          defaultValue={medication?.notes ?? ""}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700"
        >
          {medication ? "更新する" : "登録する"}
        </button>
        <a
          href="/medications"
          className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200"
        >
          キャンセル
        </a>
      </div>
    </form>
  );
}
