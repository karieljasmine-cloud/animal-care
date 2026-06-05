import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import DailyRecordForm from "@/components/DailyRecordForm";

export default async function EditDailyRecordPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  const [record, animals] = await Promise.all([
    prisma.dailyRecord.findUnique({ where: { id } }),
    prisma.animal.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, species: true },
    }),
  ]);

  if (!record) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">日次記録を編集</h1>
      <DailyRecordForm animals={animals} record={record} />
    </div>
  );
}
