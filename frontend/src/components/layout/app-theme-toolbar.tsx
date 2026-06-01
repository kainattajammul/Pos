"use client";

import { ThemeColorPicker } from "@/components/shared/theme-color-picker";

export function AppThemeToolbar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-11 shrink-0 flex-col items-center overflow-y-auto border-l border-border bg-background py-3 xl:flex">
      <ThemeColorPicker layout="vertical" className="h-full min-h-0" />
    </aside>
  );
}
