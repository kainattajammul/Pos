"use client";

import { TradeinReportActions } from "@/components/inventory/trade-in-report/tradein-report-actions";
import { TradeinSummaryCards } from "@/components/inventory/trade-in-report/tradein-summary-cards";
import type {
  TradeinRecord,
  TradeinSummary,
} from "@/components/inventory/trade-in-report/tradein-report-types";

interface TradeinReportHeaderProps {
  summary: TradeinSummary;
  rows: TradeinRecord[];
}

export function TradeinReportHeader({ summary, rows }: TradeinReportHeaderProps) {
  return (
    <header className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
        <h1 className="shrink-0 text-xl font-semibold text-[#111827] md:text-[22px]">
          Tradein Report
        </h1>
        <TradeinSummaryCards summary={summary} />
      </div>
      <TradeinReportActions rows={rows} />
    </header>
  );
}
