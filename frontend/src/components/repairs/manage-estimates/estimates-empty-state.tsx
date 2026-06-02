"use client";

import { FileSearch } from "lucide-react";

export function EstimatesEmptyState() {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 bg-white">
      <div className="relative inline-flex size-24 items-center justify-center rounded-full bg-[#F3F4F6]">
        <FileSearch className="size-11 text-[#C4C9D4]" />
      </div>
      <p className="text-xl font-semibold text-[#374151]">No Records Found</p>
    </div>
  );
}
