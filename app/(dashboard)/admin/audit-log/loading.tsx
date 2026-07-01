function Pulse({ className }: { className: string }) {
  return <div className={`bg-gray-200 rounded animate-pulse ${className}`} />;
}

export default function Loading() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Pulse className="h-8 w-36" />
        <Pulse className="h-4 w-16" />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gray-50 flex gap-6 px-4 py-3 border-b">
          {[24, 20, 20, 32].map((w, i) => (
            <Pulse key={i} className={`h-4 w-${w}`} />
          ))}
        </div>
        {[...Array(8)].map((_, i) => (
          <div key={i} className={`flex gap-6 px-4 py-2.5 border-t ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
            <Pulse className="h-4 w-24 shrink-0" />
            <Pulse className="h-4 w-16 shrink-0" />
            <Pulse className="h-5 w-24 rounded-full shrink-0" />
            <Pulse className="h-4 flex-1" />
          </div>
        ))}
      </div>
    </div>
  );
}
