"use client";

import { cn } from "@/lib/utils";

const DATE_FILTERS = ["ALL", "TODAY", "YESTERDAY", "7 DAYS", "14 DAYS", "30 DAYS"] as const;

interface DateFilterTabsProps {
  active?: (typeof DATE_FILTERS)[number];
}

export function DateFilterTabs({ active = "7 DAYS" }: DateFilterTabsProps) {
  return (
    <div className="mb-3 flex min-w-max items-center gap-1 border-b border-[#E5E7EB] pb-2">
      {DATE_FILTERS.map((item) => (
        <button
          key={item}
          type="button"
          className={cn(
            "rounded px-2.5 py-1 text-xs font-semibold tracking-wide text-[#374151] transition-colors",
            item === active ? "bg-[#E5E7EB] text-[#111827]" : "hover:bg-[#F3F4F6]",
          )}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
