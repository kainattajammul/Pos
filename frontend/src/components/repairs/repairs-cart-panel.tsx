"use client";

import { DollarSign, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const CART_ROWS = 6;

export function RepairsCartPanel() {
  return (
    <aside className="flex min-h-0 w-full flex-col border-r border-[#E5E7EB] bg-white lg:w-[42%] lg:max-w-[42%] lg:shrink-0">
      {/* Customer block */}
      <div className="shrink-0 border-b border-[#E5E7EB] p-3 md:p-4">
        <div className="flex items-center gap-3">
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold"
            style={{
              backgroundColor: "var(--repair-primary-light)",
              color: "var(--repair-primary-light-text)",
            }}
          >
            W
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[#111827]">Walkin Customer</p>
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:max-w-[200px]">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-[#9CA3AF]" />
              <Input
                placeholder="Search Customer"
                className="h-8 border-[#E5E7EB] pl-8 text-xs"
              />
            </div>
            <Button
              type="button"
              size="icon-sm"
              className="size-8 shrink-0 border-0 text-[var(--repair-on-primary)] hover:opacity-90"
              style={{ backgroundColor: "var(--repair-primary)" }}
              aria-label="Add customer"
            >
              <Plus className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Item search */}
      <div className="shrink-0 border-b border-[#E5E7EB] p-3 md:p-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter item name, SKU or scan bar code"
            className="h-9 flex-1 border-[#E5E7EB] text-sm"
          />
          <Button
            type="button"
            variant="outline"
            className="h-9 shrink-0 gap-1 px-2.5 text-xs font-medium hover:opacity-90"
            style={{
              borderColor: "var(--repair-primary)",
              backgroundColor: "var(--repair-primary-light)",
              color: "var(--repair-primary-light-text)",
            }}
          >
            <DollarSign className="size-3.5" />
            Advance Search
          </Button>
        </div>
      </div>

      {/* Table header */}
      <div className="grid shrink-0 grid-cols-[48px_1fr_72px_56px_72px] gap-1 border-b border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-[#6B7280] md:px-4">
        <span>QTY</span>
        <span>Item Name</span>
        <span className="text-right">Price</span>
        <span className="text-right">Tax</span>
        <span className="text-right">Total</span>
      </div>

      {/* Empty cart rows */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {Array.from({ length: CART_ROWS }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-[48px_1fr_72px_56px_72px] gap-1 border-b border-[#F3F4F6] px-3 py-6 md:px-4"
          >
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="shrink-0 border-t border-[#E5E7EB] bg-[#F9FAFB] p-3 md:p-4">
        <dl className="space-y-1.5 text-sm text-[#374151]">
          <div className="flex justify-between">
            <dt>Total Items</dt>
            <dd className="font-medium text-[#111827]">0</dd>
          </div>
          <div className="flex justify-between">
            <dt>Sub Total</dt>
            <dd className="font-medium text-[#111827]">$0.00</dd>
          </div>
          <div className="flex justify-between">
            <dt>Discount</dt>
            <dd className="font-medium text-[#111827]">$0.00</dd>
          </div>
          <div className="flex justify-between">
            <dt>Tax</dt>
            <dd className="font-medium text-[#111827]">$0.00</dd>
          </div>
        </dl>
      </div>

      {/* Sticky total */}
      <div className="sticky bottom-0 flex shrink-0 items-center justify-between border-t border-[#E5E7EB] bg-white px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
        <span className="text-base font-semibold text-[#111827]">Total</span>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-[#111827]">$0.00</span>
          <span className="text-[#9CA3AF]" aria-hidden>
            ▲
          </span>
        </div>
      </div>
    </aside>
  );
}
