"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

export async function logCatToilet(animalId: string, logType: "sand" | "sheet") {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const cat = await prisma.animal.findUnique({ where: { id: animalId }, select: { name: true } });

  await prisma.catToiletLog.create({
    data: { animalId, logType, changedAt: new Date() },
  });

  const user = session.user as { id: string; name?: string };
  const label = logType === "sand" ? "猫砂（全替）" : "トイレシーツ交換";
  await createAuditLog(user.id, user.name ?? "不明", "猫トイレ 記録", `${cat?.name ?? animalId} ${label}`);
  // revalidatePath はクライアント側 router.refresh() で制御するため呼ばない
}

export async function deleteCatToiletLog(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const log = await prisma.catToiletLog.findUnique({
    where: { id },
    select: { logType: true, animal: { select: { name: true } } },
  });

  await prisma.catToiletLog.delete({ where: { id } });

  const user = session.user as { id: string; name?: string };
  const label = log?.logType === "sand" ? "猫砂（全替）" : "トイレシーツ交換";
  await createAuditLog(user.id, user.name ?? "不明", "猫トイレ 削除", `${log?.animal.name ?? id} ${label}`);
}

export async function updateCatToiletLog(id: string, changedAtStr: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const changedAt = new Date(changedAtStr);
  await prisma.catToiletLog.update({ where: { id }, data: { changedAt } });

  const user = session.user as { id: string; name?: string };
  await createAuditLog(user.id, user.name ?? "不明", "猫トイレ 編集", `ID: ${id} → ${changedAtStr}`);
}
