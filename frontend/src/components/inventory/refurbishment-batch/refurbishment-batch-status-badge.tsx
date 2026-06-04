"use client";

import { cn } from "@/lib/utils";
import type { RefurbishmentBatchStatus } from "@/components/inventory/refurbishment-batch/refurbishment-batch-types";

const statusStyles: Record<RefurbishmentBatchStatus, string> = {
  DRAFT: "border-[#E5E7EB] bg-[#F3F4F6] text-[#4B5563]",
  IN_PROGRESS: "border-[#93C5FD] bg-[#DBEAFE] text-[#1D4ED8]",
  COMPLETED: "border-[#86EFAC] bg-[#DCFCE7] text-[#166534]",
  CANCELLED: "border-[#FECACA] bg-[#FEE2E2] text-[#B91C1C]",
};

const statusLabels: Record<RefurbishmentBatchStatus, string> = {
  DRAFT: "Draft",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export function RefurbishmentBatchStatusBadge({
  status,
}: {
  status: RefurbishmentBatchStatus;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-sm border px-2 py-0.5 text-[11px] font-semibold",
        statusStyles[status],
      )}
    >
      {statusLabels[status]}
    </span>
  );
}
