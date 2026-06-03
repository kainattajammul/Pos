"use client";

import { formatCompactMoney } from "@/components/inventory/trade-in-report/tradein-report-types";
import type { TradeinSummary } from "@/components/inventory/trade-in-report/tradein-report-types";

interface TradeinSummaryCardsProps {
  summary: TradeinSummary;
}

const CARD_ITEMS: { key: keyof TradeinSummary; label: string }[] = [
  { key: "totalPurchase", label: "Total Purchase" },
  { key: "totalSales", label: "Total Sales" },
  { key: "taxCollected", label: "Tax Collected" },
  { key: "totalProfit", label: "Total Profit" },
];

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="min-w-[108px] rounded-sm border border-[#E5E7EB] bg-white px-3 py-2">
      <p className="text-[11px] font-medium leading-tight text-[#6B7280]">{label}</p>
      <p className="mt-0.5 text-sm font-bold text-[#111827]">{value}</p>
    </article>
  );
}

export function TradeinSummaryCards({ summary }: TradeinSummaryCardsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {CARD_ITEMS.map(({ key, label }) => (
        <SummaryCard
          key={key}
          label={label}
          value={formatCompactMoney(summary[key])}
        />
      ))}
    </div>
  );
}
