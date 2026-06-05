"use client";

import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { InventoryCountFiltersState } from "@/components/inventory/inventory-count/inventory-count-types";

interface InventoryCountSearchFilterProps {
  value: InventoryCountFiltersState;
  onChange: (next: InventoryCountFiltersState) => void;
  onSearch: () => void;
  onReset: () => void;
}

function setField<K extends keyof InventoryCountFiltersState>(
  current: InventoryCountFiltersState,
  key: K,
  value: InventoryCountFiltersState[K],
): InventoryCountFiltersState {
  return { ...current, [key]: value };
}

const inputClass =
  "h-9 w-full rounded-sm border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary)";

const selectClass =
  "h-9 w-full appearance-none rounded-sm border border-[#E5E7EB] bg-white px-3 pr-9 text-sm text-[#111827] focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary)";

export function InventoryCountSearchFilter({
  value,
  onChange,
  onSearch,
  onReset,
}: InventoryCountSearchFilterProps) {
  return (
    <section className="rounded-sm border border-[#E5E7EB] bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="space-y-1">
          <span className="text-xs font-medium text-[#374151]">Count ID</span>
          <input
            value={value.countId}
            onChange={(e) => onChange(setField(value, "countId", e.target.value))}
            placeholder="IC-001"
            className={inputClass}
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-medium text-[#374151]">Store</span>
          <input
            value={value.store}
            onChange={(e) => onChange(setField(value, "store", e.target.value))}
            placeholder="Fone doctors"
            className={inputClass}
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-medium text-[#374151]">Employee</span>
          <input
            value={value.employee}
            onChange={(e) => onChange(setField(value, "employee", e.target.value))}
            placeholder="Employee name"
            className={inputClass}
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-medium text-[#374151]">Status</span>
          <div className="relative">
            <select
              value={value.status}
              onChange={(e) => onChange(setField(value, "status", e.target.value))}
              className={selectClass}
            >
              <option value="">All</option>
              <option value="PAUSED">PAUSED</option>
              <option value="IN_PROGRESS">IN PROGRESS</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="DRAFT">DRAFT</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]" />
          </div>
        </label>
        <label className="space-y-1">
          <span className="text-xs font-medium text-[#374151]">Date From</span>
          <input
            type="date"
            value={value.dateFrom}
            onChange={(e) => onChange(setField(value, "dateFrom", e.target.value))}
            className={inputClass}
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-medium text-[#374151]">Date To</span>
          <input
            type="date"
            value={value.dateTo}
            onChange={(e) => onChange(setField(value, "dateTo", e.target.value))}
            className={inputClass}
          />
        </label>
      </div>
      <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-[#E5E7EB] pt-3">
        <Button
          type="button"
          variant="outline"
          className="h-9 rounded-sm border-[#E5E7EB] bg-white text-sm font-medium text-[#374151] hover:bg-pos-page"
          onClick={onReset}
        >
          Reset
        </Button>
        <Button
          type="button"
          className="h-9 rounded-sm border-0 bg-(--repair-primary) px-4 text-sm font-semibold text-(--repair-on-primary) hover:opacity-90"
          onClick={onSearch}
        >
          Search
        </Button>
      </div>
    </section>
  );
}
