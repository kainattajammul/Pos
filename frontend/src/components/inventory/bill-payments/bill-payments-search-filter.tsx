"use client";

import { Button } from "@/components/ui/button";
import type { BillPaymentFiltersState } from "@/components/inventory/bill-payments/bill-payments-types";

interface BillPaymentsSearchFilterProps {
  value: BillPaymentFiltersState;
  onChange: (next: BillPaymentFiltersState) => void;
  onSearch: () => void;
  onReset: () => void;
}

const inputClass =
  "h-9 w-full rounded-sm border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary)";

function setField<K extends keyof BillPaymentFiltersState>(
  current: BillPaymentFiltersState,
  key: K,
  value: BillPaymentFiltersState[K],
): BillPaymentFiltersState {
  return { ...current, [key]: value };
}

export function BillPaymentsSearchFilter({
  value,
  onChange,
  onSearch,
  onReset,
}: BillPaymentsSearchFilterProps) {
  return (
    <section className="rounded-sm border border-[#E5E7EB] bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="space-y-1">
          <span className="text-xs font-medium text-[#374151]">Item ID</span>
          <input
            value={value.itemId}
            onChange={(e) => onChange(setField(value, "itemId", e.target.value))}
            placeholder="BP-001"
            className={inputClass}
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-medium text-[#374151]">Plan Name</span>
          <input
            value={value.planName}
            onChange={(e) => onChange(setField(value, "planName", e.target.value))}
            placeholder="Plan name"
            className={inputClass}
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-medium text-[#374151]">Provider Name</span>
          <input
            value={value.providerName}
            onChange={(e) => onChange(setField(value, "providerName", e.target.value))}
            placeholder="Provider"
            className={inputClass}
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-medium text-[#374151]">Network Name</span>
          <input
            value={value.networkName}
            onChange={(e) => onChange(setField(value, "networkName", e.target.value))}
            placeholder="Network"
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
          className="h-9 rounded-sm border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#374151] hover:bg-[#F9FAFB]"
          onClick={onReset}
        >
          Reset
        </Button>
      </div>
    </section>
  );
}
