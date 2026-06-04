"use client";

import { cn } from "@/lib/utils";
import {
  PURCHASE_ORDER_DATE_TABS,
  type PurchaseOrderDateTab,
} from "@/components/inventory/purchase-orders/purchase-order-types";

interface PurchaseOrderDateTabsProps {
  activeTab: PurchaseOrderDateTab;
  onTabChange: (tab: PurchaseOrderDateTab) => void;
}

export function PurchaseOrderDateTabs({
  activeTab,
  onTabChange,
}: PurchaseOrderDateTabsProps) {
  return (
    <div className="flex min-w-max flex-wrap items-center gap-2">
      {PURCHASE_ORDER_DATE_TABS.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onTabChange(tab)}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
            activeTab === tab
              ? "bg-(--repair-primary) text-(--repair-on-primary)"
              : "bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]",
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
