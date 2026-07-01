function Pulse({ className }: { className: string }) {
  return <div className={`bg-gray-200 rounded animate-pulse ${className}`} />;
}

export default function Loading() {
  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <Pulse className="h-8 w-24" />
        <Pulse className="h-9 w-28" />
      </div>

      {/* 動物グリッド */}
      <div className="mb-6">
        <Pulse className="h-4 w-28 mb-2" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1">
                <Pulse className="h-6 w-6 rounded-full" />
                <Pulse className="h-4 w-16" />
              </div>
              <Pulse className="h-7 w-14 rounded-lg" />
            </div>
          ))}
        </div>
      </div>

      {/* 記録一覧 */}
      <Pulse className="h-4 w-20 mb-3" />
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-3">
                <Pulse className="h-5 w-16" />
                <Pulse className="h-5 w-36" />
                <Pulse className="h-5 w-14 rounded-full" />
              </div>
              <Pulse className="h-5 w-10" />
            </div>
            <div className="flex gap-4 mt-1">
              <Pulse className="h-4 w-20" />
              <Pulse className="h-4 w-16" />
              <Pulse className="h-4 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
