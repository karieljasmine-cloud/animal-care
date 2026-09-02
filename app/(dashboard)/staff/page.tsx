import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import SubmitButton from "@/components/SubmitButton";
import bcrypt from "bcryptjs";
import { format } from "date-fns";
import DeleteStaffButton from "@/components/DeleteStaffButton";
import StaffRoleSelect from "@/components/StaffRoleSelect";
import StaffAccessButton from "@/components/StaffAccessButton";

export default async function StaffPage() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "admin") redirect("/animals");

  const staff = await prisma.user.findMany({
    orderBy: [{ isActive: "desc" }, { createdAt: "asc" }],
  });

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

  const roleLabel = (r: string) =>
    r === "admin" ? "管理者" : r === "viewer" ? "閲覧者" : "スタッフ";
  const roleClass = (r: string) =>
    r === "admin"
      ? "bg-purple-100 text-purple-700"
      : r === "viewer"
      ? "bg-blue-100 text-blue-700"
      : "bg-green-100 text-green-700";

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">スタッフ管理</h1>

      <p className="text-sm text-gray-500 -mt-4">
        記録を残したままアクセスだけ止めたい場合は「アクセス無効化」を使ってください。削除は記録が一切ないスタッフのみ可能です。
      </p>

      {/* スタッフ一覧 */}

      {/* モバイル: カードレイアウト */}
      <div className="md:hidden space-y-2">
        {staff.map((s) => {
          const isSelf = session?.user?.email === s.email;
          return (
            <div
              key={s.id}
              className={`bg-white rounded-xl shadow-sm p-4 ${s.isActive ? "" : "opacity-60"}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-gray-800 flex items-center gap-2">
                    {s.name}
                    {!s.isActive && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-600">
                        アクセス無効
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 mt-0.5 break-all">{s.email}</div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ml-2 ${roleClass(s.role)}`}
                >
                  {roleLabel(s.role)}
                </span>
              </div>

              <div className="flex flex-wrap justify-between items-center gap-2 mt-3">
                <span className="text-xs text-gray-400">
                  {format(new Date(s.createdAt), "yyyy/MM/dd")} 登録
                </span>
                {isSelf ? (
                  <span className="text-xs text-gray-400">（自分）</span>
                ) : (
                  <div className="flex items-center gap-3">
                    <StaffRoleSelect id={s.id} role={s.role} />
                    <StaffAccessButton id={s.id} name={s.name} isActive={s.isActive} />
                    <DeleteStaffButton id={s.id} name={s.name} />
                  </div>
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
              <th className="text-left px-4 py-3 font-medium text-gray-600">状態</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">登録日</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s, i) => {
              const isSelf = session?.user?.email === s.email;
              return (
                <tr
                  key={s.id}
                  className={`border-t ${i % 2 === 0 ? "bg-white" : "bg-gray-50"} ${
                    s.isActive ? "" : "opacity-60"
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-gray-800">{s.name}</td>
                  <td className="px-4 py-3 text-gray-600">{s.email}</td>
                  <td className="px-4 py-3">
                    {isSelf ? (
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleClass(s.role)}`}
                      >
                        {roleLabel(s.role)}
                      </span>
                    ) : (
                      <StaffRoleSelect id={s.id} role={s.role} />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {s.isActive ? (
                      <span className="text-xs text-green-700">有効</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-600">
                        アクセス無効
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {format(new Date(s.createdAt), "yyyy/MM/dd")}
                  </td>
                  <td className="px-4 py-3">
                    {isSelf ? (
                      <span className="text-xs text-gray-400">（自分）</span>
                    ) : (
                      <div className="flex items-center gap-3 justify-end">
                        <StaffAccessButton id={s.id} name={s.name} isActive={s.isActive} />
                        <DeleteStaffButton id={s.id} name={s.name} />
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
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
          <SubmitButton
            className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-60"
            loadingText="追加中..."
          >
            追加する
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}
