"use client";

import { cn } from "@/lib/utils";

export const ESTIMATE_DATE_TABS = [
  "Today",
  "Yesterday",
  "Last 7 Days",
  "This Month",
  "Last Month",
  "This Year",
  "All",
] as const;

interface EstimateDateTabsProps {
  activeTab: (typeof ESTIMATE_DATE_TABS)[number];
  onTabChange: (tab: (typeof ESTIMATE_DATE_TABS)[number]) => void;
}

export function EstimateDateTabs({ activeTab, onTabChange }: EstimateDateTabsProps) {
  return (
    <div className="flex min-w-max items-center gap-1.5">
      {ESTIMATE_DATE_TABS.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onTabChange(tab)}
          className={cn(
            "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
            activeTab === tab
              ? "border-(--repair-primary) bg-(--repair-primary) text-(--repair-on-primary)"
              : "border-[#E5E7EB] bg-pos-page text-[#6B7280] hover:bg-[#F3F4F6]",
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
