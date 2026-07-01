"use client";

import { useState } from "react";
import { logCatToilet } from "@/app/actions/cat-toilet";

export default function CatToiletButtons({ animalId }: { animalId: string }) {
  const [pending, setPending] = useState<"sand" | "sheet" | null>(null);
  const [done, setDone] = useState<"sand" | "sheet" | null>(null);

  async function handleLog(logType: "sand" | "sheet") {
    if (pending) return;
    setPending(logType);
    setDone(null);
    try {
      await logCatToilet(animalId, logType);
      setDone(logType);
      setTimeout(() => setDone(null), 2000);
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="flex gap-2 mt-3">
      <button
        onClick={() => handleLog("sand")}
        disabled={!!pending}
        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 ${
          done === "sand"
            ? "bg-green-100 text-green-700 border border-green-400"
            : "bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 active:scale-95"
        }`}
      >
        {done === "sand" ? "✅ 記録しました" : pending === "sand" ? "記録中…" : "🪣 砂を全替した"}
      </button>
      <button
        onClick={() => handleLog("sheet")}
        disabled={!!pending}
        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 ${
          done === "sheet"
            ? "bg-green-100 text-green-700 border border-green-400"
            : "bg-sky-50 text-sky-800 border border-sky-300 hover:bg-sky-100 active:scale-95"
        }`}
      >
        {done === "sheet" ? "✅ 記録しました" : pending === "sheet" ? "記録中…" : "📋 シーツを替えた"}
      </button>
    </div>
  );
}
