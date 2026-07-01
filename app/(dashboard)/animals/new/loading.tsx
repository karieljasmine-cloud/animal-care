function Pulse({ className }: { className: string }) {
  return <div className={`bg-gray-200 rounded animate-pulse ${className}`} />;
}

function FieldSkeleton() {
  return (
    <div>
      <Pulse className="h-4 w-20 mb-1" />
      <Pulse className="h-9 w-full rounded-lg" />
    </div>
  );
}

function SectionSkeleton({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-3 border-b pb-2 mb-4">
        <Pulse className="h-4 w-24" />
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

export default function Loading() {
  return (
    <div>
      <Pulse className="h-8 w-28 mb-6" />
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        {/* 基本情報 */}
        <SectionSkeleton title="">
          <FieldSkeleton />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldSkeleton />
            <FieldSkeleton />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldSkeleton />
            <FieldSkeleton />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldSkeleton />
            <FieldSkeleton />
          </div>
          <FieldSkeleton />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldSkeleton />
            <FieldSkeleton />
          </div>
        </SectionSkeleton>

        {/* 譲渡情報 */}
        <SectionSkeleton title="">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldSkeleton />
            <FieldSkeleton />
          </div>
        </SectionSkeleton>

        {/* 死亡情報 */}
        <SectionSkeleton title="">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldSkeleton />
            <FieldSkeleton />
          </div>
        </SectionSkeleton>

        {/* 備考 */}
        <SectionSkeleton title="">
          <div>
            <Pulse className="h-4 w-12 mb-1" />
            <Pulse className="h-20 w-full rounded-lg" />
          </div>
        </SectionSkeleton>

        {/* ボタン */}
        <div className="flex gap-3">
          <Pulse className="h-10 w-24 rounded-lg" />
          <Pulse className="h-10 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
