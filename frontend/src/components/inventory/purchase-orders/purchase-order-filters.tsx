"use client";

import { CalendarDays, ChevronDown } from "lucide-react";
import { PurchaseOrderFilterActions } from "@/components/inventory/purchase-orders/purchase-order-page-toolbar";
import {
  formatPurchaseOrderDateRange,
  type PurchaseOrderFiltersState,
} from "@/components/inventory/purchase-orders/purchase-order-types";
import { Button } from "@/components/ui/button";

interface PurchaseOrderFiltersProps {
  value: PurchaseOrderFiltersState;
  pinned: boolean;
  onChange: (next: PurchaseOrderFiltersState) => void;
  onPinnedChange: (pinned: boolean) => void;
  onReset: () => void;
  onSave: () => void;
  onSearch: () => void;
}

const inputClass =
  "h-10 w-full rounded-sm border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary)";

const selectClass =
  "h-10 w-full appearance-none rounded-sm border border-[#E5E7EB] bg-white px-3 pr-9 text-sm text-[#111827] focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary)";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-sm font-medium text-[#374151]">{children}</span>;
}

function SelectField({
  label,
  placeholder,
  value,
  options,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="block space-y-1.5">
      <FieldLabel>{label}</FieldLabel>
      <div className="relative">
        <select value={value} onChange={(e) => onChange(e.target.value)} className={selectClass}>
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]" />
      </div>
    </label>
  );
}

export function PurchaseOrderFilters({
  value,
  pinned,
  onChange,
  onPinnedChange,
  onReset,
  onSave,
  onSearch,
}: PurchaseOrderFiltersProps) {
  if (!pinned) {
    return (
      <div className="flex items-center justify-between rounded-sm border border-[#E5E7EB] bg-white px-4 py-3 shadow-sm">
        <span className="text-sm text-[#6B7280]">Filters are unpinned</span>
        <Button
          type="button"
          variant="outline"
          className="h-9 text-sm text-[#227E7F]"
          onClick={() => onPinnedChange(true)}
        >
          Pin Filter
        </Button>
      </div>
    );
  }

  const dateDisplay = formatPurchaseOrderDateRange(value.dateFrom, value.dateTo);

  return (
    <section className="rounded-sm border border-[#E5E7EB] bg-white p-4 shadow-sm md:p-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block space-y-1.5">
          <FieldLabel>Purchase Order ID</FieldLabel>
          <input
            value={value.purchaseOrderId}
            onChange={(e) => onChange({ ...value, purchaseOrderId: e.target.value })}
            placeholder="Enter purchase order id"
            className={inputClass}
          />
        </label>
        <SelectField
          label="Purchase Order Status"
          placeholder="Select purchase order status"
          value={value.purchaseOrderStatus}
          options={["Draft", "Pending", "Ordered", "Received", "Cancelled"]}
          onChange={(v) => onChange({ ...value, purchaseOrderStatus: v })}
        />
        <SelectField
          label="Supplier"
          placeholder="Select supplier"
          value={value.supplier}
          options={["Apple Parts Ltd", "Samsung Supply", "Generic Wholesale"]}
          onChange={(v) => onChange({ ...value, supplier: v })}
        />
        <SelectField
          label="Payment Status"
          placeholder="Select payment status"
          value={value.paymentStatus}
          options={["Unpaid", "Partial", "Paid", "Overdue"]}
          onChange={(v) => onChange({ ...value, paymentStatus: v })}
        />

        <label className="block space-y-1.5 lg:col-span-1">
          <FieldLabel>Date</FieldLabel>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="date"
                value={value.dateFrom}
                onChange={(e) => onChange({ ...value, dateFrom: e.target.value })}
                className={`${inputClass} pl-10`}
                aria-label="Date from"
              />
            </div>
            <span className="text-xs font-medium text-[#6B7280]">To</span>
            <input
              type="date"
              value={value.dateTo}
              onChange={(e) => onChange({ ...value, dateTo: e.target.value })}
              className={inputClass}
              aria-label="Date to"
            />
          </div>
          <p className="text-xs text-[#9CA3AF]">{dateDisplay}</p>
        </label>
        <SelectField
          label="Manufacturer"
          placeholder="Select manufacturer"
          value={value.manufacturer}
          options={["Apple", "Samsung", "Google", "Other"]}
          onChange={(v) => onChange({ ...value, manufacturer: v })}
        />
        <SelectField
          label="Type"
          placeholder="Select type"
          value={value.type}
          options={["Parts", "Devices", "Accessories", "Misc"]}
          onChange={(v) => onChange({ ...value, type: v })}
        />
        <label className="block space-y-1.5">
          <FieldLabel>Product</FieldLabel>
          <input
            value={value.product}
            onChange={(e) => onChange({ ...value, product: e.target.value })}
            placeholder="Enter product"
            className={inputClass}
          />
        </label>
      </div>

      <PurchaseOrderFilterActions
        onUnpin={() => onPinnedChange(false)}
        onReset={onReset}
        onSave={onSave}
        onSearch={onSearch}
      />
    </section>
  );
}
