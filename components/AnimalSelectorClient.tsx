"use client";

import { useRouter } from "next/navigation";

const SPECIES_ORDER = ["犬", "猫", "うさぎ", "その他"];
const SPECIES_ICON: Record<string, string> = { 犬: "🐕", 猫: "🐈", うさぎ: "🐇", その他: "🐾" };

type Animal = { id: string; name: string; nameKana: string | null; species: string };

type Props = {
  animals: Animal[];
  currentAnimalId: string;
  currentMonth: string;
  currentType: string;
  currentSpecies?: string;
};

export default function AnimalSelectorClient({ animals, currentAnimalId, currentMonth, currentType, currentSpecies }: Props) {
  const router = useRouter();

  const si = (s: string) => { const i = SPECIES_ORDER.indexOf(s); return i >= 0 ? i : 99; };
  const sorted = [...animals].sort((a, b) => {
    const dr = si(a.species) - si(b.species);
    if (dr !== 0) return dr;
    return (a.nameKana || a.name).localeCompare(b.nameKana || b.name, "ja");
  });
  const speciesGroups = [...new Set(sorted.map((a) => a.species))].sort((a, b) => si(a) - si(b));

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams();
    if (currentMonth) params.set("month", currentMonth);
    if (currentType) params.set("type", currentType);
    if (currentSpecies) params.set("species", currentSpecies);
    if (e.target.value) params.set("animalId", e.target.value);
    router.push(`/events?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600 whitespace-nowrap">個体：</span>
      <select
        value={currentAnimalId}
        onChange={handleChange}
        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        <option value="">全体（すべての個体）</option>
        {speciesGroups.map((sp) => (
          <optgroup key={sp} label={`${SPECIES_ICON[sp] ?? "🐾"} ${sp}`}>
            {sorted.filter((a) => a.species === sp).map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}
