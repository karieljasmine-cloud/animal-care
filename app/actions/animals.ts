"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function parseDate(val: FormDataEntryValue | null) {
  if (!val || val === "") return null;
  return new Date(val as string);
}

export async function createAnimal(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const animal = await prisma.animal.create({
    data: {
      name: formData.get("name") as string,
      species: formData.get("species") as string,
      breed: (formData.get("breed") as string) || null,
      birthDate: parseDate(formData.get("birthDate")),
      sex: formData.get("sex") as string,
      intakeDate: new Date(formData.get("intakeDate") as string),
      conditions: (formData.get("conditions") as string) || null,
      breederName: (formData.get("breederName") as string) || null,
      transferDate: parseDate(formData.get("transferDate")),
      transferTo: (formData.get("transferTo") as string) || null,
      deathDate: parseDate(formData.get("deathDate")),
      deathCause: (formData.get("deathCause") as string) || null,
      notes: (formData.get("notes") as string) || null,
      isActive: !parseDate(formData.get("transferDate")) && !parseDate(formData.get("deathDate")),
    },
  });

  revalidatePath("/animals");
  redirect(`/animals/${animal.id}`);
}

export async function updateAnimal(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const transferDate = parseDate(formData.get("transferDate"));
  const deathDate = parseDate(formData.get("deathDate"));

  await prisma.animal.update({
    where: { id },
    data: {
      name: formData.get("name") as string,
      species: formData.get("species") as string,
      breed: (formData.get("breed") as string) || null,
      birthDate: parseDate(formData.get("birthDate")),
      sex: formData.get("sex") as string,
      intakeDate: new Date(formData.get("intakeDate") as string),
      conditions: (formData.get("conditions") as string) || null,
      breederName: (formData.get("breederName") as string) || null,
      transferDate,
      transferTo: (formData.get("transferTo") as string) || null,
      deathDate,
      deathCause: (formData.get("deathCause") as string) || null,
      notes: (formData.get("notes") as string) || null,
      isActive: !transferDate && !deathDate,
    },
  });

  revalidatePath("/animals");
  revalidatePath(`/animals/${id}`);
  redirect(`/animals/${id}`);
}

export async function deleteAnimal(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await prisma.animal.delete({ where: { id } });
  revalidatePath("/animals");
  redirect("/animals");
}
