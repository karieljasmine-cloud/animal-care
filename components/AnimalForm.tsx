"use client";

import { useState } from "react";
import { createAnimal, updateAnimal } from "@/app/actions/animals";
import { format } from "date-fns";

type AnimalData = {
  id: string;
  name: string;
  nameKana: string | null;
  species: string;
  breed: string | null;
  birthDate: Date | null;
  sex: string;
  intakeDate: Date;
  conditions: string | null;
  licenseNumber: string | null;
  microchipNumber: string | null;
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

function needsKana(name: string): boolean {
  return /[一-龥A-Za-z]/.test(name);
}

export default function AnimalForm({ animal }: { animal?: AnimalData }) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [nameValue, setNameValue] = useState(animal?.name ?? "");
  const action = animal ? updateAnimal.bind(null, animal.id) : createAnimal;

  const requiresKana = needsKana(nameValue);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const form = e.currentTarget;
    const newErrors: Record<string, string> = {};

    const nameVal = (form.elements.namedItem("name") as HTMLInputElement)?.value?.trim();
    const kanaVal = (form.elements.namedItem("nameKana") as HTMLInputElement)?.value?.trim();
    const speciesVal = (form.elements.namedItem("species") as HTMLSelectElement)?.value;
    const sexVal = (form.elements.namedItem("sex") as HTMLSelectElement)?.value;
    const intakeDateVal = (form.elements.namedItem("intakeDate") as HTMLInputElement)?.value;

    if (!nameVal) newErrors.name = "名前を入力してください";
    if (nameVal && needsKana(nameVal) && !kanaVal) {
      newErrors.nameKana = "漢字・アルファベットを含む名前はふりがな必須です";
    }
    if (!speciesVal) newErrors.species = "種類を選択してください";
    if (!sexVal) newErrors.sex = "性別を選択してください";
    if (!intakeDateVal) newErrors.intakeDate = "受け入れ日を入力してください";

    if (Object.keys(newErrors).length > 0) {
      e.preventDefault();
      setErrors(newErrors);
      setTimeout(() => {
        document.querySelector("[data-has-error]")?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
      return;
    }
    setErrors({});
  }

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <form action={action} onSubmit={handleSubmit} noValidate className="bg-white rounded-xl shadow-sm p-6 space-y-6">
      {hasErrors && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-4 text-red-700 text-sm" data-has-error>
          <div className="font-semibold mb-1">入力が必要な項目があります</div>
          <ul className="list-disc list-inside space-y-0.5 text-xs">
            {Object.values(errors).map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <Section title="基本情報">
        <div data-has-error={!!errors.name || undefined}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            名前 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            defaultValue={animal?.name}
            onChange={(e) => setNameValue(e.target.value)}
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
              errors.name ? "border-red-400 focus:ring-red-400 bg-red-50" : "border-gray-300 focus:ring-green-500"
            }`}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        <div data-has-error={!!errors.nameKana || undefined}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ふりがな
            {requiresKana && <span className="text-red-500 ml-0.5">*</span>}
            <span className="text-xs text-gray-400 font-normal ml-2">（漢字・アルファベット名の場合は必須・あいうえお順に使用）</span>
          </label>
          <input
            type="text"
            name="nameKana"
            defaultValue={animal?.nameKana ?? ""}
            placeholder="ひらがなで入力"
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
              errors.nameKana ? "border-red-400 focus:ring-red-400 bg-red-50" : "border-gray-300 focus:ring-green-500"
            }`}
          />
          {errors.nameKana && <p className="text-red-500 text-xs mt-1">{errors.nameKana}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div data-has-error={!!errors.species || undefined}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              種類 <span className="text-red-500">*</span>
            </label>
            <select
              name="species"
              defaultValue={animal?.species ?? ""}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                errors.species ? "border-red-400 focus:ring-red-400 bg-red-50" : "border-gray-300 focus:ring-green-500"
              }`}
            >
              <option value="">選択してください</option>
              <option value="犬">犬</option>
              <option value="猫">猫</option>
              <option value="うさぎ">うさぎ</option>
              <option value="その他">その他</option>
            </select>
            {errors.species && <p className="text-red-500 text-xs mt-1">{errors.species}</p>}
          </div>
          <Field label="品種" name="breed" defaultValue={animal?.breed ?? ""} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div data-has-error={!!errors.sex || undefined}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              性別 <span className="text-red-500">*</span>
            </label>
            <select
              name="sex"
              defaultValue={animal?.sex ?? ""}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                errors.sex ? "border-red-400 focus:ring-red-400 bg-red-50" : "border-gray-300 focus:ring-green-500"
              }`}
            >
              <option value="">選択してください</option>
              <option value="male">♂ オス</option>
              <option value="female">♀ メス</option>
            </select>
            {errors.sex && <p className="text-red-500 text-xs mt-1">{errors.sex}</p>}
          </div>
          <Field label="生年月日" name="birthDate" type="date" defaultValue={fmtDate(animal?.birthDate)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="受け入れ日" name="intakeDate" type="date" required defaultValue={fmtDate(animal?.intakeDate)} error={errors.intakeDate} />
          <Field label="繁殖者・譲渡元氏名" name="breederName" defaultValue={animal?.breederName ?? ""} />
        </div>
        <Field label="持病" name="conditions" defaultValue={animal?.conditions ?? ""} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="鑑札番号" name="licenseNumber" defaultValue={animal?.licenseNumber ?? ""} />
          <Field label="マイクロチップ番号" name="microchipNumber" defaultValue={animal?.microchipNumber ?? ""} />
        </div>
      </Section>

      <Section title="譲渡情報">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="譲渡日（新しい飼い主）" name="transferDate" type="date" defaultValue={fmtDate(animal?.transferDate)} />
          <Field label="譲渡先氏名" name="transferTo" defaultValue={animal?.transferTo ?? ""} />
        </div>
      </Section>

      <Section title="死亡情報">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
  error,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  error?: string;
}) {
  return (
    <div data-has-error={!!error || undefined}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
          error ? "border-red-400 focus:ring-red-400 bg-red-50" : "border-gray-300 focus:ring-green-500"
        }`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
