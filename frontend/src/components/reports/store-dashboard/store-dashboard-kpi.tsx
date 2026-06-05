"use client";

import { CircleHelp } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatMoney,
  type StoreDashboardKpi,
} from "@/components/reports/store-dashboard/store-dashboard-types";

interface StoreDashboardKpiProps {
  kpi: StoreDashboardKpi;
}

const KPI_ITEMS: {
  key: keyof StoreDashboardKpi;
  label: string;
  tone: "teal" | "red" | "neutral";
}[] = [
  { key: "totalSales", label: "Total Sales", tone: "teal" },
  { key: "tax", label: "Tax", tone: "red" },
  { key: "discounts", label: "Discounts", tone: "red" },
  { key: "cogs", label: "COGS", tone: "teal" },
  { key: "netProfit", label: "Net Profit", tone: "teal" },
  { key: "totalRefunds", label: "Total Refunds", tone: "red" },
  { key: "totalExpenses", label: "Total Expenses", tone: "neutral" },
  { key: "accountReceivables", label: "Account Receivables", tone: "teal" },
];

function toneClass(tone: "teal" | "red" | "neutral") {
  if (tone === "teal") return "text-(--repair-primary)";
  if (tone === "red") return "text-[#DC2626]";
  return "text-[#6B7280]";
}

function KpiCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "teal" | "red" | "neutral";
}) {
  return (
    <article className="min-w-[120px] flex-1 rounded-sm border border-[#E5E7EB] bg-white px-3 py-2.5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center gap-1">
        <p className={cn("text-[11px] font-semibold leading-tight", toneClass(tone))}>
          {label}
        </p>
        <CircleHelp className="size-3 shrink-0 text-[#D1D5DB]" aria-hidden />
      </div>
      <p className="mt-1 text-sm font-bold text-[#111827]">{value}</p>
    </article>
  );
}

export function StoreDashboardKpi({ kpi }: StoreDashboardKpiProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {KPI_ITEMS.map(({ key, label, tone }) => (
          <KpiCard
            key={key}
            label={label}
            value={formatMoney(kpi[key])}
            tone={tone}
          />
        ))}
      </div>

      <article className="rounded-sm border border-[#E5E7EB] bg-white px-4 py-4 shadow-sm">
        <p className="text-sm font-semibold text-[#111827]">Total Account Receivables</p>
        <p className="text-xs text-[#6B7280]">(as of today)</p>
        <p className="mt-2 text-2xl font-bold text-[#111827]">
          {formatMoney(kpi.totalAccountReceivables)}
        </p>
      </article>
    </div>
  );
}
