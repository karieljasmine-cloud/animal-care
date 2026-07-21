"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createAuditLog } from "@/lib/audit";

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

  const med = await prisma.medication.findUnique({
    where: { id },
    include: { animal: { select: { name: true } } },
  });

  await prisma.medication.delete({ where: { id } });

  if (med) {
    const user = session.user as { id: string; name?: string };
    await createAuditLog(user.id, user.name ?? "不明", "投薬記録 削除", `${med.animal.name}「${med.medicineName}」`);
  }

  updateTag("medications");
  revalidatePath("/medications");
}

export async function toggleMedicationLog(formData: FormData) {
  const sess = await auth();
  const sId = (sess?.user as { id?: string })?.id;
  const medicationId = formData.get("medicationId") as string;
  const logDate = new Date(formData.get("logDate") as string);
  const timeOfDay = formData.get("timeOfDay") as string;
  const existing = formData.get("existing") as string;

  const med = await prisma.medication.findUnique({
    where: { id: medicationId },
    include: { animal: { select: { name: true } } },
  });
  const dateLabel = logDate.toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" });
  const timeLabel = timeOfDay === "AM" ? "朝" : "夜";

  if (existing === "true") {
    await prisma.medicationLog.deleteMany({ where: { medicationId, logDate, timeOfDay } });
    await prisma.medication.updateMany({
      where: { id: medicationId, remainingDoses: { gt: 0 } },
      data: { remainingDoses: { increment: 1 } },
    });
    if (sId && med) {
      const staffUser = await prisma.user.findUnique({ where: { id: sId }, select: { name: true } });
      await createAuditLog(sId, staffUser?.name ?? "不明", "投薬ログ 取消", `${med.animal.name}「${med.medicineName}」${dateLabel}${timeLabel}`);
    }
  } else {
    await prisma.medicationLog.create({
      data: { medicationId, logDate, timeOfDay, staffId: sId ?? null },
    });
    await prisma.medication.updateMany({
      where: { id: medicationId, remainingDoses: { gt: 0 } },
      data: { remainingDoses: { decrement: 1 } },
    });
    if (sId && med) {
      const staffUser = await prisma.user.findUnique({ where: { id: sId }, select: { name: true } });
      await createAuditLog(sId, staffUser?.name ?? "不明", "投薬ログ 記録", `${med.animal.name}「${med.medicineName}」${dateLabel}${timeLabel}`);
    }
  }
  updateTag("medications");
  revalidatePath("/medications/chart");
}

export async function updateRemainingDosesDirectly(medicationId: string, count: number | null) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await prisma.medication.update({
    where: { id: medicationId },
    data: { remainingDoses: count },
  });

  const user = session.user as { id: string; name?: string };
  await createAuditLog(user.id, user.name ?? "不明", "投薬 残量更新", `ID: ${medicationId} → ${count ?? "なし"}回`);
  updateTag("medications");
}
