"use client";

import type { PosTab } from "@/lib/repairs-pos-data";

interface RepairsPosTabPlaceholderProps {
  tab: PosTab;
}

export function RepairsPosTabPlaceholder({ tab }: RepairsPosTabPlaceholderProps) {
  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-white">
      <div className="flex min-h-[240px] flex-1 flex-col items-center justify-center p-8 text-center">
        <p className="text-sm font-medium text-[#374151]">{tab}</p>
        <p className="mt-1 max-w-sm text-xs text-[#6B7280]">
          This section will be available soon.
        </p>
      </div>
    </section>
  );
}
