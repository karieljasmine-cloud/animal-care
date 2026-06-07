function Pulse({ className }: { className: string }) {
  return <div className={`bg-gray-200 rounded animate-pulse ${className}`} />;
}

export default function Loading() {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <Pulse className="h-8 w-28" />
        <div className="flex gap-2">
          <Pulse className="h-9 w-36" />
          <Pulse className="h-9 w-24" />
        </div>
      </div>

      <Pulse className="h-5 w-20 mb-3" />

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="bg-green-50 flex gap-6 px-4 py-3 border-b">
          {[28, 32, 20, 28, 28, 24, 16].map((w, i) => (
            <Pulse key={i} className={`h-4 w-${w}`} />
          ))}
        </div>
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`flex gap-6 px-4 py-3 border-b ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
            <Pulse className="h-4 w-16" />
            <Pulse className="h-4 w-20" />
            <Pulse className="h-4 w-12" />
            <Pulse className="h-4 w-24" />
            <Pulse className="h-4 w-24" />
            <Pulse className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
