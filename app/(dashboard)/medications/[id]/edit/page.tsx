import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import MedicationForm from "@/components/MedicationForm";

export default async function EditMedicationPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  const [medication, animals] = await Promise.all([
    prisma.medication.findUnique({ where: { id } }),
    prisma.animal.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!medication) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">投薬記録を編集</h1>
      <MedicationForm animals={animals} medication={medication} />
    </div>
  );
}
