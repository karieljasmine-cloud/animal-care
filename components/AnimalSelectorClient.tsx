"use client";

import { useRouter } from "next/navigation";

type Props = {
  animals: { id: string; name: string }[];
  currentAnimalId: string;
  currentMonth: string;
  currentType: string;
  currentSpecies?: string;
};

export default function AnimalSelectorClient({ animals, currentAnimalId, currentMonth, currentType, currentSpecies }: Props) {
  const router = useRouter();

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
        {animals.map((a) => (
          <option key={a.id} value={a.id}>{a.name}</option>
        ))}
      </select>
    </div>
  );
}
