function Pulse({ className }: { className: string }) {
  return <div className={`bg-gray-200 rounded animate-pulse ${className}`} />;
}

export default function Loading() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Pulse className="h-8 w-36" />
        <Pulse className="h-5 w-28" />
      </div>

      <div className="flex flex-wrap gap-4 mb-3">
        <Pulse className="h-6 w-32" />
        <Pulse className="h-6 w-28" />
        <Pulse className="h-6 w-24" />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <div className="min-w-max">
          {/* ヘッダー2行 */}
          <div className="flex border-b bg-green-50">
            <div className="min-w-[100px] px-4 py-2 border-r">
              <Pulse className="h-4 w-12" />
            </div>
            <div className="min-w-[180px] px-4 py-2 border-r">
              <Pulse className="h-4 w-24" />
            </div>
            {[...Array(7)].map((_, d) => (
              <div key={d} className="flex">
                <div className="w-16 px-2 py-2 border-r text-center">
                  <Pulse className="h-3 w-8 mx-auto mb-1" />
                  <Pulse className="h-3 w-6 mx-auto" />
                </div>
                <div className="w-16 px-2 py-2 border-r text-center">
                  <Pulse className="h-3 w-8 mx-auto mb-1" />
                  <Pulse className="h-3 w-6 mx-auto" />
                </div>
              </div>
            ))}
          </div>
          {/* データ行 */}
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`flex border-b ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
              <div className="min-w-[100px] px-4 py-3 border-r">
                <Pulse className="h-4 w-16" />
              </div>
              <div className="min-w-[180px] px-4 py-3 border-r">
                <Pulse className="h-4 w-24 mb-1" />
                <Pulse className="h-3 w-20" />
              </div>
              {[...Array(14)].map((_, j) => (
                <div key={j} className="w-16 border-r px-1 py-2 flex items-center justify-center">
                  <Pulse className="h-11 w-11 rounded-full" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
