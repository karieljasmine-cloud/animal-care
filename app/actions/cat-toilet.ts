"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function logCatToilet(animalId: string, logType: "sand" | "sheet") {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await prisma.catToiletLog.create({
    data: {
      animalId,
      logType,
      changedAt: new Date(),
    },
  });

  revalidatePath("/cat-toilet");
}
