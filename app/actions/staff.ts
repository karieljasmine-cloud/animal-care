"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { createAuditLog } from "@/lib/audit";

const ROLE_LABELS: Record<string, string> = {
  admin: "管理者",
  viewer: "閲覧者",
  staff: "スタッフ",
};

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  if ((session.user as { role?: string }).role !== "admin") throw new Error("Unauthorized");
  return session.user as { id: string; name?: string | null };
}

export async function deleteStaff(id: string) {
  const admin = await requireAdmin();
  if (admin.id === id) throw new Error("自分自身は削除できません");

  const target = await prisma.user.findUnique({
    where: { id },
    select: {
      name: true,
      email: true,
      _count: { select: { dailyRecords: true, medications: true, medicationLogs: true } },
    },
  });
  if (!target) throw new Error("対象のスタッフが見つかりません");

  const linked =
    target._count.dailyRecords + target._count.medications + target._count.medicationLogs;
  if (linked > 0) {
    throw new Error(
      `「${target.name}」は日誌・投薬などの記録に紐づいているため削除できません。記録を残したままアクセスを止めるには「アクセス無効化」を使ってください。`
    );
  }

  await prisma.user.delete({ where: { id } });
  await createAuditLog(admin.id, admin.name ?? "不明", "スタッフ 削除", `${target.name}（${target.email}）`);

  revalidatePath("/staff");
}

export async function updateStaffRole(id: string, role: string) {
  const admin = await requireAdmin();
  if (!ROLE_LABELS[role]) throw new Error("不正な権限です");
  if (admin.id === id) throw new Error("自分自身の権限は変更できません");

  const target = await prisma.user.findUnique({ where: { id }, select: { name: true, role: true } });
  if (!target) throw new Error("対象のスタッフが見つかりません");
  if (target.role === role) return;

  await prisma.user.update({ where: { id }, data: { role } });
  await createAuditLog(
    admin.id,
    admin.name ?? "不明",
    "スタッフ 権限変更",
    `${target.name}：${ROLE_LABELS[target.role] ?? target.role} → ${ROLE_LABELS[role]}`
  );

  revalidatePath("/staff");
}

export async function setStaffActive(id: string, isActive: boolean) {
  const admin = await requireAdmin();
  if (admin.id === id) throw new Error("自分自身のアクセスは変更できません");

  const target = await prisma.user.findUnique({ where: { id }, select: { name: true, email: true, isActive: true } });
  if (!target) throw new Error("対象のスタッフが見つかりません");
  if (target.isActive === isActive) return;

  await prisma.user.update({ where: { id }, data: { isActive } });
  await createAuditLog(
    admin.id,
    admin.name ?? "不明",
    isActive ? "スタッフ アクセス再有効化" : "スタッフ アクセス無効化",
    `${target.name}（${target.email}）`
  );

  revalidatePath("/staff");
}
