"use client";

import { Calendar, ChevronDown, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TradeinFiltersState } from "@/components/inventory/trade-in-report/tradein-report-types";

interface TradeinReportFiltersProps {
  value: TradeinFiltersState;
  onChange: (next: TradeinFiltersState) => void;
  onRunReport: () => void;
  onReset: () => void;
}

function setField<K extends keyof TradeinFiltersState>(
  current: TradeinFiltersState,
  key: K,
  value: TradeinFiltersState[K],
): TradeinFiltersState {
  return { ...current, [key]: value };
}

function FilterLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-xs font-medium text-[#374151]">{children}</span>;
}

export function TradeinReportFilters({
  value,
  onChange,
  onRunReport,
  onReset,
}: TradeinReportFiltersProps) {
  return (
    <section className="flex flex-col gap-3 lg:flex-row lg:items-end lg:gap-3">
      <label className="min-w-0 flex-1 space-y-1">
        <FilterLabel>Date</FilterLabel>
        <div className="relative">
          <input
            type="date"
            value={value.date}
            onChange={(e) => onChange(setField(value, "date", e.target.value))}
            placeholder="Select date"
            className="h-9 w-full rounded-sm border border-[#E5E7EB] bg-white px-3 pr-9 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary) [&::-webkit-calendar-picker-indicator]:opacity-0"
          />
          <Calendar className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]" />
        </div>
      </label>

      <label className="min-w-0 flex-1 space-y-1">
        <FilterLabel>Type</FilterLabel>
        <div className="relative">
          <select
            value={value.type}
            onChange={(e) => onChange(setField(value, "type", e.target.value))}
            className="h-9 w-full appearance-none rounded-sm border border-[#E5E7EB] bg-white px-3 pr-9 text-sm text-[#111827] focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary)"
          >
            <option value="">type</option>
            <option value="Purchase">Purchase</option>
            <option value="Sale">Sale</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]" />
        </div>
      </label>

      <label className="min-w-0 flex-1 space-y-1">
        <FilterLabel>Criteria</FilterLabel>
        <div className="relative">
          <select
            value={value.criteria}
            onChange={(e) => onChange(setField(value, "criteria", e.target.value))}
            className="h-9 w-full appearance-none rounded-sm border border-[#E5E7EB] bg-white px-3 pr-9 text-sm text-[#111827] focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary)"
          >
            <option value="">Please Select</option>
            <option value="Store Name">Store Name</option>
            <option value="Seller">Seller</option>
            <option value="Buyer">Buyer</option>
            <option value="SKU">SKU</option>
            <option value="IMEI/Serial">IMEI/Serial</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]" />
        </div>
      </label>

      <div className="flex shrink-0 items-center gap-2">
        <Button
          type="button"
          className="h-9 rounded-sm border-0 bg-(--repair-primary) px-4 text-sm font-semibold text-(--repair-on-primary) hover:opacity-90"
          onClick={onRunReport}
        >
          Run Report
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-9 rounded-sm border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#F9FAFB]"
          onClick={onReset}
          aria-label="Reset filters"
        >
          <RotateCw className="size-4" />
        </Button>
      </div>
    </section>
  );
}
