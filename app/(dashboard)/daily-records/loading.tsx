function Pulse({ className }: { className: string }) {
  return <div className={`bg-gray-200 rounded animate-pulse ${className}`} />;
}

export default function Loading() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Pulse className="h-8 w-24" />
        <div className="flex gap-2">
          <Pulse className="h-9 w-28" />
          <Pulse className="h-9 w-28" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <Pulse className="h-9 w-40" />
      </div>

      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
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
