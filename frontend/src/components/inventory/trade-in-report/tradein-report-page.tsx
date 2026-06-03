"use client";

import { useMemo, useState } from "react";
import { RepairsTopNav } from "@/components/repairs/repairs-top-nav";
import { TradeinReportFilters } from "@/components/inventory/trade-in-report/tradein-report-filters";
import { TradeinReportHeader } from "@/components/inventory/trade-in-report/tradein-report-header";
import { TradeinReportTable } from "@/components/inventory/trade-in-report/tradein-report-table";
import {
  computeTradeinSummary,
  DEFAULT_TRADEIN_FILTERS,
  EMPTY_SUMMARY_DISPLAY,
  formatDateRangeLabel,
  getDateRangeForTab,
  matchesTradeinDateTab,
  MOCK_TRADEIN_RECORDS,
  parsePurchasedDate,
  type TradeinDateTab,
  type TradeinFiltersState,
  type TradeinRecord,
} from "@/components/inventory/trade-in-report/tradein-report-types";

const DEFAULT_PERIOD = { start: new Date(2025, 5, 24), end: new Date(2025, 5, 24) };

function filterRecords(
  records: TradeinRecord[],
  appliedFilters: TradeinFiltersState,
  activeDateTab: TradeinDateTab,
): TradeinRecord[] {
  const { start, end } = getDateRangeForTab(activeDateTab);
  const inclusiveEnd = new Date(end);
  inclusiveEnd.setHours(23, 59, 59, 999);

  return records.filter((row) => {
    const rowDate = parsePurchasedDate(row.purchasedDate);
    if (!rowDate) return false;

    if (!matchesTradeinDateTab(rowDate, activeDateTab)) return false;
    if (rowDate < start || rowDate > inclusiveEnd) return false;

    if (appliedFilters.date) {
      const filterDate = new Date(appliedFilters.date);
      if (
        rowDate.getFullYear() !== filterDate.getFullYear() ||
        rowDate.getMonth() !== filterDate.getMonth() ||
        rowDate.getDate() !== filterDate.getDate()
      ) {
        return false;
      }
    }

    if (appliedFilters.type && row.status !== appliedFilters.type) {
      return false;
    }

    if (appliedFilters.criteria) {
      const value = appliedFilters.criteria;
      if (value === "Store Name" && !row.storeName) return false;
      if (value === "Seller" && !row.seller) return false;
      if (value === "Buyer" && !row.buyer) return false;
      if (value === "SKU" && !row.sku) return false;
      if (value === "IMEI/Serial" && !row.imeiSerial) return false;
    }

    return true;
  });
}

export function TradeinReportPage() {
  const [records] = useState<TradeinRecord[]>(MOCK_TRADEIN_RECORDS);
  const [draftFilters, setDraftFilters] =
    useState<TradeinFiltersState>(DEFAULT_TRADEIN_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<TradeinFiltersState>(DEFAULT_TRADEIN_FILTERS);
  const [activeDateTab, setActiveDateTab] = useState<TradeinDateTab>("Today");
  const [periodRange, setPeriodRange] = useState(DEFAULT_PERIOD);

  const filteredRows = useMemo(
    () => filterRecords(records, appliedFilters, activeDateTab),
    [activeDateTab, appliedFilters, records],
  );

  const summary = useMemo(() => {
    if (filteredRows.length === 0) return EMPTY_SUMMARY_DISPLAY;
    return computeTradeinSummary(filteredRows);
  }, [filteredRows]);

  const tableTotals = useMemo(
    () =>
      filteredRows.reduce(
        (acc, row) => ({
          purchaseAmount: acc.purchaseAmount + row.purchaseAmount,
          saleAmount: acc.saleAmount + row.saleAmount,
          profit: acc.profit + row.profit,
        }),
        { purchaseAmount: 0, saleAmount: 0, profit: 0 },
      ),
    [filteredRows],
  );

  const periodLabel = formatDateRangeLabel(periodRange.start, periodRange.end);

  const handleRunReport = () => {
    setAppliedFilters(draftFilters);
    const range = getDateRangeForTab(activeDateTab);
    setPeriodRange(range);
  };

  const handleReset = () => {
    setDraftFilters(DEFAULT_TRADEIN_FILTERS);
    setAppliedFilters(DEFAULT_TRADEIN_FILTERS);
    setActiveDateTab("Today");
    setPeriodRange(DEFAULT_PERIOD);
  };

  const handleDateTabChange = (tab: TradeinDateTab) => {
    setActiveDateTab(tab);
    const range = getDateRangeForTab(tab);
    setPeriodRange(range);
  };

  return (
    <div className="repairs-pos-theme flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[#F8FAFC]">
      <RepairsTopNav />
      <div className="min-h-0 flex-1 overflow-auto">
        <div className="mx-auto w-full max-w-[1600px] space-y-4 p-4 md:p-5">
          <TradeinReportHeader summary={summary} rows={filteredRows} />

          <TradeinReportFilters
            value={draftFilters}
            onChange={setDraftFilters}
            onRunReport={handleRunReport}
            onReset={handleReset}
          />

          <TradeinReportTable
            rows={filteredRows}
            periodLabel={periodLabel}
            activeDateTab={activeDateTab}
            onDateTabChange={handleDateTabChange}
            totals={tableTotals}
          />
        </div>
      </div>
    </div>
  );
}
