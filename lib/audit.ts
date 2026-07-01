import { prisma } from "./prisma";

export async function createAuditLog(
  userId: string,
  userName: string,
  action: string,
  detail: string
) {
  try {
    await prisma.auditLog.create({
      data: { userId, userName, action, detail },
    });
  } catch {
    // 履歴書き込みエラーはメイン処理に影響させない
  }
}
