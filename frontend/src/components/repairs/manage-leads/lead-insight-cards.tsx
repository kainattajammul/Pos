"use client";

import { ChevronDown } from "lucide-react";
import { LeadDonutChartPlaceholder } from "@/components/repairs/manage-leads/lead-donut-chart-placeholder";
import type { LeadStats } from "@/components/repairs/manage-leads/manage-leads-types";
import { formatCurrency } from "@/utils/format";

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <li className="flex items-center gap-2 text-[11px] text-[#374151]">
      <span className={`size-2 shrink-0 rounded-full ${color}`} aria-hidden />
      <span>{label}</span>
    </li>
  );
}

function InsightCardFooter({ label }: { label: string }) {
  return (
    <div className="mt-3 flex items-center justify-between border-t border-[#E5E7EB] pt-2">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-[#6B7280]">
        {label}
      </span>
      <ChevronDown className="size-3.5 text-[#9CA3AF]" aria-hidden />
    </div>
  );
}

interface LeadInsightCardsProps {
  stats: LeadStats;
}

export function LeadInsightCards({ stats }: LeadInsightCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <article className="rounded-sm border border-[#E5E7EB] bg-white p-4">
        <div className="flex flex-wrap items-center gap-4">
          <LeadDonutChartPlaceholder />
          <ul className="space-y-1.5">
            <LegendItem color="bg-[#FCD34D]" label={`Won: ${formatCurrency(stats.won)}`} />
            <LegendItem color="bg-[#FB923C]" label={`Lost: ${formatCurrency(stats.lost)}`} />
            <LegendItem color="bg-[#86EFAC]" label={`Open Leads: ${formatCurrency(stats.openLeads)}`} />
            <LegendItem
              color="bg-[#93C5FD]"
              label={`In progress: ${formatCurrency(stats.inProgress)}`}
            />
            <LegendItem color="bg-[#FDE047]" label={`Expired: ${formatCurrency(stats.expired)}`} />
            <LegendItem color="bg-[#F9A8D4]" label={`Canceled: ${formatCurrency(stats.canceled)}`} />
          </ul>
        </div>
        <InsightCardFooter label="LEADS" />
      </article>

      <article className="rounded-sm border border-[#E5E7EB] bg-white p-4">
        <div className="flex flex-wrap items-center gap-4">
          <LeadDonutChartPlaceholder />
          <ul className="space-y-1.5">
            <LegendItem
              color="bg-[#22C55E]"
              label={`Face Book: ${stats.referralCounts["Face Book"]}`}
            />
            <LegendItem color="bg-[#86EFAC]" label={`Bing: ${stats.referralCounts.Bing}`} />
            <LegendItem
              color="bg-[#C4B5FD]"
              label={`Search Bing: ${stats.referralCounts["Search Bing"]}`}
            />
            <LegendItem
              color="bg-[#FCA5A5]"
              label={`Google Ads: ${stats.referralCounts["Google Ads"]}`}
            />
            <LegendItem color="bg-[#93C5FD]" label={`Others: ${stats.referralCounts.Others}`} />
          </ul>
        </div>
        <InsightCardFooter label="Referral" />
      </article>

      <article className="flex flex-col gap-3">
        <div className="flex flex-1 flex-col justify-center rounded-sm border border-[#E5E7EB] bg-white px-4 py-5">
          <p className="text-xs text-[#6B7280]">Total value of all Leads</p>
          <p className="mt-1 text-xl font-bold text-[#111827]">
            {formatCurrency(stats.totalValueAllLeads)}
          </p>
        </div>
        <div className="flex flex-1 flex-col justify-center rounded-sm border border-[#E5E7EB] bg-white px-4 py-5">
          <p className="text-xs text-[#6B7280]">Leads Won</p>
          <p className="mt-1 text-xl font-bold text-[#111827]">{formatCurrency(stats.leadsWonValue)}</p>
        </div>
      </article>
    </div>
  );
}
