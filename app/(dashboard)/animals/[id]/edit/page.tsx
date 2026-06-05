import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import AnimalForm from "@/components/AnimalForm";

export default async function EditAnimalPage(props: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role ?? "staff";
  if (role !== "admin") redirect("/animals");

  const { id } = await props.params;
  const animal = await prisma.animal.findUnique({ where: { id } });
  if (!animal) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">個体情報を編集</h1>
      <AnimalForm animal={animal} />
    </div>
  );
}
