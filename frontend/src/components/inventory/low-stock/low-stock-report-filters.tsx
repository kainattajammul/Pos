"use client";

import { ChevronDown, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LowStockReportFilters } from "@/components/inventory/low-stock/low-stock-report-types";
import { LOW_STOCK_CRITERIA_OPTIONS } from "@/components/inventory/low-stock/low-stock-report-types";
import { cn } from "@/lib/utils";

interface LowStockReportFiltersProps {
  value: LowStockReportFilters;
  defaultStoreName: string;
  onChange: (next: LowStockReportFilters) => void;
  onRunReport: () => void;
  onReset: () => void;
}

const selectClass =
  "h-9 w-full appearance-none rounded-sm border border-[#D1D5DB] bg-white px-3 pr-9 text-sm text-[#111827] focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary)";

const outlineTealBtn =
  "h-9 rounded-sm border border-(--repair-primary) bg-white px-5 text-sm font-semibold text-(--repair-primary) shadow-sm hover:bg-[#F0FDFA]";

export function LowStockReportFiltersBar({
  value,
  defaultStoreName,
  onChange,
  onRunReport,
  onReset,
}: LowStockReportFiltersProps) {
  return (
    <section className="pos-card rounded-sm bg-pos-muted px-4 py-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-xs font-semibold text-[#374151]">Store</span>
            <div className="relative">
              <select
                value={value.store || defaultStoreName}
                onChange={(e) => onChange({ ...value, store: e.target.value })}
                className={selectClass}
                aria-label="Store"
              >
                <option value={defaultStoreName}>{defaultStoreName}</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]" />
            </div>
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-semibold text-[#374151]">Criteria</span>
            <div className="relative">
              <select
                value={value.criteria}
                onChange={(e) =>
                  onChange({
                    ...value,
                    criteria: e.target.value as LowStockReportFilters["criteria"],
                  })
                }
                className={selectClass}
                aria-label="Criteria"
              >
                {LOW_STOCK_CRITERIA_OPTIONS.map((opt) => (
                  <option key={opt.value || "placeholder"} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]" />
            </div>
          </label>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button type="button" className={outlineTealBtn} onClick={onRunReport}>
            Run Report
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={cn(
              "size-9 rounded-sm border-[#D1D5DB] bg-white text-[#374151] hover:bg-pos-page",
            )}
            onClick={onReset}
            aria-label="Reset filters"
          >
            <RotateCcw className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
