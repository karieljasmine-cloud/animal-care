"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";

export async function createAnimalEvent(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const animalId = formData.get("animalId") as string;
  const eventDate = formData.get("eventDate") as string;
  const eventType = formData.get("eventType") as string;
  const title = (formData.get("title") as string)?.trim();
  const notes = (formData.get("notes") as string)?.trim();

  if (!animalId || !eventDate || !eventType || !title) {
    throw new Error("必須項目が不足しています");
  }

  await prisma.animalEvent.create({
    data: {
      animalId,
      eventDate: new Date(eventDate),
      eventType,
      title,
      notes: notes || null,
    },
  });

  updateTag("animal-events");
  revalidatePath("/events");
  redirect("/events");
}

export async function deleteAnimalEvent(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  await prisma.animalEvent.delete({ where: { id } });
  updateTag("animal-events");
  revalidatePath("/events");
}
