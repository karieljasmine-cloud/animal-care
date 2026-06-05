import { prisma } from "@/lib/prisma";
import DailyRecordForm from "@/components/DailyRecordForm";

export default async function NewDailyRecordPage({
  searchParams,
}: {
  searchParams: Promise<{ animalId?: string; date?: string; timeOfDay?: string }>;
}) {
  const { animalId, date, timeOfDay } = await searchParams;

  const animals = await prisma.animal.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, species: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">日次記録を追加</h1>
      <DailyRecordForm
        animals={animals}
        defaultAnimalId={animalId}
        defaultDate={date}
        defaultTimeOfDay={timeOfDay}
      />
    </div>
  );
}
