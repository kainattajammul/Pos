"use client";

import { ChevronDown } from "lucide-react";

interface PhoneInputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function PhoneInputField({ label, value, onChange }: PhoneInputFieldProps) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-[#374151]">{label}</span>
      <div className="flex overflow-hidden rounded-sm border border-[#E5E7EB] bg-white focus-within:border-(--repair-primary) focus-within:ring-1 focus-within:ring-(--repair-primary)">
        <button
          type="button"
          className="flex shrink-0 items-center gap-1 border-r border-[#E5E7EB] bg-pos-page px-2.5 py-2 text-sm text-[#374151]"
          aria-label="Country code United Kingdom"
        >
          <span aria-hidden>🇬🇧</span>
          <ChevronDown className="size-3.5 text-[#9CA3AF]" />
        </button>
        <input
          type="tel"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 min-w-0 flex-1 border-0 bg-transparent px-3 text-sm text-[#111827] outline-none"
          placeholder=""
        />
      </div>
    </label>
  );
}
