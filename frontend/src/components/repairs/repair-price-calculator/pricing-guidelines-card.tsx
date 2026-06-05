"use client";

import { ChevronDown, Info, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  CalculatorFormState,
  LabourType,
  MarkupType,
  TaxMode,
} from "@/components/repairs/repair-price-calculator/repair-price-calculator-types";

interface PricingGuidelinesCardProps {
  form: CalculatorFormState;
  onChange: (next: CalculatorFormState) => void;
  onReset: () => void;
  onCalculate: () => void;
}

function setField<K extends keyof CalculatorFormState>(
  current: CalculatorFormState,
  key: K,
  value: CalculatorFormState[K],
): CalculatorFormState {
  return { ...current, [key]: value };
}

function FieldLabel({
  children,
  showInfo,
}: {
  children: React.ReactNode;
  showInfo?: boolean;
}) {
  return (
    <span className="mb-1 flex items-center gap-1 text-xs font-medium text-[#374151]">
      {children}
      {showInfo ? <Info className="size-3.5 text-[#9CA3AF]" aria-hidden /> : null}
    </span>
  );
}

const inputClass =
  "h-9 w-full rounded-sm border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary)";

const selectClass =
  "h-9 appearance-none rounded-sm border border-[#E5E7EB] bg-white px-3 pr-8 text-sm text-[#111827] focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary)";

function SelectWithChevron({
  value,
  onChange,
  options,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <div className={className ?? "relative"}>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={selectClass}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-[#9CA3AF]" />
    </div>
  );
}

export function PricingGuidelinesCard({
  form,
  onChange,
  onReset,
  onCalculate,
}: PricingGuidelinesCardProps) {
  return (
    <section className="overflow-hidden rounded-md border border-[#E5E7EB] bg-white">
      <div className="flex items-center justify-between border-b border-[#E5E7EB] bg-[#F3F4F6] px-4 py-2.5">
        <h3 className="text-sm font-semibold text-[#111827]">Pricing Guidelines</h3>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1 rounded-sm border-[#E5E7EB] bg-white px-2 text-xs text-[#374151]"
          >
            <Pencil className="size-3.5" />
            Edit
          </Button>
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-sm border border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-pos-page"
            aria-label="More options"
          >
            <ChevronDown className="size-4" />
          </button>
        </div>
      </div>

      <div className="bg-[#F5F7FC] p-4">
        <label className="mb-3 block">
          <FieldLabel>Cost</FieldLabel>
          <input
            type="number"
            min={0}
            step="0.01"
            value={form.cost}
            onChange={(e) => onChange(setField(form, "cost", e.target.value))}
            className={inputClass}
          />
        </label>

        <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="block">
            <FieldLabel>Mark Up</FieldLabel>
            <div className="flex gap-2">
              <input
                type="number"
                min={0}
                value={form.markupValue}
                onChange={(e) => onChange(setField(form, "markupValue", e.target.value))}
                className={inputClass}
              />
              <div className="relative w-[72px] shrink-0">
                <select
                  value={form.markupType}
                  onChange={(e) =>
                    onChange(setField(form, "markupType", e.target.value as MarkupType))
                  }
                  className={`${selectClass} w-full`}
                >
                  <option value="%">(%)</option>
                  <option value="Fixed">Fixed</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-[#9CA3AF]" />
              </div>
            </div>
          </label>

          <label className="block">
            <FieldLabel showInfo>Labour Rate / Fixed</FieldLabel>
            <div className="flex gap-2">
              <input
                type="number"
                min={0}
                value={form.labourValue}
                onChange={(e) => onChange(setField(form, "labourValue", e.target.value))}
                className={inputClass}
              />
              <div className="relative w-[88px] shrink-0">
                <select
                  value={form.labourType}
                  onChange={(e) =>
                    onChange(setField(form, "labourType", e.target.value as LabourType))
                  }
                  className={`${selectClass} w-full`}
                >
                  <option value="Fixed">Fixed</option>
                  <option value="Hourly">Hourly</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-[#9CA3AF]" />
              </div>
            </div>
          </label>
        </div>

        <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="block">
            <FieldLabel>Tax Class</FieldLabel>
            <SelectWithChevron
              value={form.taxClass}
              onChange={(v) => onChange(setField(form, "taxClass", v))}
              options={[
                { value: "Local (6%)", label: "Local (6%)" },
                { value: "Standard (20%)", label: "Standard (20%)" },
                { value: "Reduced (5%)", label: "Reduced (5%)" },
              ]}
            />
          </label>
          <label className="block">
            <FieldLabel>Tax Class 2</FieldLabel>
            <SelectWithChevron
              value={form.taxClass2}
              onChange={(v) => onChange(setField(form, "taxClass2", v))}
              options={[
                { value: "", label: "Tax Class 2" },
                { value: "Reduced (5%)", label: "Reduced (5%)" },
              ]}
            />
          </label>
        </div>

        <label className="mb-4 block max-w-[50%]">
          <FieldLabel>Tax</FieldLabel>
          <SelectWithChevron
            value={form.taxType}
            onChange={(v) => onChange(setField(form, "taxType", v as TaxMode))}
            options={[
              { value: "Exclusive", label: "Exclusive" },
              { value: "Inclusive", label: "Inclusive" },
            ]}
          />
        </label>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-9 rounded-sm border-[#E5E7EB] bg-white px-5 text-sm font-medium text-[#374151] hover:bg-pos-page"
            onClick={onReset}
          >
            Reset
          </Button>
          <Button
            type="button"
            className="h-9 rounded-sm border-0 bg-(--repair-primary) px-5 text-sm font-semibold text-(--repair-on-primary) hover:opacity-90"
            onClick={onCalculate}
          >
            Calculate
          </Button>
        </div>
      </div>
    </section>
  );
}
