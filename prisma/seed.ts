import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("admin1234", 10);

  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "管理者",
      email: "admin@example.com",
      password,
      role: "admin",
    },
  });

  console.log("✅ 管理者アカウントを作成しました:");
  console.log("  メール: admin@example.com");
  console.log("  パスワード: admin1234");
  console.log("  ※ ログイン後にパスワードを変更してください");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
