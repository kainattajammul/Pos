"use client";

import { ArrowUpDown } from "lucide-react";
import { formatCurrency } from "@/components/repairs/repair-price-calculator/repair-price-calculator-utils";

interface CalculatorTotalBoxProps {
  totalWithTax: number;
  totalWithoutTax: number;
}

export function CalculatorTotalBox({
  totalWithTax,
  totalWithoutTax,
}: CalculatorTotalBoxProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between rounded-lg border-2 border-[#B9E6E8] bg-[#F0FAFB] px-5 py-4">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-semibold text-[#111827]">Total</span>
          <span className="text-sm text-[#6B7280]">(W/ Tax)</span>
        </div>
        <span className="text-3xl font-bold text-(--repair-primary)">
          {formatCurrency(totalWithTax)}
        </span>
      </div>
      <div className="flex items-center gap-2 text-sm font-medium text-(--repair-primary)">
        <ArrowUpDown className="size-4 text-[#22C55E]" aria-hidden />
        <span>Total without Tax: {formatCurrency(totalWithoutTax)}</span>
      </div>
    </div>
  );
}
