"use client";

import { clearDailyRecordEvent } from "@/app/actions/daily-records";

type DrEventType = "care" | "injury" | "inHeat" | "health";

const CONFIRM_MESSAGES: Record<DrEventType, string> = {
  care: "このケア記録をカレンダーから削除しますか？\n（日次記録のケア項目がすべてオフになります）",
  injury: "この怪我・異常の記録を削除しますか？\n（日次記録の怪我情報がクリアされます）",
  inHeat: "このヒート記録を削除しますか？\n（日次記録のヒートチェックがオフになります）",
  health: "この健康状態の記録を削除しますか？\n（元気・食欲・食事量・備考がクリアされます）",
};

export default function DeleteDrEventButton({
  dailyRecordId,
  eventType,
}: {
  dailyRecordId: string;
  eventType: DrEventType;
}) {
  async function handleDelete() {
    if (!confirm(CONFIRM_MESSAGES[eventType])) return;
    await clearDailyRecordEvent(dailyRecordId, eventType);
  }

  return (
    <button
      onClick={handleDelete}
      className="text-red-400 hover:text-red-600 text-xs whitespace-nowrap shrink-0 px-2 py-1 rounded hover:bg-red-50 transition-colors"
    >
      削除
    </button>
  );
}
