"use client";

import { cn } from "@/lib/utils";
import {
  TRADEIN_DATE_TABS,
  type TradeinDateTab,
} from "@/components/inventory/trade-in-report/tradein-report-types";

interface TradeinDateTabsProps {
  activeTab: TradeinDateTab;
  onTabChange: (tab: TradeinDateTab) => void;
}

export function TradeinDateTabs({ activeTab, onTabChange }: TradeinDateTabsProps) {
  return (
    <div className="inline-flex overflow-hidden rounded-sm border border-[#E5E7EB]">
      {TRADEIN_DATE_TABS.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onTabChange(tab)}
          className={cn(
            "border-r border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-medium text-[#374151] last:border-r-0 hover:bg-[#F9FAFB]",
            activeTab === tab && "bg-[#F3F4F6] text-[#111827]",
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
