import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { format } from "date-fns";
import DeleteStaffButton from "@/components/DeleteStaffButton";

export default async function StaffPage() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "admin") redirect("/animals");

  const staff = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  async function createStaff(formData: FormData) {
    "use server";
    const sess = await auth();
    if ((sess?.user as { role?: string })?.role !== "admin") throw new Error("Unauthorized");

    const password = formData.get("password") as string;
    const hashed = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        password: hashed,
        role: (formData.get("role") as string) || "staff",
      },
    });

    revalidatePath("/staff");
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">スタッフ管理</h1>

      {/* スタッフ一覧 */}

      {/* モバイル: カードレイアウト */}
      <div className="md:hidden space-y-2">
        {staff.map((s) => {
          const roleLabel = s.role === "admin" ? "管理者" : s.role === "viewer" ? "閲覧者" : "スタッフ";
          const roleClass = s.role === "admin"
            ? "bg-purple-100 text-purple-700"
            : s.role === "viewer"
            ? "bg-blue-100 text-blue-700"
            : "bg-green-100 text-green-700";
          return (
            <div key={s.id} className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-gray-800">{s.name}</div>
                  <div className="text-sm text-gray-500 mt-0.5 break-all">{s.email}</div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ml-2 ${roleClass}`}>
                  {roleLabel}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-400">{format(new Date(s.createdAt), "yyyy/MM/dd")} 登録</span>
                {session?.user?.email !== s.email && (
                  <DeleteStaffButton id={s.id} name={s.name} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* デスクトップ: テーブルレイアウト */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-green-50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">名前</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">メールアドレス</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">権限</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">登録日</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s, i) => (
              <tr key={s.id} className={`border-t ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                <td className="px-4 py-3 font-medium text-gray-800">{s.name}</td>
                <td className="px-4 py-3 text-gray-600">{s.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      s.role === "admin"
                        ? "bg-purple-100 text-purple-700"
                        : s.role === "viewer"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {s.role === "admin" ? "管理者" : s.role === "viewer" ? "閲覧者" : "スタッフ"}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {format(new Date(s.createdAt), "yyyy/MM/dd")}
                </td>
                <td className="px-4 py-3">
                  {session?.user?.email !== s.email && (
                    <DeleteStaffButton id={s.id} name={s.name} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 新規スタッフ追加 */}
      <div className="bg-white rounded-xl shadow-sm p-6 max-w-lg">
        <h2 className="font-semibold text-gray-700 mb-4">新規スタッフを追加</h2>
        <form action={createStaff} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">名前 *</label>
            <input
              type="text"
              name="name"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス *</label>
            <input
              type="email"
              name="email"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">パスワード *</label>
            <input
              type="password"
              name="password"
              required
              minLength={8}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="8文字以上"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">権限</label>
            <select
              name="role"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="staff">スタッフ（台帳アクセス不可）</option>
              <option value="viewer">閲覧者（台帳閲覧のみ）</option>
              <option value="admin">管理者（全権限）</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700"
          >
            追加する
          </button>
        </form>
      </div>
    </div>
  );
}
