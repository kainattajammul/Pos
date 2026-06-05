"use client";

import { Calendar, ChevronDown, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  STORE_DASHBOARD_DATE_TABS,
  type StoreDashboardDateTab,
  type StoreDashboardFilters,
} from "@/components/reports/store-dashboard/store-dashboard-types";

interface StoreDashboardFiltersProps {
  value: StoreDashboardFilters;
  activeDateTab: StoreDashboardDateTab;
  onChange: (next: StoreDashboardFilters) => void;
  onDateTabChange: (tab: StoreDashboardDateTab) => void;
  onRunReport: () => void;
  onRefresh: () => void;
}

function FilterLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-xs font-medium text-[#374151]">{children}</span>;
}

export function StoreDashboardFiltersBar({
  value,
  activeDateTab,
  onChange,
  onDateTabChange,
  onRunReport,
  onRefresh,
}: StoreDashboardFiltersProps) {
  return (
    <div className="space-y-3">
      <section className="rounded-sm border border-[#E5E7EB] bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:gap-3">
          <label className="min-w-0 flex-1 space-y-1">
            <FilterLabel>Date</FilterLabel>
            <div className="relative">
              <input
                type="date"
                value={value.date}
                onChange={(e) => onChange({ ...value, date: e.target.value })}
                className="h-9 w-full rounded-sm border border-[#E5E7EB] bg-white px-3 pr-9 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary) [&::-webkit-calendar-picker-indicator]:opacity-0"
              />
              <Calendar className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]" />
            </div>
          </label>

          <label className="min-w-0 flex-1 space-y-1">
            <FilterLabel>Store</FilterLabel>
            <div className="relative">
              <select
                value={value.store}
                onChange={(e) => onChange({ ...value, store: e.target.value })}
                className="h-9 w-full appearance-none rounded-sm border border-[#E5E7EB] bg-white px-3 pr-9 text-sm text-[#111827] focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary)"
              >
                <option value="Fone doctors">Fone doctors</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]" />
            </div>
          </label>

          <label className="min-w-0 flex-1 space-y-1">
            <FilterLabel>Select Employee</FilterLabel>
            <div className="relative">
              <select
                value={value.employee}
                onChange={(e) => onChange({ ...value, employee: e.target.value })}
                className="h-9 w-full appearance-none rounded-sm border border-[#E5E7EB] bg-white px-3 pr-9 text-sm text-[#9CA3AF] focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary)"
              >
                <option value="">Please Select</option>
                <option value="Faisal Sheikh">Faisal Sheikh</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]" />
            </div>
          </label>

          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-9 rounded-sm border-(--repair-primary) bg-white px-4 text-sm font-semibold text-(--repair-primary) hover:bg-[#F0FDFA]"
              onClick={onRunReport}
            >
              Run Report
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-9 rounded-sm border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#F9FAFB]"
              onClick={onRefresh}
              aria-label="Refresh dashboard"
            >
              <RotateCw className="size-4" />
            </Button>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-0 overflow-hidden rounded-sm border border-[#E5E7EB]">
        {STORE_DASHBOARD_DATE_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onDateTabChange(tab)}
            className={cn(
              "border-r border-[#E5E7EB] px-3 py-2 text-[11px] font-semibold tracking-wide transition-colors last:border-r-0 sm:px-4 sm:text-xs",
              activeDateTab === tab
                ? "bg-(--repair-primary) text-white"
                : "bg-white text-[#374151] hover:bg-[#F9FAFB]",
            )}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}
