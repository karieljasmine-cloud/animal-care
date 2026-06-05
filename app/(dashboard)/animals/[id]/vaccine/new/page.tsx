import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default async function NewVaccinePage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const animal = await prisma.animal.findUnique({ where: { id } });
  if (!animal) notFound();

  async function addVaccine(formData: FormData) {
    "use server";
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const nextDue = formData.get("nextDueDate") as string;

    await prisma.vaccine.create({
      data: {
        animalId: id,
        vaccineName: formData.get("vaccineName") as string,
        vaccinatedAt: new Date(formData.get("vaccinatedAt") as string),
        nextDueDate: nextDue ? new Date(nextDue) : null,
        notes: (formData.get("notes") as string) || null,
      },
    });

    revalidatePath(`/animals/${id}`);
    redirect(`/animals/${id}`);
  }

  const commonVaccines = ["混合ワクチン（5種）", "混合ワクチン（6種）", "混合ワクチン（7種）", "狂犬病ワクチン", "フィラリア予防", "その他"];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        ワクチンを記録 — {animal.name}
      </h1>
      <form action={addVaccine} className="bg-white rounded-xl shadow-sm p-6 space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ワクチン名 *</label>
          <select
            name="vaccineName"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">選択してください</option>
            {commonVaccines.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">接種日 *</label>
          <input
            type="date"
            name="vaccinatedAt"
            required
            defaultValue={new Date().toISOString().split("T")[0]}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">次回接種予定日</label>
          <input
            type="date"
            name="nextDueDate"
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
