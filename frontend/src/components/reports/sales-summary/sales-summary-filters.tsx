"use client";

import { useRef } from "react";
import { Calendar, ChevronDown, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_CONFIG } from "@/constants/config";
import type { SalesSummaryFilters } from "@/components/reports/sales-summary/sales-summary-types";

interface SalesSummaryFiltersBarProps {
  value: SalesSummaryFilters;
  onChange: (next: SalesSummaryFilters) => void;
  onRunReport: () => void;
  onRefresh: () => void;
}

function FilterLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-xs font-medium text-[#374151]">{children}</span>;
}

const dateInputClass =
  "h-9 w-full cursor-pointer rounded-sm border border-[#E5E7EB] bg-white px-3 pr-9 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary) [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-y-0 [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-9 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0";

export function SalesSummaryFiltersBar({
  value,
  onChange,
  onRunReport,
  onRefresh,
}: SalesSummaryFiltersBarProps) {
  const dateInputRef = useRef<HTMLInputElement>(null);

  const openDatePicker = () => {
    const input = dateInputRef.current;
    if (!input) return;
    input.focus();
    if (typeof input.showPicker === "function") {
      try {
        input.showPicker();
      } catch {
        input.click();
      }
    }
  };

  return (
    <section className="rounded-sm border border-[#E5E7EB] bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:gap-3">
        <label className="min-w-0 flex-1 space-y-1">
          <FilterLabel>Date</FilterLabel>
          <div className="relative">
            <input
              ref={dateInputRef}
              type="date"
              value={value.date}
              onChange={(e) => onChange({ ...value, date: e.target.value })}
              onClick={openDatePicker}
              placeholder="Select date"
              className={dateInputClass}
              aria-label="Select date"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={openDatePicker}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]"
              aria-label="Open calendar"
            >
              <Calendar className="size-4" />
            </button>
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

        <label className="min-w-0 flex-1 space-y-1">
          <FilterLabel>Store</FilterLabel>
          <div className="relative">
            <select
              value={value.store}
              onChange={(e) => onChange({ ...value, store: e.target.value })}
              className="h-9 w-full appearance-none rounded-sm border border-[#E5E7EB] bg-white px-3 pr-9 text-sm text-[#111827] focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary)"
            >
              <option value="">Select Store</option>
              <option value={APP_CONFIG.appName}>{APP_CONFIG.appName}</option>
              <option value="Fone doctors">Fone doctors</option>
              <option value="Fone doctors - Branch 2">Fone doctors - Branch 2</option>
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
            className="size-9 rounded-sm border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-pos-page"
            onClick={onRefresh}
            aria-label="Refresh report"
          >
            <RotateCw className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
