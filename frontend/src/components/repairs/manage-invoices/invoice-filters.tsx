"use client";

import { Calendar, ChevronDown } from "lucide-react";
import type { InvoiceFiltersState } from "@/components/repairs/manage-invoices/manage-invoices-types";

interface InvoiceFiltersProps {
  value: InvoiceFiltersState;
  onChange: (next: InvoiceFiltersState) => void;
}

function setField<K extends keyof InvoiceFiltersState>(
  current: InvoiceFiltersState,
  key: K,
  value: InvoiceFiltersState[K],
): InvoiceFiltersState {
  return { ...current, [key]: value };
}

function FilterLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-xs font-medium text-[#374151]">{children}</span>;
}

function DateField({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="space-y-1">
      <FilterLabel>{label}</FilterLabel>
      <div className="relative">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-9 w-full rounded-sm border border-[#E5E7EB] bg-white px-3 pr-9 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary)"
        />
        <Calendar className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]" />
      </div>
    </label>
  );
}

function SelectField({
  label,
  placeholder,
  value,
  onChange,
  options,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="space-y-1">
      <FilterLabel>{label}</FilterLabel>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-full appearance-none rounded-sm border border-[#E5E7EB] bg-white px-3 pr-9 text-sm text-[#111827] focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary)"
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]" />
      </div>
    </label>
  );
}

export function InvoiceFilters({ value, onChange }: InvoiceFiltersProps) {
  return (
    <section className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <DateField
          label="Customer Name"
          placeholder="Select date"
          value={value.customerName}
          onChange={(v) => onChange(setField(value, "customerName", v))}
        />
        <SelectField
          label="Invoice ID"
          placeholder="Select Store"
          value={value.invoiceId}
          onChange={(v) => onChange(setField(value, "invoiceId", v))}
          options={["Store A", "Store B", "Main Store"]}
        />
        <SelectField
          label="Invoice Status"
          placeholder="type"
          value={value.invoiceStatus}
          onChange={(v) => onChange(setField(value, "invoiceStatus", v))}
          options={["Paid", "Unpaid", "Partial", "Refunded", "Draft"]}
        />
        <SelectField
          label="Employee"
          placeholder="Select Store"
          value={value.employee}
          onChange={(v) => onChange(setField(value, "employee", v))}
          options={["Faisal Sheikh", "Admin User", "Repair Staff"]}
        />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <DateField
          label="Created Date"
          placeholder="Select date"
          value={value.createdDate}
          onChange={(v) => onChange(setField(value, "createdDate", v))}
        />
        <SelectField
          label="Payment Date"
          placeholder="Select Store"
          value={value.paymentDate}
          onChange={(v) => onChange(setField(value, "paymentDate", v))}
          options={["This Week", "This Month", "Last Month"]}
        />
        <SelectField
          label="Select Criteria"
          placeholder="type"
          value={value.selectCriteria}
          onChange={(v) => onChange(setField(value, "selectCriteria", v))}
          options={["Reference", "Customer", "Organization"]}
        />
      </div>
    </section>
  );
}
