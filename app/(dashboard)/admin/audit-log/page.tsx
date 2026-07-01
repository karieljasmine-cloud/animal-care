import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

export default async function AuditLogPage() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "admin") redirect("/daily-records");

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  const actionColors: Record<string, string> = {
    "特記事項 追加": "bg-blue-100 text-blue-800",
    "特記事項 削除": "bg-red-100 text-red-700",
    "投薬記録 削除": "bg-red-100 text-red-700",
    "投薬ログ 記録": "bg-green-100 text-green-700",
    "投薬ログ 取消": "bg-orange-100 text-orange-700",
    "猫トイレ 記録": "bg-purple-100 text-purple-700",
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📜 操作履歴</h1>
        <span className="text-sm text-gray-400">直近300件</span>
      </div>

      {logs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-400 text-sm">
          操作履歴はまだありません
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">日時</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">操作者</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">操作</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">内容</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr key={log.id} className={`border-t ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                    <td className="px-4 py-2.5 text-gray-500 text-xs whitespace-nowrap">
                      {format(new Date(log.createdAt), "M/d(E) HH:mm", { locale: ja })}
                    </td>
                    <td className="px-4 py-2.5 text-gray-700 text-xs whitespace-nowrap font-medium">
                      {log.userName}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${actionColors[log.action] ?? "bg-gray-100 text-gray-600"}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-gray-600 text-xs">{log.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
