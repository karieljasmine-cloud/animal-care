"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createAuditLog } from "@/lib/audit";

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

  const animal = await prisma.animal.findUnique({ where: { id: animalId }, select: { name: true } });

  await prisma.animalEvent.create({
    data: {
      animalId,
      eventDate: new Date(eventDate),
      eventType,
      title,
      notes: notes || null,
    },
  });

  const user = session.user as { id: string; name?: string };
  await createAuditLog(user.id, user.name ?? "不明", "特記事項 追加", `${animal?.name ?? animalId}「${title}」(${eventDate})`);

  updateTag("animal-events");
  revalidatePath("/events");
  redirect("/events");
}

export async function deleteAnimalEvent(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const ev = await prisma.animalEvent.findUnique({
    where: { id },
    include: { animal: { select: { name: true } } },
  });

  await prisma.animalEvent.delete({ where: { id } });

  if (ev) {
    const user = session.user as { id: string; name?: string };
    await createAuditLog(user.id, user.name ?? "不明", "特記事項 削除", `${ev.animal.name}「${ev.title}」`);
  }

  updateTag("animal-events");
  revalidatePath("/events");
}
