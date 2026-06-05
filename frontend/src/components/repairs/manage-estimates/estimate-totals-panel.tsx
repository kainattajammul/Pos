"use client";

import { formatMoney } from "@/components/repairs/manage-estimates/create-estimate-utils";

interface EstimateTotalsPanelProps {
  subTotal: number;
  tax: number;
  total: number;
  estimateDiscount: number;
  onEstimateDiscountChange: (value: number) => void;
  onAddDiscountReason?: () => void;
}

export function EstimateTotalsPanel({
  subTotal,
  tax,
  total,
  estimateDiscount,
  onEstimateDiscountChange,
  onAddDiscountReason,
}: EstimateTotalsPanelProps) {
  return (
    <div className="ml-auto w-full max-w-sm rounded-md border border-[#E5E7EB] bg-white">
      <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-2.5 text-sm">
        <span className="font-medium text-[#374151]">Sub Total</span>
        <span className="font-semibold text-[#111827]">{formatMoney(subTotal)}</span>
      </div>
      <div className="flex items-center justify-between gap-3 border-b border-[#E5E7EB] px-4 py-2.5 text-sm">
        <span className="font-medium text-[#374151]">Discount</span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            step="0.01"
            value={estimateDiscount}
            onChange={(e) =>
              onEstimateDiscountChange(Number.parseFloat(e.target.value) || 0)
            }
            className="h-8 w-24 rounded-md border border-[#E5E7EB] px-2 text-right text-sm focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary)"
          />
          <button
            type="button"
            onClick={onAddDiscountReason}
            className="text-xs font-medium text-(--repair-primary) hover:underline"
          >
            Add Reason
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-2.5 text-sm">
        <span className="font-medium text-[#374151]">Tax</span>
        <span className="font-semibold text-[#111827]">{formatMoney(tax)}</span>
      </div>
      <div className="flex items-center justify-between bg-pos-page px-4 py-2.5 text-sm">
        <span className="font-semibold text-[#111827]">Total</span>
        <span className="text-base font-bold text-[#111827]">{formatMoney(total)}</span>
      </div>
    </div>
  );
}
