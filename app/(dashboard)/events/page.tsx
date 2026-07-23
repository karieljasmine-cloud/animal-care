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
import FilterTabs from "@/components/FilterTabs";

const EVENT_TYPE_CONFIG = {
  adHocMed: { label: "突発的なお薬", color: "bg-purple-100 text-purple-800", dotColor: "bg-purple-500", icon: "💊" },
  care: { label: "ケア", color: "bg-blue-100 text-blue-800", dotColor: "bg-blue-500", icon: "✂️" },
  injury: { label: "怪我・異常", color: "bg-red-100 text-red-800", dotColor: "bg-red-500", icon: "🩹" },
  inHeat: { label: "ヒート", color: "bg-pink-100 text-pink-800", dotColor: "bg-pink-500", icon: "🌸" },
  health: { label: "健康状態", color: "bg-teal-100 text-teal-800", dotColor: "bg-teal-500", icon: "🏥" },
} as const;

type EventType = keyof typeof EVENT_TYPE_CONFIG;

type DisplayEvent = {
  id: string;
  eventDate: Date;
  eventType: string;
  title: string;
  notes: string | null;
  animal: { id: string; name: string };
  isFromDailyRecord: boolean;
};

function getCalendarData(monthStr: string, animalId: string, type: string, species: string) {
  return unstable_cache(
    async () => {
      const [year, month] = monthStr.split("-").map(Number);
      const start = startOfMonth(new Date(year, month - 1));
      const end = endOfMonth(new Date(year, month - 1));

      const fetchDrCare = !type || type === "care";
      const fetchDrInjury = !type || type === "injury";
      const fetchDrInHeat = !type || type === "inHeat";
      const fetchDrHealth = !type || type === "health";
      const fetchDailyRecords = fetchDrCare || fetchDrInjury || fetchDrInHeat || fetchDrHealth;

      const drOrConditions = [
        ...(fetchDrCare ? [
          { brushing: true as const },
          { nailTrimming: true as const },
          { trimming: true as const },
          { shampoo: true as const },
          { earCleaning: true as const },
        ] : []),
        ...(fetchDrInjury ? [{ injury: { not: null } }] : []),
        ...(fetchDrInHeat ? [{ inHeat: true as const }] : []),
        ...(fetchDrHealth ? [
          { energyLevel: { not: null } },
          { appetite: { not: null } },
          { foodAmount: { not: null } },
          { notes: { not: null } },
        ] : []),
      ];

      const [events, animals, dailyRecords] = await Promise.all([
        prisma.animalEvent.findMany({
          where: {
            eventDate: { gte: start, lte: end },
            ...(animalId ? { animalId } : {}),
            ...(type ? { eventType: type } : {}),
            ...(species ? { animal: { species } } : {}),
          },
          include: { animal: { select: { id: true, name: true } } },
          orderBy: { eventDate: "asc" },
        }),
        prisma.animal.findMany({
          where: { isActive: true, ...(species ? { species } : {}) },
          select: { id: true, name: true, nameKana: true, species: true },
          orderBy: { nameKana: "asc" },
        }),
        fetchDailyRecords && drOrConditions.length > 0
          ? prisma.dailyRecord.findMany({
              where: {
                recordDate: { gte: start, lte: end },
                ...(animalId ? { animalId } : {}),
                ...(species ? { animal: { species } } : {}),
                OR: drOrConditions,
              },
              select: {
                id: true,
                recordDate: true,
                brushing: true,
                nailTrimming: true,
                trimming: true,
                shampoo: true,
                earCleaning: true,
                inHeat: true,
                injury: true,
                energyLevel: true,
                appetite: true,
                foodAmount: true,
                notes: true,
                animalId: true,
                animal: { select: { id: true, name: true } },
              },
              orderBy: { recordDate: "asc" },
            })
          : Promise.resolve([]),
      ]);

      return { events, animals, dailyRecords };
    },
    ["animal-events-calendar", monthStr, animalId || "all", type || "all", species || "all"],
    { revalidate: 30, tags: ["animal-events", "animals", "daily-records"] }
  )();
}

function buildUrl(month: string, type: string, animalId: string, species: string) {
  const p = new URLSearchParams();
  if (month) p.set("month", month);
  if (type) p.set("type", type);
  if (animalId) p.set("animalId", animalId);
  if (species) p.set("species", species);
  return `/events?${p.toString()}`;
}

const DOW = ["日", "月", "火", "水", "木", "金", "土"];

export default async function EventsCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; type?: string; animalId?: string; species?: string }>;
}) {
  const sp = await searchParams;
  const monthStr = sp.month ?? format(new Date(), "yyyy-MM");
  const typeFilter = sp.type ?? "";
  const animalIdFilter = sp.animalId ?? "";
  const speciesFilter = sp.species ?? "";

  const { events, animals, dailyRecords } = await getCalendarData(monthStr, animalIdFilter, typeFilter, speciesFilter);

  // 日次記録から仮想イベントを生成
  const drEvents: DisplayEvent[] = [];
  for (const dr of dailyRecords) {
    const careItems: string[] = [];
    if (dr.brushing) careItems.push("ブラッシング");
    if (dr.nailTrimming) careItems.push("爪切り");
    if (dr.trimming) careItems.push("トリミング");
    if (dr.shampoo) careItems.push("シャンプー");
    if (dr.earCleaning) careItems.push("耳掃除");

    if (careItems.length > 0) {
      drEvents.push({
        id: `dr-care-${dr.id}`,
        eventDate: dr.recordDate,
        eventType: "care",
        title: careItems.join("・"),
        notes: null,
        animal: dr.animal,
        isFromDailyRecord: true,
      });
    }
    if (dr.injury) {
      drEvents.push({
        id: `dr-injury-${dr.id}`,
        eventDate: dr.recordDate,
        eventType: "injury",
        title: dr.injury,
        notes: null,
        animal: dr.animal,
        isFromDailyRecord: true,
      });
    }
    if (dr.inHeat) {
      drEvents.push({
        id: `dr-inHeat-${dr.id}`,
        eventDate: dr.recordDate,
        eventType: "inHeat",
        title: "ヒート",
        notes: null,
        animal: dr.animal,
        isFromDailyRecord: true,
      });
    }

    const healthParts: string[] = [];
    if (dr.energyLevel) healthParts.push(`元気${"★".repeat(dr.energyLevel)}`);
    if (dr.appetite) healthParts.push(`食欲:${dr.appetite}`);
    if (dr.foodAmount) healthParts.push(dr.foodAmount);
    if (healthParts.length > 0 || dr.notes) {
      drEvents.push({
        id: `dr-health-${dr.id}`,
        eventDate: dr.recordDate,
        eventType: "health",
        title: healthParts.join(" / ") || "健康記録",
        notes: dr.notes,
        animal: dr.animal,
        isFromDailyRecord: true,
      });
    }
  }

  // 全イベントをマージ（日付順）
  const allEvents: DisplayEvent[] = [
    ...events.map((ev) => ({
      id: ev.id,
      eventDate: ev.eventDate,
      eventType: ev.eventType,
      title: ev.title,
      notes: ev.notes,
      animal: ev.animal,
      isFromDailyRecord: false,
    })),
    ...drEvents,
  ].sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());

  const [year, month] = monthStr.split("-").map(Number);
  const currentDate = new Date(year, month - 1);
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calDays = eachDayOfInterval({ start: calStart, end: calEnd });

  const prevMonth = format(subMonths(currentDate, 1), "yyyy-MM");
  const nextMonth = format(addMonths(currentDate, 1), "yyyy-MM");

  const eventsByDate = new Map<string, DisplayEvent[]>();
  for (const ev of allEvents) {
    const key = format(new Date(ev.eventDate), "yyyy-MM-dd");
    if (!eventsByDate.has(key)) eventsByDate.set(key, []);
    eventsByDate.get(key)!.push(ev);
  }

  const speciesTabs = [
    { value: "", label: "全体", href: buildUrl(monthStr, typeFilter, "", "") },
    { value: "犬", label: "🐕 犬", href: buildUrl(monthStr, typeFilter, "", "犬") },
    { value: "猫", label: "🐈 猫", href: buildUrl(monthStr, typeFilter, "", "猫") },
  ];

  const filterTabs = [
    { value: "", label: "全種別", href: buildUrl(monthStr, "", animalIdFilter, speciesFilter) },
    { value: "health", label: "🏥 健康状態", href: buildUrl(monthStr, "health", animalIdFilter, speciesFilter) },
    { value: "adHocMed", label: "💊 突発的なお薬", href: buildUrl(monthStr, "adHocMed", animalIdFilter, speciesFilter) },
    { value: "care", label: "✂️ ケア", href: buildUrl(monthStr, "care", animalIdFilter, speciesFilter) },
    { value: "injury", label: "🩹 怪我・異常", href: buildUrl(monthStr, "injury", animalIdFilter, speciesFilter) },
    { value: "inHeat", label: "🌸 ヒート", href: buildUrl(monthStr, "inHeat", animalIdFilter, speciesFilter) },
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

      {/* Species tabs */}
      <div className="mb-2">
        <FilterTabs tabs={speciesTabs} currentValue={speciesFilter} activeStyle="bg-gray-700 text-white" />
      </div>

      {/* Type filter tabs */}
      <div className="mb-3">
        <FilterTabs tabs={filterTabs} currentValue={typeFilter} />
      </div>

      {/* Month navigation + Animal selector */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="flex items-stretch bg-white rounded-lg shadow-sm overflow-hidden flex-1">
          <Link
            href={buildUrl(prevMonth, typeFilter, animalIdFilter, speciesFilter)}
            className="flex-1 flex items-center gap-1 py-3 px-4 text-sm text-gray-600 hover:text-green-600 font-medium hover:bg-green-50 transition-colors"
          >
            ← 前の月
          </Link>
          <div className="text-center py-2 px-3 border-x border-gray-100 shrink-0">
            <div className="font-semibold text-gray-700">
              {format(currentDate, "yyyy年M月", { locale: ja })}
            </div>
          </div>
          <Link
            href={buildUrl(nextMonth, typeFilter, animalIdFilter, speciesFilter)}
            className="flex-1 flex items-center justify-end gap-1 py-3 px-4 text-sm text-gray-600 hover:text-green-600 font-medium hover:bg-green-50 transition-colors"
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
            currentSpecies={speciesFilter}
          />
        </div>
      </div>

      {/* Calendar grid */}
      <div className="bg-white shadow-sm overflow-hidden mb-6 -mx-4">
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
                  isFromDailyRecord: ev.isFromDailyRecord,
                }))}
              />
            );
          })}
        </div>
      </div>

      {/* Event list for the month */}
      <h2 className="text-base font-semibold text-gray-700 mb-3">
        {format(currentDate, "M月", { locale: ja })}のイベント一覧
        {allEvents.length > 0 && (
          <span className="text-sm font-normal text-gray-400 ml-2">（{allEvents.length}件）</span>
        )}
      </h2>

      {allEvents.length === 0 ? (
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
          {allEvents.map((ev) => {
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
                    {ev.isFromDailyRecord && (
                      <div className="text-xs text-gray-400 mt-0.5">日次記録より自動表示</div>
                    )}
                  </div>
                </div>
                {!ev.isFromDailyRecord && <DeleteEventButton id={ev.id} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
