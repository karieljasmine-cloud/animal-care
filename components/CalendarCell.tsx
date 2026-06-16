"use client";

import { useState } from "react";

const EVENT_TYPE_CONFIG = {
  adHocMed: { color: "bg-purple-100 text-purple-800", icon: "💊" },
  care: { color: "bg-blue-100 text-blue-800", icon: "✂️" },
  injury: { color: "bg-red-100 text-red-800", icon: "🩹" },
} as const;

type EventType = keyof typeof EVENT_TYPE_CONFIG;

type CellEvent = {
  id: string;
  eventType: string;
  title: string;
  animalName: string;
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
  const MAX = 5;
  const visibleEvents = expanded ? events : events.slice(0, MAX);
  const hasMore = events.length > MAX;

  return (
    <div className={`min-h-[80px] p-0.5 ${!inMonth ? "bg-gray-50" : "bg-white"}`}>
      <div
        className={`text-[10px] font-semibold mb-0.5 w-5 h-5 flex items-center justify-center rounded-full mx-auto ${
          today
            ? "bg-green-600 text-white"
            : dow === 0
            ? inMonth ? "text-red-500" : "text-red-200"
            : dow === 6
            ? inMonth ? "text-blue-500" : "text-blue-200"
            : inMonth
            ? "text-gray-700"
            : "text-gray-300"
        }`}
      >
        {dayNum}
      </div>
      <div className="space-y-0.5">
        {visibleEvents.map((ev) => {
          const cfg = EVENT_TYPE_CONFIG[ev.eventType as EventType];
          return (
            <div
              key={ev.id}
              className={`text-[9px] px-0.5 py-px rounded leading-tight truncate ${cfg?.color ?? "bg-gray-100 text-gray-700"}`}
              title={`${ev.animalName}：${ev.title}`}
            >
              {cfg?.icon}{ev.animalName.slice(0, 5)}
            </div>
          );
        })}
        {hasMore && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="text-[9px] text-blue-500 hover:text-blue-700 leading-tight pl-0.5"
          >
            +{events.length - MAX}件
          </button>
        )}
      </div>
    </div>
  );
}
