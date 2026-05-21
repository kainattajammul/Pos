"use client";

import { ChevronDown, Search } from "lucide-react";
import type { PosTab } from "@/lib/repairs-pos-data";
import { POS_TABS } from "@/lib/repairs-pos-data";
import { cn } from "@/lib/utils";

interface RepairsPosBarProps {
  activeTab: PosTab;
  onTabChange: (tab: PosTab) => void;
}

export function RepairsPosBar({ activeTab, onTabChange }: RepairsPosBarProps) {
  return (
    <div
      className="flex shrink-0 flex-col gap-2 px-3 py-2 shadow-sm sm:flex-row sm:items-center sm:justify-between md:px-4"
      style={{ backgroundColor: "var(--repair-primary-dark)" }}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        <button
          type="button"
          className="shrink-0 text-left text-xs font-medium text-white/90 underline-offset-2 hover:text-white hover:underline md:text-sm"
        >
          Re-open in POS
        </button>
        <div className="relative min-w-0 flex-1 sm:max-w-md">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/60" />
          <input
            type="text"
            placeholder="Scan or enter Ticket ID"
            className="h-9 w-full rounded border border-[var(--repair-primary-darker)] bg-[var(--repair-primary-darker)] pr-9 pl-9 text-sm text-white placeholder:text-white/50 focus:border-[var(--repair-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--repair-primary)]"
          />
          <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-white/70" />
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap gap-0.5">
        {POS_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onTabChange(tab)}
            className={cn(
              "rounded px-3 py-1.5 text-xs font-medium transition-colors md:text-sm",
              activeTab === tab
                ? "text-[var(--repair-on-primary)] shadow-sm"
                : "text-white/90 hover:text-white",
            )}
            style={
              activeTab === tab
                ? { backgroundColor: "var(--repair-accent)" }
                : undefined
            }
            onMouseEnter={(e) => {
              if (activeTab !== tab) {
                e.currentTarget.style.backgroundColor = "var(--repair-primary-darker)";
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab) {
                e.currentTarget.style.backgroundColor = "transparent";
              }
            }}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}
