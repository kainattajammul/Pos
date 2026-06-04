"use client";

import { Button } from "@/components/ui/button";

const fieldClass =
  "h-10 w-full rounded-sm border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary)";

interface RefurbishmentBatchImeiEntryProps {
  value: string;
  onChange: (value: string) => void;
  onAdd: () => void;
}

export function RefurbishmentBatchImeiEntry({
  value,
  onChange,
  onAdd,
}: RefurbishmentBatchImeiEntryProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold text-[#111827]">
        Enter IMEI / Serial or scan barcode below
      </h2>
      <section className="rounded-sm border border-[#E5E7EB] bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onAdd();
              }
            }}
            placeholder="IMEI / Serial"
            className={fieldClass}
            aria-label="IMEI or Serial number"
          />
          <Button
            type="button"
            className="h-10 shrink-0 rounded-sm border-0 bg-(--repair-primary) px-8 text-sm font-semibold text-(--repair-on-primary) hover:opacity-90 sm:min-w-[100px]"
            onClick={onAdd}
          >
            Add
          </Button>
        </div>
      </section>
    </div>
  );
}
