import { prisma } from "@/lib/prisma";
import MedicationForm from "@/components/MedicationForm";

export default async function NewMedicationPage({
  searchParams,
}: {
  searchParams: Promise<{ animalId?: string }>;
}) {
  const { animalId } = await searchParams;

  const animals = await prisma.animal.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">投薬記録を追加</h1>
      <MedicationForm animals={animals} defaultAnimalId={animalId} />
    </div>
  );
}
