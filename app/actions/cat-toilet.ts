"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { createAuditLog } from "@/lib/audit";

export async function logCatToilet(animalId: string, logType: "sand" | "sheet") {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const [cat] = await Promise.all([
    prisma.animal.findUnique({ where: { id: animalId }, select: { name: true } }),
  ]);

  await prisma.catToiletLog.create({
    data: { animalId, logType, changedAt: new Date() },
  });

  const user = session.user as { id: string; name?: string };
  const label = logType === "sand" ? "猫砂（全替）" : "トイレシーツ交換";
  await createAuditLog(user.id, user.name ?? "不明", "猫トイレ 記録", `${cat?.name ?? animalId} ${label}`);

  revalidatePath("/cat-toilet");
}
