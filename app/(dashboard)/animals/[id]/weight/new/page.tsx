import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default async function NewWeightPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const animal = await prisma.animal.findUnique({ where: { id } });
  if (!animal) notFound();

  async function addWeight(formData: FormData) {
    "use server";
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    await prisma.weightRecord.create({
      data: {
        animalId: id,
        weight: parseFloat(formData.get("weight") as string),
        recordedAt: new Date(formData.get("recordedAt") as string),
        notes: (formData.get("notes") as string) || null,
      },
    });

    revalidatePath(`/animals/${id}`);
    redirect(`/animals/${id}`);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        体重を記録 — {animal.name}
      </h1>
      <form action={addWeight} className="bg-white rounded-xl shadow-sm p-6 space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">測定日 *</label>
          <input
            type="date"
            name="recordedAt"
            required
            defaultValue={new Date().toISOString().split("T")[0]}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">体重 (kg) *</label>
          <input
            type="number"
            name="weight"
            step="0.1"
            min="0"
            required
            placeholder="例: 3.5"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">備考</label>
          <input
            type="text"
            name="notes"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700"
          >
            記録する
          </button>
          <a
            href={`/animals/${id}`}
            className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200"
          >
            キャンセル
          </a>
        </div>
      </form>
    </div>
  );
}
