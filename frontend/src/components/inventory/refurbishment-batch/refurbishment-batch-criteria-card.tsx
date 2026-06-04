"use client";

import { ChevronDown, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  REFURBISHMENT_CRITERIA_OPTIONS,
  type RefurbishmentBatchFiltersState,
} from "@/components/inventory/refurbishment-batch/refurbishment-batch-types";

interface RefurbishmentBatchCriteriaCardProps {
  value: RefurbishmentBatchFiltersState;
  onChange: (next: RefurbishmentBatchFiltersState) => void;
  onRunReport: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

const outlineTealBtn =
  "h-10 min-w-[140px] rounded-sm border border-(--repair-primary) bg-white px-5 text-sm font-semibold text-(--repair-primary) shadow-none hover:bg-[#F4FBFB]";

export function RefurbishmentBatchCriteriaCard({
  value,
  onChange,
  onRunReport,
  onRefresh,
  isRefreshing = false,
}: RefurbishmentBatchCriteriaCardProps) {
  const showValueInput = value.criteria !== "";

  return (
    <section className="rounded-sm border border-[#E5E7EB] bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1 space-y-3 sm:max-w-md">
          <label className="block space-y-1">
            <span className="text-sm font-semibold text-[#111827]">Criteria</span>
            <div className="relative">
              <select
                value={value.criteria}
                onChange={(e) =>
                  onChange({
                    criteria: e.target.value as RefurbishmentBatchFiltersState["criteria"],
                    criteriaValue: "",
                  })
                }
                className="h-10 w-full appearance-none rounded-sm border border-[#E5E7EB] bg-white px-3 pr-10 text-sm text-[#111827] focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary)"
              >
                {REFURBISHMENT_CRITERIA_OPTIONS.map((opt) => (
                  <option key={opt.value || "empty"} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#22C55E]" />
            </div>
          </label>
          {showValueInput ? (
            <input
              value={value.criteriaValue}
              onChange={(e) => onChange({ ...value, criteriaValue: e.target.value })}
              placeholder={`Enter ${value.criteria.toLowerCase()}`}
              className="h-10 w-full rounded-sm border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary)"
            />
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2 self-end lg:self-center">
          <Button type="button" variant="outline" className={outlineTealBtn} onClick={onRunReport}>
            Run Report
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-10 rounded-sm border border-(--repair-primary) bg-white text-(--repair-primary) hover:bg-[#F4FBFB]"
            onClick={onRefresh}
            aria-label="Refresh report"
            disabled={isRefreshing}
          >
            <RotateCw className={cn("size-5", isRefreshing && "animate-spin")} />
          </Button>
        </div>
      </div>
    </section>
  );
}
