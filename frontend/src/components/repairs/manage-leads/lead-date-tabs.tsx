"use client";

import { cn } from "@/lib/utils";
import type { LeadDateTab } from "@/components/repairs/manage-leads/manage-leads-types";

export const LEAD_DATE_TABS: LeadDateTab[] = [
  "Today",
  "30 days",
  "7 days",
  "12 month",
];

interface LeadDateTabsProps {
  activeTab: LeadDateTab;
  onTabChange: (tab: LeadDateTab) => void;
}

export function LeadDateTabs({ activeTab, onTabChange }: LeadDateTabsProps) {
  return (
    <div className="inline-flex overflow-hidden rounded-sm border border-[#E5E7EB]">
      {LEAD_DATE_TABS.map((tab, index) => (
        <button
          key={`${tab}-${index}`}
          type="button"
          onClick={() => onTabChange(tab)}
          className={cn(
            "border-r border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-medium text-[#374151] last:border-r-0 hover:bg-[#F9FAFB]",
            activeTab === tab && "border-b-2 border-b-[#3B82F6] bg-white text-[#111827]",
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
