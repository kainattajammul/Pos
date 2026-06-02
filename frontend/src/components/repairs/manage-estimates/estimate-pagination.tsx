"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface EstimatePaginationProps {
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  total: number;
}

export function EstimatePagination({
  pageSize,
  onPageSizeChange,
  total,
}: EstimatePaginationProps) {
  return (
    <div className="flex items-center justify-between border-t border-[#E5E7EB] px-3 py-2">
      <div className="flex items-center gap-3 text-sm text-[#6B7280]">
        <select
          value={String(pageSize)}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="h-8 rounded-md border border-[#E5E7EB] bg-white px-2 text-sm text-[#374151]"
        >
          <option value="25">25</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
        <span>Showing 1 to {pageSize} of total {total}</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="inline-flex size-7 items-center justify-center rounded border border-[#E5E7EB] bg-white text-[#9CA3AF]"
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          className="inline-flex size-7 items-center justify-center rounded border border-(--repair-primary) bg-(--repair-primary) text-xs font-semibold text-(--repair-on-primary)"
          aria-label="Current page"
        >
          1
        </button>
        <button
          type="button"
          className="inline-flex size-7 items-center justify-center rounded border border-[#E5E7EB] bg-white text-[#9CA3AF]"
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
