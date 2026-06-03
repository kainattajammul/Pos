"use client";

import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LeadDateTab } from "@/components/repairs/manage-leads/manage-leads-types";

const QUICK_DATE_BUTTONS: LeadDateTab[] = ["Today", "30 days", "7 days", "12 month"];

interface LeadDateFiltersProps {
  periodLabel: string;
  activeQuickTab: LeadDateTab;
  onQuickTabChange: (tab: LeadDateTab) => void;
}

export function LeadDateFilters({
  periodLabel,
  activeQuickTab,
  onQuickTabChange,
}: LeadDateFiltersProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-[#111827]">{periodLabel}</p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-[#6B7280]">
          Cash Base
          <Info className="size-3.5 text-[#9CA3AF]" aria-hidden />
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {QUICK_DATE_BUTTONS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onQuickTabChange(tab)}
            className={cn(
              "rounded-full border border-[#E5E7EB] bg-white px-4 py-1.5 text-xs font-medium text-[#374151] hover:bg-[#F9FAFB]",
              activeQuickTab === tab && "border-[#D1D5DB] bg-[#F3F4F6] text-[#111827]",
            )}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}
