"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

export async function createMedication(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const endDate = formData.get("endDate") as string;
  const administeredAt = formData.get("administeredAt") as string;
  const remainingDosesStr = formData.get("remainingDoses") as string;
  const openedAt = formData.get("openedAt") as string;
  const expiresAfterDaysStr = formData.get("expiresAfterDays") as string;

  await prisma.medication.create({
    data: {
      animalId: formData.get("animalId") as string,
      staffId: session.user.id!,
      medicineName: formData.get("medicineName") as string,
      dosage: (formData.get("dosage") as string) || null,
      frequency: (formData.get("frequency") as string) || null,
      startDate: new Date(formData.get("startDate") as string),
      endDate: endDate ? new Date(endDate) : null,
      administeredAt: administeredAt ? new Date(administeredAt) : null,
      remainingDoses: remainingDosesStr ? parseInt(remainingDosesStr) : null,
      openedAt: openedAt ? new Date(openedAt) : null,
      expiresAfterDays: expiresAfterDaysStr ? parseInt(expiresAfterDaysStr) : null,
      notes: (formData.get("notes") as string) || null,
    },
  });

  updateTag("medications");
  revalidatePath("/medications");
  redirect("/medications");
}

export async function updateMedication(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const endDate = formData.get("endDate") as string;
  const administeredAt = formData.get("administeredAt") as string;
  const remainingDosesStr = formData.get("remainingDoses") as string;
  const openedAt = formData.get("openedAt") as string;
  const expiresAfterDaysStr = formData.get("expiresAfterDays") as string;

  await prisma.medication.update({
    where: { id },
    data: {
      medicineName: formData.get("medicineName") as string,
      dosage: (formData.get("dosage") as string) || null,
      frequency: (formData.get("frequency") as string) || null,
      startDate: new Date(formData.get("startDate") as string),
      endDate: endDate ? new Date(endDate) : null,
      administeredAt: administeredAt ? new Date(administeredAt) : null,
      remainingDoses: remainingDosesStr ? parseInt(remainingDosesStr) : null,
      openedAt: openedAt ? new Date(openedAt) : null,
      expiresAfterDays: expiresAfterDaysStr ? parseInt(expiresAfterDaysStr) : null,
      notes: (formData.get("notes") as string) || null,
    },
  });

  updateTag("medications");
  revalidatePath("/medications");
  redirect("/medications");
}

export async function deleteMedication(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await prisma.medication.delete({ where: { id } });

  updateTag("medications");
  revalidatePath("/medications");
}
