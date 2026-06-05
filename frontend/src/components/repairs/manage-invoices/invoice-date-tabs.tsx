"use client";

import { cn } from "@/lib/utils";
import type { InvoiceDateTab } from "@/components/repairs/manage-invoices/manage-invoices-types";

export const INVOICE_DATE_TABS: InvoiceDateTab[] = [
  "Today",
  "30 days",
  "7 days",
  "12 month",
];

interface InvoiceDateTabsProps {
  activeTab: InvoiceDateTab;
  onTabChange: (tab: InvoiceDateTab) => void;
}

export function InvoiceDateTabs({ activeTab, onTabChange }: InvoiceDateTabsProps) {
  return (
    <div className="inline-flex overflow-hidden rounded-sm border border-[#E5E7EB]">
      {INVOICE_DATE_TABS.map((tab, index) => (
        <button
          key={`${tab}-${index}`}
          type="button"
          onClick={() => onTabChange(tab)}
          className={cn(
            "border-r border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-medium text-[#374151] last:border-r-0 hover:bg-pos-page",
            activeTab === tab && "bg-[#F3F4F6] text-[#111827]",
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
