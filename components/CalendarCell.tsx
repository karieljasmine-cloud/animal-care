"use client";

import { useState } from "react";

const EVENT_TYPE_CONFIG = {
  adHocMed: { color: "bg-purple-100 text-purple-800", icon: "💊", label: "突発的なお薬" },
  care: { color: "bg-blue-100 text-blue-800", icon: "✂️", label: "ケア" },
  injury: { color: "bg-red-100 text-red-800", icon: "🩹", label: "怪我・異常" },
  inHeat: { color: "bg-pink-100 text-pink-800", icon: "🌸", label: "ヒート" },
  health: { color: "bg-teal-100 text-teal-800", icon: "🏥", label: "健康状態" },
} as const;

type EventType = keyof typeof EVENT_TYPE_CONFIG;

type CellEvent = {
  id: string;
  eventType: string;
  title: string;
  animalName: string;
  isFromDailyRecord?: boolean;
};

type Props = {
  dayNum: number;
  inMonth: boolean;
  today: boolean;
  dow: number;
  events: CellEvent[];
};

export default function CalendarCell({ dayNum, inMonth, today, dow, events }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const MAX = 5;
  const visibleEvents = expanded ? events : events.slice(0, MAX);
  const hasMore = events.length > MAX;

  const dateColor = today
    ? "bg-green-600 text-white"
    : dow === 0
    ? inMonth ? "text-red-500" : "text-red-200"
    : dow === 6
    ? inMonth ? "text-blue-500" : "text-blue-200"
    : inMonth
    ? "text-gray-700"
    : "text-gray-300";

  return (
    <div className={`min-h-[90px] p-0.5 relative ${!inMonth ? "bg-gray-50" : "bg-white"}`}>
      {/* 日付数字 — タップでポップアップ */}
      <button
        onClick={() => events.length > 0 && setPopupOpen(true)}
        className={`text-[11px] font-semibold mb-0.5 w-5 h-5 flex items-center justify-center rounded-full mx-auto ${dateColor} ${
          events.length > 0 && !today ? "hover:bg-green-100 transition-colors" : ""
        }`}
        aria-label={`${dayNum}日 ${events.length}件のイベント`}
      >
        {dayNum}
      </button>

      {/* バッジ一覧 */}
      <div className="space-y-0.5">
        {visibleEvents.map((ev) => {
          const cfg = EVENT_TYPE_CONFIG[ev.eventType as EventType];
          // 名前は最大4文字（日本語全角に合わせ）
          const nameShort = ev.animalName.slice(0, 4);
          return (
            <div
              key={ev.id}
              className={`text-[10px] px-0.5 py-px rounded leading-tight overflow-hidden whitespace-nowrap ${cfg?.color ?? "bg-gray-100 text-gray-700"}`}
              title={`${ev.animalName}：${ev.title}`}
            >
              {cfg?.icon}{nameShort}
            </div>
          );
        })}
        {hasMore && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="text-[10px] text-blue-500 hover:text-blue-700 leading-tight"
          >
            +{events.length - MAX}件
          </button>
        )}
      </div>

      {/* ポップアップオーバーレイ */}
      {popupOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setPopupOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b">
              <span className="font-semibold text-gray-800 text-base">{dayNum}日のイベント（{events.length}件）</span>
              <button
                onClick={() => setPopupOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ✕
              </button>
            </div>
            <div className="p-3 space-y-2">
              {events.map((ev) => {
                const cfg = EVENT_TYPE_CONFIG[ev.eventType as EventType];
                return (
                  <div key={ev.id} className={`rounded-lg px-3 py-2 ${cfg?.color ?? "bg-gray-100 text-gray-700"} ${ev.isFromDailyRecord ? "opacity-80 ring-1 ring-inset ring-current/20" : ""}`}>
                    <div className="text-xs font-semibold flex items-center gap-1">
                      {cfg?.icon} {cfg?.label ?? ev.eventType}
                      {ev.isFromDailyRecord && <span className="text-xs font-normal opacity-70">（日次記録）</span>}
                    </div>
                    <div className="text-sm font-bold mt-0.5">{ev.animalName}</div>
                    <div className="text-xs mt-0.5 opacity-80">{ev.title}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
