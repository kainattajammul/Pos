"use client";

import { cn } from "@/lib/utils";
import type { InventoryCountStatus } from "@/components/inventory/inventory-count/inventory-count-types";

const statusStyles: Record<InventoryCountStatus, string> = {
  PAUSED: "border-[#FDBA74] bg-[#FFEDD5] text-[#C2410C]",
  IN_PROGRESS: "border-[#93C5FD] bg-[#DBEAFE] text-[#1D4ED8]",
  COMPLETED: "border-[#86EFAC] bg-[#DCFCE7] text-[#166534]",
  DRAFT: "border-[#E5E7EB] bg-[#F3F4F6] text-[#4B5563]",
};

export function InventoryCountStatusBadge({
  status,
}: {
  status: InventoryCountStatus;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-sm border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        statusStyles[status],
      )}
    >
      {status.replace("_", " ")}
    </span>
  );
}
