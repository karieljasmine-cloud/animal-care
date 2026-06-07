function Pulse({ className }: { className: string }) {
  return <div className={`bg-gray-200 rounded animate-pulse ${className}`} />;
}

export default function Loading() {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Pulse className="h-8 w-36" />
        <Pulse className="h-5 w-24" />
      </div>

      <div className="bg-gray-50 rounded-lg p-3 mb-3">
        <Pulse className="h-4 w-72" />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <div className="min-w-max">
          {/* ヘッダー行 */}
          <div className="flex border-b bg-green-50 items-center">
            <div className="w-[72px] px-3 py-2 border-r shrink-0">
              <Pulse className="h-4 w-8" />
            </div>
            {[...Array(7)].map((_, d) => (
              <div key={d} className="flex">
                <div className="w-[56px] px-1 py-2 border-r text-center">
                  <Pulse className="h-3 w-8 mx-auto mb-1" />
                  <Pulse className="h-3 w-6 mx-auto" />
                </div>
                <div className="w-[56px] px-1 py-2 border-r text-center">
                  <Pulse className="h-3 w-8 mx-auto mb-1" />
                  <Pulse className="h-3 w-6 mx-auto" />
                </div>
              </div>
            ))}
          </div>
          {/* データ行 */}
          {[...Array(8)].map((_, i) => (
            <div key={i} className={`flex border-b ${i % 2 === 0 ? "bg-white" : "bg-gray-50/40"}`}>
              <div className="w-[72px] px-2 py-1 border-r shrink-0 flex items-center">
                <Pulse className="h-4 w-12" />
              </div>
              {[...Array(14)].map((_, j) => (
                <div key={j} className="w-[56px] border-r px-1 py-1">
                  <Pulse className="h-[42px] w-full mb-0.5" />
                  <Pulse className="h-[42px] w-full" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
