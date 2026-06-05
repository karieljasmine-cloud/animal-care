"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function deleteStaff(id: string) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "admin") throw new Error("Unauthorized");
  if (session?.user?.id === id) throw new Error("自分自身は削除できません");

  await prisma.user.delete({ where: { id } });
  revalidatePath("/staff");
  redirect("/staff");
}
