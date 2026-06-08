"use client";

import { Bookmark, ChevronDown, Pin, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BRAND_OPTIONS,
  CATEGORY_OPTIONS,
  MODEL_OPTIONS,
  type RepairsServiceFilters,
} from "@/components/inventory/manage-services/repairs-services-types";

interface RepairsServicesFiltersProps {
  value: RepairsServiceFilters;
  onChange: (next: RepairsServiceFilters) => void;
  onSearch: () => void;
  onReset: () => void;
  onUnpin: () => void;
  onSave: () => void;
}

const selectClass =
  "h-9 w-full appearance-none rounded-sm border border-[#E5E7EB] bg-white px-3 pr-9 text-sm text-[#111827] focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary)";

const inputClass =
  "h-9 w-full rounded-sm border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary)";

function FilterLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-xs font-semibold text-[#374151]">{children}</span>;
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
    <label className="space-y-1.5">
      <FilterLabel>{label}</FilterLabel>
      <div className="relative">
        <select value={value} onChange={(e) => onChange(e.target.value)} className={selectClass}>
          <option value="">{placeholder}</option>
          {options
            .filter((opt) => opt !== "Please Select")
            .map((opt) => (
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

export function RepairsServicesFilters({
  value,
  onChange,
  onSearch,
  onReset,
  onUnpin,
  onSave,
}: RepairsServicesFiltersProps) {
  return (
    <section className="pos-card rounded-sm border border-[#E5E7EB] bg-white p-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SelectField
          label="Category"
          placeholder="Select Category"
          value={value.category}
          options={CATEGORY_OPTIONS}
          onChange={(category) => onChange({ ...value, category })}
        />
        <SelectField
          label="Brand"
          placeholder="Select Brand"
          value={value.brand}
          options={BRAND_OPTIONS}
          onChange={(brand) => onChange({ ...value, brand })}
        />
        <SelectField
          label="Model"
          placeholder="Select Model"
          value={value.model}
          options={MODEL_OPTIONS}
          onChange={(model) => onChange({ ...value, model })}
        />
        <label className="space-y-1.5">
          <FilterLabel>Keyword</FilterLabel>
          <input
            type="text"
            value={value.keyword}
            onChange={(e) => onChange({ ...value, keyword: e.target.value })}
            placeholder="Enter keyword"
            className={inputClass}
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#E5E7EB] pt-3">
        <Button
          type="button"
          variant="outline"
          className="h-9 gap-1.5 rounded-sm border-[#E5E7EB] bg-white text-sm font-medium text-[#374151] hover:bg-pos-page"
          onClick={onUnpin}
        >
          <Pin className="size-4" />
          Unpin Filter
        </Button>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-(--repair-primary) hover:underline"
          >
            <RotateCcw className="size-4" />
            Reset
          </button>
          <button
            type="button"
            onClick={onSave}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-(--repair-primary) hover:underline"
          >
            <Bookmark className="size-4" />
            Save Filter
          </button>
          <Button
            type="button"
            className="h-9 min-w-[88px] rounded-sm border-0 bg-(--repair-primary) px-5 text-sm font-semibold text-(--repair-on-primary) hover:opacity-90"
            onClick={onSearch}
          >
            Search
          </Button>
        </div>
      </div>
    </section>
  );
}
