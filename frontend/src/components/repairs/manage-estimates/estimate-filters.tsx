"use client";

import { CalendarDays, PinOff, RotateCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EstimateFiltersState } from "@/components/repairs/manage-estimates/manage-estimates-types";
import { cn } from "@/lib/utils";

interface EstimateFiltersProps {
  value: EstimateFiltersState;
  onChange: (next: EstimateFiltersState) => void;
  onSearch: () => void;
  onReset: () => void;
}

function setField<K extends keyof EstimateFiltersState>(
  current: EstimateFiltersState,
  key: K,
  value: EstimateFiltersState[K],
): EstimateFiltersState {
  return { ...current, [key]: value };
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1 block text-sm font-medium text-[#374151]">{children}</label>;
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-10 w-full rounded-md border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary)",
        props.className,
      )}
    />
  );
}

export function EstimateFilters({ value, onChange, onSearch, onReset }: EstimateFiltersProps) {
  return (
    <section className="rounded-md border border-[#E5E7EB] bg-white p-4">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
        <div>
          <Label>Estimate ID</Label>
          <Input
            placeholder="Enter estimate id"
            value={value.estimateId}
            onChange={(e) => onChange(setField(value, "estimateId", e.target.value))}
          />
        </div>
        <div>
          <Label>Customer Name</Label>
          <Input
            placeholder="Enter customer name"
            value={value.customerName}
            onChange={(e) => onChange(setField(value, "customerName", e.target.value))}
          />
        </div>
        <div>
          <Label>Customer Email</Label>
          <Input
            placeholder="Enter customer email"
            value={value.customerEmail}
            onChange={(e) => onChange(setField(value, "customerEmail", e.target.value))}
          />
        </div>
        <div>
          <Label>Created Date</Label>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]" />
              <Input
                placeholder="Jul-25-2025"
                value={value.createdDateFrom}
                onChange={(e) => onChange(setField(value, "createdDateFrom", e.target.value))}
                className="pl-10"
              />
            </div>
            <span className="text-sm font-medium text-[#6B7280]">To</span>
            <Input
              placeholder="Jul-25-2025"
              value={value.createdDateTo}
              onChange={(e) => onChange(setField(value, "createdDateTo", e.target.value))}
            />
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-4">
        <div>
          <Label>Status</Label>
          <select
            value={value.status}
            onChange={(e) => onChange(setField(value, "status", e.target.value as EstimateFiltersState["status"]))}
            className="h-10 w-full rounded-md border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary)"
          >
            <option value="">Select estimate status</option>
            <option value="Draft">Draft</option>
            <option value="Sent">Sent</option>
            <option value="Accepted">Accepted</option>
            <option value="Declined">Declined</option>
            <option value="Expired">Expired</option>
            <option value="Converted">Converted</option>
          </select>
        </div>
        <div>
          <Label>Advance Filters</Label>
          <select
            value={value.advanceFilter}
            onChange={(e) => onChange(setField(value, "advanceFilter", e.target.value))}
            className="h-10 w-full rounded-md border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary)"
          >
            <option value="">Select advanced filters</option>
            <option value="High Value">High Value</option>
            <option value="Unassigned">Unassigned</option>
            <option value="This Week">This Week</option>
          </select>
        </div>
        <div className="lg:col-span-2" />
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-[#E5E7EB] pt-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="outline"
          className="h-9 rounded-md border-[#E5E7EB] bg-white text-sm font-medium text-[#6B7280]"
        >
          <PinOff className="size-4" />
          Unpin Filter
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="ghost" className="h-9 text-sm text-[#0F8B8D]" onClick={onReset}>
            <RotateCcw className="size-4" />
            Reset
          </Button>
          <Button type="button" variant="ghost" className="h-9 text-sm text-[#0F8B8D]">
            <Save className="size-4" />
            Save Filter
          </Button>
          <Button
            type="button"
            className="h-9 rounded-md border-0 bg-(--repair-primary) px-4 text-sm font-semibold text-(--repair-on-primary) hover:opacity-90"
            onClick={onSearch}
          >
            Search
          </Button>
        </div>
      </div>
    </section>
  );
}
