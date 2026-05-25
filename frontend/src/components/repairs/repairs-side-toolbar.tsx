"use client";

import { ThemeColorPicker } from "@/components/shared/theme-color-picker";

export function RepairsSideToolbar() {
  return (
    <aside className="hidden w-11 shrink-0 flex-col items-center overflow-y-auto border-l border-[#E5E7EB] bg-white py-3 xl:flex">
      <ThemeColorPicker layout="vertical" className="h-full min-h-0" />
    </aside>
  );
}
