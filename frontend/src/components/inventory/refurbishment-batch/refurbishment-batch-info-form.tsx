"use client";

import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  EMPLOYEE_OPTIONS,
  type RefurbishmentBatchFormState,
} from "@/components/inventory/refurbishment-batch/refurbishment-batch-create-types";

const fieldClass =
  "h-10 w-full rounded-sm border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary)";

interface RefurbishmentBatchInfoFormProps {
  value: RefurbishmentBatchFormState;
  onChange: (next: RefurbishmentBatchFormState) => void;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-sm font-medium text-[#374151]">{children}</span>;
}

export function RefurbishmentBatchInfoForm({
  value,
  onChange,
}: RefurbishmentBatchInfoFormProps) {
  return (
    <section className="rounded-sm border border-[#E5E7EB] bg-white p-4 shadow-sm md:p-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-x-8">
        <div className="space-y-4">
          <label className="block space-y-1.5">
            <FieldLabel>Refurbish Batch Name</FieldLabel>
            <input
              value={value.batchName}
              onChange={(e) => onChange({ ...value, batchName: e.target.value })}
              className={fieldClass}
            />
          </label>
          <label className="block space-y-1.5">
            <FieldLabel>Employee</FieldLabel>
            <div className="relative">
              <select
                value={value.employee}
                onChange={(e) => onChange({ ...value, employee: e.target.value })}
                className={cn(fieldClass, "appearance-none pr-16")}
              >
                <option value="">Select employee</option>
                {EMPLOYEE_OPTIONS.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              {value.employee ? (
                <button
                  type="button"
                  className="absolute right-8 top-1/2 -translate-y-1/2 rounded p-0.5 text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#374151]"
                  aria-label="Clear employee"
                  onClick={() => onChange({ ...value, employee: "" })}
                >
                  <X className="size-4" />
                </button>
              ) : null}
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]" />
            </div>
          </label>
        </div>

        <div className="space-y-4">
          <label className="block space-y-1.5">
            <FieldLabel>Store</FieldLabel>
            <input
              value={value.store}
              onChange={(e) => onChange({ ...value, store: e.target.value })}
              className={fieldClass}
            />
          </label>
          <label className="block space-y-1.5">
            <FieldLabel>Date</FieldLabel>
            <input
              value={value.dateDisplay}
              readOnly
              className={cn(fieldClass, "bg-[#FAFAFA] text-[#374151]")}
            />
          </label>
        </div>
      </div>
    </section>
  );
}
