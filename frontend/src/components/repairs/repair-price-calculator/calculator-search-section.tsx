"use client";

import { ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SearchType } from "@/components/repairs/repair-price-calculator/repair-price-calculator-types";

interface CalculatorSearchSectionProps {
  searchType: SearchType;
  store: string;
  searchQuery: string;
  onSearchTypeChange: (type: SearchType) => void;
  onStoreChange: (store: string) => void;
  onSearchQueryChange: (query: string) => void;
}

const STORES = ["MS", "Store A", "Store B"];

const VENDORS = [
  { id: "injured", label: "Injured Gadgets", color: "bg-[#1E3A5F] text-white" },
  { id: "sentrix", label: "Mobile Sentrix", color: "bg-[#E11D48] text-white" },
  { id: "plp", label: "PLP", color: "bg-[#0F766E] text-white" },
] as const;

export function CalculatorSearchSection({
  searchType,
  store,
  searchQuery,
  onSearchTypeChange,
  onStoreChange,
  onSearchQueryChange,
}: CalculatorSearchSectionProps) {
  return (
    <section className="rounded-md border border-[#E5E7EB] bg-white p-3">
      <div className="flex gap-4 border-b border-[#E5E7EB]">
        {(["Name", "SKU"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onSearchTypeChange(tab)}
            className={cn(
              "border-b-2 pb-2 text-sm font-medium transition-colors",
              searchType === tab
                ? "border-(--repair-primary) text-(--repair-primary)"
                : "border-transparent text-[#9CA3AF] hover:text-[#374151]",
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mt-3 flex gap-0 overflow-hidden rounded-sm border border-[#E5E7EB]">
        <div className="relative shrink-0 border-r border-[#E5E7EB]">
          <select
            value={store}
            onChange={(e) => onStoreChange(e.target.value)}
            className="h-10 appearance-none bg-[#F9FAFB] py-2 pl-3 pr-8 text-sm font-medium text-[#374151] focus:outline-none"
          >
            {STORES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-[#9CA3AF]" />
        </div>
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            placeholder={searchType === "Name" ? "Search by name" : "Search by SKU"}
            className="h-10 w-full bg-white pl-9 pr-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <span className="text-xs text-[#6B7280]">Supported Vendors:</span>
        {VENDORS.map((vendor) => (
          <span
            key={vendor.id}
            className={cn(
              "inline-flex h-7 min-w-[72px] items-center justify-center rounded px-2 text-[10px] font-bold tracking-tight",
              vendor.color,
            )}
            title={vendor.label}
          >
            {vendor.label.split(" ")[0]}
          </span>
        ))}
      </div>
    </section>
  );
}
