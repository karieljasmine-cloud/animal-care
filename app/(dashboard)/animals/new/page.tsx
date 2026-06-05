import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AnimalForm from "@/components/AnimalForm";

export default async function NewAnimalPage() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role ?? "staff";
  if (role !== "admin") redirect("/animals");

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">個体登録</h1>
      <AnimalForm />
    </div>
  );
}
