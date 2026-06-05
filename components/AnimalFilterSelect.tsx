"use client";

import { useRouter } from "next/navigation";

export default function AnimalFilterSelect({
  animals,
  currentAnimalId,
}: {
  animals: { id: string; name: string }[];
  currentAnimalId?: string;
}) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm text-gray-600">個体で絞り込み:</label>
      <select
        value={currentAnimalId ?? ""}
        onChange={(e) => {
          const val = e.target.value;
          if (val) router.push(`/daily-records?animalId=${val}`);
          else router.push("/daily-records");
        }}
        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        <option value="">全ての個体</option>
        {animals.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>
      {currentAnimalId && (
        <button
          onClick={() => router.push("/daily-records")}
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          クリア
        </button>
      )}
    </div>
  );
}
