"use client";

import { createAnimal, updateAnimal } from "@/app/actions/animals";
import { format } from "date-fns";

type AnimalData = {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  birthDate: Date | null;
  sex: string;
  intakeDate: Date;
  conditions: string | null;
  breederName: string | null;
  transferDate: Date | null;
  transferTo: string | null;
  deathDate: Date | null;
  deathCause: string | null;
  notes: string | null;
};

function fmtDate(d: Date | null | undefined) {
  if (!d) return "";
  return format(new Date(d), "yyyy-MM-dd");
}

export default function AnimalForm({ animal }: { animal?: AnimalData }) {
  const action = animal
    ? updateAnimal.bind(null, animal.id)
    : createAnimal;

  return (
    <form action={action} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
      <Section title="基本情報">
        <Field label="名前 *" name="name" required defaultValue={animal?.name} />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">種類 *</label>
            <select
              name="species"
              required
              defaultValue={animal?.species ?? ""}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">選択してください</option>
              <option value="犬">犬</option>
              <option value="猫">猫</option>
              <option value="うさぎ">うさぎ</option>
              <option value="その他">その他</option>
            </select>
          </div>
          <Field label="品種" name="breed" defaultValue={animal?.breed ?? ""} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">性別 *</label>
            <select
              name="sex"
              required
              defaultValue={animal?.sex ?? ""}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">選択してください</option>
              <option value="male">♂ オス</option>
              <option value="female">♀ メス</option>
            </select>
          </div>
          <Field label="生年月日" name="birthDate" type="date" defaultValue={fmtDate(animal?.birthDate)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="受け入れ日 *" name="intakeDate" type="date" required defaultValue={fmtDate(animal?.intakeDate)} />
          <Field label="繁殖者・譲渡元氏名" name="breederName" defaultValue={animal?.breederName ?? ""} />
        </div>
        <Field label="持病" name="conditions" defaultValue={animal?.conditions ?? ""} />
      </Section>

      <Section title="譲渡情報">
        <div className="grid grid-cols-2 gap-4">
          <Field label="譲渡日（新しい飼い主）" name="transferDate" type="date" defaultValue={fmtDate(animal?.transferDate)} />
          <Field label="譲渡先氏名" name="transferTo" defaultValue={animal?.transferTo ?? ""} />
        </div>
      </Section>

      <Section title="死亡情報">
        <div className="grid grid-cols-2 gap-4">
          <Field label="死亡日" name="deathDate" type="date" defaultValue={fmtDate(animal?.deathDate)} />
          <Field label="死亡原因" name="deathCause" defaultValue={animal?.deathCause ?? ""} />
        </div>
      </Section>

      <Section title="備考">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">備考</label>
          <textarea
            name="notes"
            rows={3}
            defaultValue={animal?.notes ?? ""}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </Section>

      <div className="flex gap-3">
        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          {animal ? "更新する" : "登録する"}
        </button>
        <a
          href={animal ? `/animals/${animal.id}` : "/animals"}
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
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  defaultValue = "",
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        required={required}
        defaultValue={defaultValue}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      />
    </div>
  );
}
