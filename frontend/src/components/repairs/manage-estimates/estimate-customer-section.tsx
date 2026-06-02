"use client";

import { MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MOCK_CUSTOMERS = ["Walkin Customer", "Soft Access", "John Smith", "Sarah Ahmed"];

interface EstimateCustomerSectionProps {
  search: string;
  customerName: string;
  onSearchChange: (value: string) => void;
  onSelectCustomer: (name: string) => void;
  onNewCustomer?: () => void;
}

export function EstimateCustomerSection({
  search,
  customerName,
  onSearchChange,
  onSelectCustomer,
  onNewCustomer,
}: EstimateCustomerSectionProps) {
  const suggestions =
    search.trim().length > 0
      ? MOCK_CUSTOMERS.filter((c) => c.toLowerCase().includes(search.toLowerCase()))
      : [];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-[#111827]">Customer</h3>
      <div className="relative flex gap-2">
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search Customer"
          className="h-10 flex-1 rounded-md border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary)"
        />
        <Button
          type="button"
          onClick={onNewCustomer}
          className="h-10 shrink-0 rounded-md border-0 bg-(--repair-primary) px-3 text-sm font-semibold text-(--repair-on-primary) hover:opacity-90"
        >
          <Plus className="size-4" />
          NEW
        </Button>
        {suggestions.length > 0 ? (
          <div className="absolute top-11 left-0 right-14 z-10 rounded-md border border-[#E5E7EB] bg-white shadow-lg">
            {suggestions.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => onSelectCustomer(name)}
                className="block w-full px-3 py-2 text-left text-sm text-[#374151] hover:bg-[#F3F4F6]"
              >
                {name}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <Button
        type="button"
        className="h-9 rounded-md border-0 bg-(--repair-primary) px-4 text-sm font-semibold text-(--repair-on-primary) hover:opacity-90"
      >
        <MessageSquare className="size-4" />
        Notes
      </Button>
      <p className={cn("text-sm text-[#374151]", !customerName && "text-[#9CA3AF]")}>
        {customerName || "Walkin Customer"}
      </p>
    </div>
  );
}
