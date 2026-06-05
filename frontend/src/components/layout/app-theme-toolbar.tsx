"use client";

import { ThemeColorPicker } from "@/components/shared/theme-color-picker";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export function AppThemeToolbar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-11 shrink-0 flex-col items-center gap-2 overflow-y-auto border-l border-pos bg-pos-surface/80 py-3 backdrop-blur-sm xl:flex">
      <ThemeToggle />
      <ThemeColorPicker layout="vertical" className="h-full min-h-0" />
    </aside>
  );
}
