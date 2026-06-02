"use client";

import { Calendar, ChevronDown, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { InquiryFiltersState } from "@/components/repairs/manage-inquiries/manage-inquiries-types";

interface InquiryFiltersProps {
  value: InquiryFiltersState;
  onChange: (next: InquiryFiltersState) => void;
  onSearch: () => void;
  onReset: () => void;
}

function setField<K extends keyof InquiryFiltersState>(
  current: InquiryFiltersState,
  key: K,
  value: InquiryFiltersState[K],
): InquiryFiltersState {
  return { ...current, [key]: value };
}

export function InquiryFilters({ value, onChange, onSearch, onReset }: InquiryFiltersProps) {
  return (
    <section className="rounded-sm border border-[#E5E7EB] bg-white p-4">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_1fr_1fr_1fr_230px]">
        <LabeledInput
          label="Inquiry ID"
          placeholder="Inquiry ID"
          value={value.inquiryId}
          onChange={(v) => onChange(setField(value, "inquiryId", v))}
        />
        <LabeledInput
          label="Customer Name"
          placeholder="Customer Name"
          value={value.customerName}
          onChange={(v) => onChange(setField(value, "customerName", v))}
        />
        <LabeledInput
          label="Created Date"
          placeholder="01 Jun, 2025 - 30 Jun, 2025"
          value={value.createdDateRange}
          onChange={(v) => onChange(setField(value, "createdDateRange", v))}
          rightIcon={<Calendar className="size-4 text-[#9CA3AF]" />}
        />
        <LabeledSelect
          label="Inquiry Status"
          value={value.inquiryStatus}
          onChange={(v) =>
            onChange(setField(value, "inquiryStatus", v as InquiryFiltersState["inquiryStatus"]))
          }
          options={["All", "New", "Open", "Closed", "Cancelled"]}
        />
        <div className="flex items-end gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-11 flex-1 rounded-md border-[#B9D8D5] bg-white text-sm font-semibold text-[#227E7F] hover:bg-[#F4FBFB]"
            onClick={onSearch}
          >
            Search
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-11 rounded-md border-[#B9D8D5] text-[#227E7F] hover:bg-[#F4FBFB]"
            onClick={onReset}
            aria-label="Reset filters"
          >
            <RotateCw className="size-5" />
          </Button>
        </div>

        <LabeledSelect
          label="Select Criteria"
          value={value.selectCriteria}
          onChange={(v) =>
            onChange(
              setField(value, "selectCriteria", v as InquiryFiltersState["selectCriteria"]),
            )
          }
          options={["Ticket ID", "Inquiry ID"]}
        />
        <LabeledInput
          label={value.selectCriteria}
          placeholder={value.selectCriteria}
          value={value.criteriaValue}
          onChange={(v) => onChange(setField(value, "criteriaValue", v))}
        />

        <div className="lg:col-span-3" />
        <label className="flex items-center gap-2 pt-1 text-sm text-[#6B7280]">
          <input
            type="checkbox"
            checked={value.hideClosedInquiries}
            onChange={(e) => onChange(setField(value, "hideClosedInquiries", e.target.checked))}
            className="size-4 rounded border-[#D1D5DB] text-(--repair-primary) focus:ring-(--repair-primary)"
          />
          Hide Closed Inquiries
        </label>
      </div>
    </section>
  );
}

function LabeledInput({
  label,
  placeholder,
  value,
  onChange,
  rightIcon,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  rightIcon?: React.ReactNode;
}) {
  return (
    <label className="space-y-1">
      <span className="text-sm font-semibold text-[#374151]">{label}</span>
      <div className="relative">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-11 w-full rounded-sm border border-[#E5E7EB] bg-white px-3 pr-9 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary)"
        />
        {rightIcon ? (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            {rightIcon}
          </span>
        ) : null}
      </div>
    </label>
  );
}

function LabeledSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="space-y-1">
      <span className="text-sm font-semibold text-[#374151]">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-full appearance-none rounded-sm border border-[#E5E7EB] bg-white px-3 pr-9 text-sm text-[#111827] focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary)"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]" />
      </div>
    </label>
  );
}
