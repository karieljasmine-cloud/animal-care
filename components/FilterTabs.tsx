"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";

type Tab = { value: string; label: string; href: string };

export default function FilterTabs({
  tabs,
  currentValue,
  activeStyle = "bg-green-600 text-white",
}: {
  tabs: Tab[];
  currentValue: string;
  activeStyle?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingValue, setPendingValue] = useState<string | null>(null);

  function handleClick(value: string, href: string) {
    if (value === currentValue) return;
    setPendingValue(value);
    startTransition(() => {
      router.push(href);
    });
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {tabs.map(({ value, label, href }) => {
        const isActive = currentValue === value;
        const isPendingTab = isPending && pendingValue === value;
        return (
          <button
            key={value}
            onClick={() => handleClick(value, href)}
            disabled={isPending}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
              isActive
                ? activeStyle
                : isPendingTab
                ? "bg-green-100 text-green-700 ring-2 ring-green-400"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {isPendingTab && (
              <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin inline-block shrink-0" />
            )}
            {label}
          </button>
        );
      })}
    </div>
  );
}
