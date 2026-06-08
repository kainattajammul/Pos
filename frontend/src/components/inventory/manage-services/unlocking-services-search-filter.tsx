"use client";

import { Button } from "@/components/ui/button";
import type { UnlockingServiceFilters } from "@/components/inventory/manage-services/unlocking-services-types";

interface UnlockingServicesSearchFilterProps {
  value: UnlockingServiceFilters;
  onChange: (next: UnlockingServiceFilters) => void;
  onSearch: () => void;
  onReset: () => void;
}

const inputClass =
  "h-9 w-full rounded-sm border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary)";

function setField<K extends keyof UnlockingServiceFilters>(
  current: UnlockingServiceFilters,
  key: K,
  value: UnlockingServiceFilters[K],
): UnlockingServiceFilters {
  return { ...current, [key]: value };
}

export function UnlockingServicesSearchFilter({
  value,
  onChange,
  onSearch,
  onReset,
}: UnlockingServicesSearchFilterProps) {
  return (
    <section className="pos-card rounded-sm p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="text-xs font-medium text-[#374151]">Item ID</span>
          <input
            value={value.itemId}
            onChange={(e) => onChange(setField(value, "itemId", e.target.value))}
            placeholder="4650"
            className={inputClass}
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-medium text-[#374151]">Name</span>
          <input
            value={value.name}
            onChange={(e) => onChange(setField(value, "name", e.target.value))}
            placeholder="Service name"
            className={inputClass}
          />
        </label>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          type="button"
          className="h-9 rounded-sm border-0 bg-(--repair-primary) px-4 text-sm font-semibold text-(--repair-on-primary) hover:opacity-90"
          onClick={onSearch}
        >
          Search
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-9 rounded-sm border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#374151] hover:bg-pos-page"
          onClick={onReset}
        >
          Reset
        </Button>
      </div>
    </section>
  );
}
