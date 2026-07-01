function Pulse({ className }: { className: string }) {
  return <div className={`bg-gray-200 rounded animate-pulse ${className}`} />;
}

export default function Loading() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Pulse className="h-8 w-40" />
      </div>

      <Pulse className="h-10 w-full rounded-lg mb-4" />

      <div className="grid gap-4 sm:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-gray-200">
            <Pulse className="h-5 w-28 mb-3" />
            {/* 砂 */}
            <div className="rounded-lg px-3 py-2 mb-2 bg-amber-50">
              <div className="flex justify-between items-center mb-1">
                <Pulse className="h-4 w-28" />
                <Pulse className="h-5 w-16 rounded-full" />
              </div>
              <Pulse className="h-3 w-40" />
            </div>
            {/* シーツ */}
            <div className="rounded-lg px-3 py-2 bg-sky-50">
              <div className="flex justify-between items-center mb-1">
                <Pulse className="h-4 w-28" />
              </div>
              <Pulse className="h-3 w-32" />
            </div>
            {/* ボタン */}
            <div className="flex gap-2 mt-3">
              <Pulse className="h-9 flex-1 rounded-lg" />
              <Pulse className="h-9 flex-1 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
