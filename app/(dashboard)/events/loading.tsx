function Pulse({ className }: { className: string }) {
  return <div className={`bg-gray-200 rounded animate-pulse ${className}`} />;
}

export default function Loading() {
  return (
    <div>
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-4">
        <Pulse className="h-8 w-36" />
        <Pulse className="h-9 w-28" />
      </div>

      {/* 種別タブ */}
      <div className="flex gap-2 mb-2">
        <Pulse className="h-8 w-14 rounded-full" />
        <Pulse className="h-8 w-16 rounded-full" />
        <Pulse className="h-8 w-16 rounded-full" />
      </div>

      {/* フィルタータブ */}
      <div className="flex gap-2 mb-3">
        <Pulse className="h-8 w-16 rounded-full" />
        <Pulse className="h-8 w-28 rounded-full" />
        <Pulse className="h-8 w-20 rounded-full" />
        <Pulse className="h-8 w-24 rounded-full" />
      </div>

      {/* 月ナビ */}
      <div className="bg-white rounded-lg shadow-sm px-4 py-2 mb-4 flex justify-between items-center">
        <Pulse className="h-8 w-20" />
        <Pulse className="h-5 w-24" />
        <Pulse className="h-8 w-20" />
      </div>

      {/* カレンダーグリッド */}
      <div className="-mx-4 bg-white shadow-sm mb-6">
        <div className="grid grid-cols-7 border-b bg-gray-50">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="py-1.5 flex justify-center">
              <Pulse className="h-3 w-4" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 divide-x divide-y">
          {[...Array(35)].map((_, i) => (
            <div key={i} className="min-h-[90px] p-1 bg-white">
              <Pulse className="h-5 w-5 rounded-full mx-auto mb-1" />
              <Pulse className="h-3 w-full mb-0.5" />
              <Pulse className="h-3 w-4/5" />
            </div>
          ))}
        </div>
      </div>

      {/* イベント一覧 */}
      <Pulse className="h-5 w-32 mb-3" />
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm px-4 py-3 flex items-start gap-3">
            <Pulse className="h-6 w-24 rounded-full shrink-0" />
            <div className="flex-1">
              <Pulse className="h-4 w-48 mb-1" />
              <Pulse className="h-3 w-32" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
