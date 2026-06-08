"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";
import { RepairsTopNav } from "@/components/repairs/repairs-top-nav";
import { SalesSummaryActions } from "@/components/reports/sales-summary/sales-summary-actions";
import { SalesSummaryFiltersBar } from "@/components/reports/sales-summary/sales-summary-filters";
import { SalesSummaryTable } from "@/components/reports/sales-summary/sales-summary-table";
import {
  loadReportFavourites,
  saveReportFavourites,
} from "@/lib/reports-favourites";
import { cn } from "@/lib/utils";
import {
  computeSalesSummaryTotals,
  DEFAULT_PERIOD,
  DEFAULT_SALES_SUMMARY_FILTERS,
  EMPTY_SALES_SUMMARY_TOTALS,
  filterSalesSummaryRows,
  formatDateRangeLabel,
  getDateRangeForTab,
  MOCK_SALES_SUMMARY_ROWS,
  type SalesSummaryDateTab,
  type SalesSummaryFilters,
} from "@/components/reports/sales-summary/sales-summary-types";

const REPORT_ID = "sales-summary";

export function SalesSummaryPage() {
  const [draftFilters, setDraftFilters] = useState<SalesSummaryFilters>(
    DEFAULT_SALES_SUMMARY_FILTERS,
  );
  const [appliedFilters, setAppliedFilters] = useState<SalesSummaryFilters>(
    DEFAULT_SALES_SUMMARY_FILTERS,
  );
  const [activeDateTab, setActiveDateTab] = useState<SalesSummaryDateTab>("Today");
  const [periodRange, setPeriodRange] = useState(DEFAULT_PERIOD);
  const [hasRunReport, setHasRunReport] = useState(false);
  const [isFavourite, setIsFavourite] = useState(false);

  useEffect(() => {
    setIsFavourite(loadReportFavourites().has(REPORT_ID));
  }, []);

  const filteredRows = useMemo(() => {
    if (!hasRunReport) return [];
    return filterSalesSummaryRows(MOCK_SALES_SUMMARY_ROWS, appliedFilters);
  }, [appliedFilters, hasRunReport]);

  const totals = useMemo(() => {
    if (!hasRunReport) return EMPTY_SALES_SUMMARY_TOTALS;
    return computeSalesSummaryTotals(filteredRows);
  }, [filteredRows, hasRunReport]);

  const periodLabel = formatDateRangeLabel(periodRange.start, periodRange.end);

  const handleRunReport = useCallback(() => {
    setAppliedFilters(draftFilters);
    setPeriodRange(getDateRangeForTab(activeDateTab));
    setHasRunReport(true);
  }, [activeDateTab, draftFilters]);

  const handleRefresh = useCallback(() => {
    setDraftFilters(DEFAULT_SALES_SUMMARY_FILTERS);
    setAppliedFilters(DEFAULT_SALES_SUMMARY_FILTERS);
    setActiveDateTab("Today");
    setPeriodRange(DEFAULT_PERIOD);
    setHasRunReport(false);
  }, []);

  const handleDateTabChange = useCallback((tab: SalesSummaryDateTab) => {
    setActiveDateTab(tab);
    setPeriodRange(getDateRangeForTab(tab));
  }, []);

  const toggleFavourite = () => {
    const favourites = loadReportFavourites();
    if (favourites.has(REPORT_ID)) favourites.delete(REPORT_ID);
    else favourites.add(REPORT_ID);
    saveReportFavourites(favourites);
    setIsFavourite(favourites.has(REPORT_ID));
  };

  return (
    <div className="repairs-pos-theme flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-pos-page">
      <RepairsTopNav />
      <div className="min-h-0 flex-1 overflow-auto">
        <div className="mx-auto w-full max-w-[1600px] space-y-4 p-4 md:p-5">
          <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#111827] md:text-2xl">
                Sales Summary Report
              </h1>
              <button
                type="button"
                className="rounded p-1 text-[#D1D5DB] transition-colors hover:text-amber-500"
                aria-label={isFavourite ? "Remove from favourites" : "Add to favourites"}
                onClick={toggleFavourite}
              >
                <Star
                  className={cn(
                    "size-5",
                    isFavourite && "fill-amber-400 text-amber-400",
                  )}
                />
              </button>
            </div>
            <SalesSummaryActions rows={filteredRows} totals={totals} />
          </header>

          <SalesSummaryFiltersBar
            value={draftFilters}
            onChange={setDraftFilters}
            onRunReport={handleRunReport}
            onRefresh={handleRefresh}
          />

          <SalesSummaryTable
            rows={filteredRows}
            totals={totals}
            periodLabel={periodLabel}
            activeDateTab={activeDateTab}
            onDateTabChange={handleDateTabChange}
          />
        </div>
      </div>
    </div>
  );
}
