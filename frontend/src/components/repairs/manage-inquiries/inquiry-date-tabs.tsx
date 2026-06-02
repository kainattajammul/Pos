"use client";

import { cn } from "@/lib/utils";

export const INQUIRY_DATE_TABS = [
  "TODAY",
  "YESTERDAY",
  "LAST 7 DAYS",
  "THIS MONTH",
  "LAST MONTH",
  "THIS YEAR",
  "ALL",
] as const;

interface InquiryDateTabsProps {
  activeTab: (typeof INQUIRY_DATE_TABS)[number];
  onTabChange: (tab: (typeof INQUIRY_DATE_TABS)[number]) => void;
}

export function InquiryDateTabs({ activeTab, onTabChange }: InquiryDateTabsProps) {
  return (
    <div className="flex min-w-max items-center gap-2">
      {INQUIRY_DATE_TABS.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onTabChange(tab)}
          className={cn(
            "rounded-full px-2.5 py-1 text-[11px] font-semibold text-[#374151] transition-colors",
            activeTab === tab
              ? "bg-(--repair-primary) text-(--repair-on-primary)"
              : "hover:bg-[#F3F4F6]",
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
