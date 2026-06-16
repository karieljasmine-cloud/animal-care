import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import { ja } from "date-fns/locale";
import { unstable_cache } from "next/cache";
import AnimalSelectorClient from "@/components/AnimalSelectorClient";
import DeleteEventButton from "@/components/DeleteEventButton";
import CalendarCell from "@/components/CalendarCell";

const EVENT_TYPE_CONFIG = {
  adHocMed: { label: "突発的なお薬", color: "bg-purple-100 text-purple-800", dotColor: "bg-purple-500", icon: "💊" },
  care: { label: "ケア", color: "bg-blue-100 text-blue-800", dotColor: "bg-blue-500", icon: "✂️" },
  injury: { label: "怪我・異常", color: "bg-red-100 text-red-800", dotColor: "bg-red-500", icon: "🩹" },
} as const;

type EventType = keyof typeof EVENT_TYPE_CONFIG;

function getCalendarData(monthStr: string, animalId: string, type: string) {
  return unstable_cache(
    async () => {
      const [year, month] = monthStr.split("-").map(Number);
      const start = startOfMonth(new Date(year, month - 1));
      const end = endOfMonth(new Date(year, month - 1));

      const [events, animals] = await Promise.all([
        prisma.animalEvent.findMany({
          where: {
            eventDate: { gte: start, lte: end },
            ...(animalId ? { animalId } : {}),
            ...(type ? { eventType: type } : {}),
          },
          include: { animal: { select: { id: true, name: true } } },
          orderBy: { eventDate: "asc" },
        }),
        prisma.animal.findMany({
          where: { isActive: true },
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        }),
      ]);

      return { events, animals };
    },
    ["animal-events-calendar", monthStr, animalId || "all", type || "all"],
    { revalidate: 30, tags: ["animal-events", "animals"] }
  )();
}

function buildUrl(month: string, type: string, animalId: string) {
  const p = new URLSearchParams();
  if (month) p.set("month", month);
  if (type) p.set("type", type);
  if (animalId) p.set("animalId", animalId);
  return `/events?${p.toString()}`;
}

const DOW = ["日", "月", "火", "水", "木", "金", "土"];

export default async function EventsCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; type?: string; animalId?: string }>;
}) {
  const sp = await searchParams;
  const monthStr = sp.month ?? format(new Date(), "yyyy-MM");
  const typeFilter = sp.type ?? "";
  const animalIdFilter = sp.animalId ?? "";

  const { events, animals } = await getCalendarData(monthStr, animalIdFilter, typeFilter);

  const [year, month] = monthStr.split("-").map(Number);
  const currentDate = new Date(year, month - 1);
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calDays = eachDayOfInterval({ start: calStart, end: calEnd });

  const prevMonth = format(subMonths(currentDate, 1), "yyyy-MM");
  const nextMonth = format(addMonths(currentDate, 1), "yyyy-MM");

  // Group events by date key
  const eventsByDate = new Map<string, typeof events>();
  for (const ev of events) {
    const key = format(new Date(ev.eventDate), "yyyy-MM-dd");
    if (!eventsByDate.has(key)) eventsByDate.set(key, []);
    eventsByDate.get(key)!.push(ev);
  }

  const filterTabs = [
    { value: "", label: "全種別" },
    { value: "adHocMed", label: "💊 突発的なお薬" },
    { value: "care", label: "✂️ ケア" },
    { value: "injury", label: "🩹 怪我・異常" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">特記事項カレンダー</h1>
        <Link
          href="/events/new"
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
        >
          ＋ 記録を追加
        </Link>
      </div>

      {/* Type filter tabs */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {filterTabs.map(({ value, label }) => (
          <Link
            key={value}
            href={buildUrl(monthStr, value, animalIdFilter)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              typeFilter === value
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Month navigation + Animal selector */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="flex items-center justify-between bg-white rounded-lg shadow-sm px-4 py-2 flex-1">
          <Link
            href={buildUrl(prevMonth, typeFilter, animalIdFilter)}
            className="text-sm text-gray-600 hover:text-green-600 font-medium px-3 py-1.5 rounded hover:bg-green-50 transition-colors"
          >
            ← 前の月
          </Link>
          <div className="text-center">
            <div className="font-semibold text-gray-700">
              {format(currentDate, "yyyy年M月", { locale: ja })}
            </div>
          </div>
          <Link
            href={buildUrl(nextMonth, typeFilter, animalIdFilter)}
            className="text-sm text-gray-600 hover:text-green-600 font-medium px-3 py-1.5 rounded hover:bg-green-50 transition-colors"
          >
            次の月 →
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow-sm px-4 py-2">
          <AnimalSelectorClient
            animals={animals}
            currentAnimalId={animalIdFilter}
            currentMonth={monthStr}
            currentType={typeFilter}
          />
        </div>
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        {/* Day of week header */}
        <div className="grid grid-cols-7 border-b bg-gray-50">
          {DOW.map((d, i) => (
            <div
              key={d}
              className={`py-1.5 text-center text-[10px] font-semibold ${
                i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-gray-500"
              }`}
            >
              {d}
            </div>
          ))}
        </div>
        {/* Calendar cells */}
        <div className="grid grid-cols-7 divide-x divide-y">
          {calDays.map((day) => {
            const dateKey = format(day, "yyyy-MM-dd");
            const dayEvents = eventsByDate.get(dateKey) ?? [];
            const inMonth = isSameMonth(day, currentDate);
            const today = isToday(day);
            const dow = day.getDay();

            return (
              <CalendarCell
                key={dateKey}
                dayNum={parseInt(format(day, "d"))}
                inMonth={inMonth}
                today={today}
                dow={dow}
                events={dayEvents.map((ev) => ({
                  id: ev.id,
                  eventType: ev.eventType,
                  title: ev.title,
                  animalName: ev.animal.name,
                }))}
              />
            );
          })}
        </div>
      </div>

      {/* Event list for the month */}
      <h2 className="text-base font-semibold text-gray-700 mb-3">
        {format(currentDate, "M月", { locale: ja })}のイベント一覧
        {events.length > 0 && (
          <span className="text-sm font-normal text-gray-400 ml-2">（{events.length}件）</span>
        )}
      </h2>

      {events.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-400 text-sm">
          この月の記録はありません
          <div className="mt-3">
            <Link href="/events/new" className="text-green-600 hover:underline">
              ＋ 記録を追加する
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {events.map((ev) => {
            const cfg = EVENT_TYPE_CONFIG[ev.eventType as EventType];
            return (
              <div
                key={ev.id}
                className="bg-white rounded-lg shadow-sm px-4 py-3 flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium mt-0.5 whitespace-nowrap shrink-0 ${cfg?.color ?? "bg-gray-100 text-gray-700"}`}
                  >
                    {cfg?.icon} {cfg?.label ?? ev.eventType}
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-800">
                      <span className="text-gray-500 mr-1">
                        {format(new Date(ev.eventDate), "M/d(E)", { locale: ja })}
                      </span>
                      {ev.animal.name}：{ev.title}
                    </div>
                    {ev.notes && (
                      <div className="text-xs text-gray-500 mt-0.5 truncate">{ev.notes}</div>
                    )}
                  </div>
                </div>
                <DeleteEventButton id={ev.id} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
