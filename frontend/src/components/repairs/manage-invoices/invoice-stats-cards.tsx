"use client";

import { Info } from "lucide-react";
import type { InvoiceStats } from "@/components/repairs/manage-invoices/manage-invoices-types";

function money(amount: number) {
  return `£${amount.toFixed(2)}`;
}

function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle?: string;
}) {
  return (
    <article className="rounded-sm border border-[#E5E7EB] bg-white px-4 py-3">
      <div className="flex items-center gap-1 text-xs font-medium text-[#374151]">
        <span>{title}</span>
        <Info className="size-3.5 text-[#9CA3AF]" aria-hidden />
      </div>
      {subtitle ? <p className="mt-0.5 text-[10px] text-[#6B7280]">{subtitle}</p> : null}
      <p className="mt-2 text-lg font-semibold text-[#111827]">{value}</p>
    </article>
  );
}

interface InvoiceStatsCardsProps {
  stats: InvoiceStats;
}

export function InvoiceStatsCards({ stats }: InvoiceStatsCardsProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Sales" value={money(stats.totalSales)} />
        <StatCard title="Total Invoices" value={String(stats.totalInvoices)} />
        <StatCard title="Total Tax" value={money(stats.totalTax)} />
        <StatCard title="Total Refunds" value={money(stats.totalRefunds)} />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Account Receivable" value={money(stats.accountReceivable)} />
        <StatCard
          title="Total Account Receivable"
          subtitle="As of Today"
          value={money(stats.totalAccountReceivable)}
        />
      </div>
    </div>
  );
}
