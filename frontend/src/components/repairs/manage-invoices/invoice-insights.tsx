"use client";

import { Pin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InvoiceDonutChartPlaceholder } from "@/components/repairs/manage-invoices/invoice-donut-chart-placeholder";
import type { InvoiceStats } from "@/components/repairs/manage-invoices/manage-invoices-types";
import { formatCurrency } from "@/utils/format";

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <li className="flex items-center gap-2 text-xs text-[#374151]">
      <span className={`size-2.5 shrink-0 rounded-full ${color}`} aria-hidden />
      <span>{label}</span>
    </li>
  );
}

interface InvoiceInsightsProps {
  stats: InvoiceStats;
  insightsPinned: boolean;
  onTogglePin: () => void;
}

export function InvoiceInsights({ stats, insightsPinned, onTogglePin }: InvoiceInsightsProps) {
  return (
    <div className="space-y-3">
      {insightsPinned ? (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="rounded-sm border border-[#E5E7EB] bg-white p-4">
          <h3 className="mb-4 text-sm font-semibold text-[#111827]">Stock Alerts</h3>
          <div className="flex flex-wrap items-center gap-6">
            <InvoiceDonutChartPlaceholder />
            <ul className="space-y-2">
              <LegendItem
                color="bg-[#FCD34D]"
                label={`Total Sales: ${formatCurrency(stats.totalSales)}`}
              />
              <LegendItem
                color="bg-[#FDBA74]"
                label={`Payment Received( Tax excluded): ${formatCurrency(0)}`}
              />
              <LegendItem color="bg-[#FEF08A]" label={`Unpaid: ${formatCurrency(0)}`} />
              <LegendItem
                color="bg-[#D6B08A]"
                label={`Total Refund: ${formatCurrency(stats.totalRefunds)}`}
              />
            </ul>
          </div>
        </article>

        <article className="rounded-sm border border-[#E5E7EB] bg-white p-4">
          <h3 className="mb-4 text-sm font-semibold text-[#111827]">Stock Alerts</h3>
          <div className="flex flex-wrap items-center gap-6">
            <InvoiceDonutChartPlaceholder />
            <ul className="space-y-2">
              <LegendItem
                color="bg-[#86EFAC]"
                label={`Total Invoices: ${stats.totalInvoices}`}
              />
              <LegendItem color="bg-[#BBF7D0]" label="Paid: 0" />
              <LegendItem color="bg-[#C4B5FD]" label="Unpaid: 0" />
              <LegendItem color="bg-[#FCA5A5]" label="Refunnds: 0" />
              <LegendItem color="bg-[#DDD6FE]" label="Partial: 0" />
            </ul>
          </div>
        </article>
      </div>
      ) : null}

      <Button
        type="button"
        variant="outline"
        className="h-9 rounded-sm border-[#E5E7EB] bg-white px-3 text-sm font-medium text-[#374151] hover:bg-pos-page"
        onClick={onTogglePin}
      >
        <Pin className="size-4" />
        {insightsPinned ? "Unpin Insights" : "Pin Insights"}
      </Button>
    </div>
  );
}
