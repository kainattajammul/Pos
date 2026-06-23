"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";
import { RepairsTopNav } from "@/components/repairs/repairs-top-nav";
import { StoreDashboardFiltersBar } from "@/components/reports/store-dashboard/store-dashboard-filters";
import { StoreDashboardKpi } from "@/components/reports/store-dashboard/store-dashboard-kpi";
import {
  DailySalesSection,
  PaymentMethodsSection,
  RepairTicketsSection,
  SalesByItemTypeSection,
  StockAlertsSection,
} from "@/components/reports/store-dashboard/store-dashboard-sections";
import {
  loadReportFavourites,
  saveReportFavourites,
} from "@/lib/reports-favourites";
import { cn } from "@/lib/utils";
import {
  computeKpiFromSales,
  DEFAULT_PERIOD,
  DEFAULT_STORE_DASHBOARD_FILTERS,
  filterDailySales,
  filterRepairTickets,
  getDateRangeForTab,
  MOCK_DAILY_SALES,
  MOCK_PAYMENT_METHODS,
  MOCK_REPAIR_TICKETS,
  type StoreDashboardDateTab,
  type StoreDashboardFilters,
} from "@/components/reports/store-dashboard/store-dashboard-types";

const REPORT_ID = "store-dashboard";

export function StoreDashboardPage() {
  const [draftFilters, setDraftFilters] = useState<StoreDashboardFilters>(
    DEFAULT_STORE_DASHBOARD_FILTERS,
  );
  const [appliedFilters, setAppliedFilters] = useState<StoreDashboardFilters>(
    DEFAULT_STORE_DASHBOARD_FILTERS,
  );
  const [activeDateTab, setActiveDateTab] = useState<StoreDashboardDateTab>("TODAY");
  const [periodRange, setPeriodRange] = useState(DEFAULT_PERIOD);
  const [isFavourite, setIsFavourite] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setIsFavourite(loadReportFavourites().has(REPORT_ID));
  }, []);

  const filteredSales = useMemo(
    () => filterDailySales(MOCK_DAILY_SALES, appliedFilters, periodRange),
    [appliedFilters, periodRange],
  );

  const todaySales = useMemo(
    () =>
      filterDailySales(MOCK_DAILY_SALES, appliedFilters, getDateRangeForTab("TODAY")),
    [appliedFilters],
  );

  const filteredTickets = useMemo(
    () => filterRepairTickets(MOCK_REPAIR_TICKETS, appliedFilters),
    [appliedFilters],
  );

  const kpi = useMemo(() => computeKpiFromSales(todaySales), [todaySales]);

  const handleRunReport = useCallback(() => {
    setAppliedFilters(draftFilters);
    setPeriodRange(
      activeDateTab === "TODAY" ? DEFAULT_PERIOD : getDateRangeForTab(activeDateTab),
    );
    setReloadKey((k) => k + 1);
  }, [activeDateTab, draftFilters]);

  const handleRefresh = useCallback(() => {
    setDraftFilters(DEFAULT_STORE_DASHBOARD_FILTERS);
    setAppliedFilters(DEFAULT_STORE_DASHBOARD_FILTERS);
    setActiveDateTab("TODAY");
    setPeriodRange(DEFAULT_PERIOD);
    setReloadKey((k) => k + 1);
  }, []);

  const handleDateTabChange = useCallback((tab: StoreDashboardDateTab) => {
    setActiveDateTab(tab);
    setPeriodRange(tab === "TODAY" ? DEFAULT_PERIOD : getDateRangeForTab(tab));
    setReloadKey((k) => k + 1);
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
          <header className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#111827] md:text-2xl">
              Fone doctors Overview
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
          </header>

          <StoreDashboardFiltersBar
            value={draftFilters}
            activeDateTab={activeDateTab}
            onChange={setDraftFilters}
            onDateTabChange={handleDateTabChange}
            onRunReport={handleRunReport}
            onRefresh={handleRefresh}
          />

          <StoreDashboardKpi kpi={kpi} />

          <SalesByItemTypeSection />

          <DailySalesSection rows={filteredSales} period={periodRange} />

          <PaymentMethodsSection payments={MOCK_PAYMENT_METHODS} />

          <div className="grid gap-4 lg:grid-cols-2">
            <StockAlertsSection />
            <RepairTicketsSection tickets={filteredTickets} />
          </div>
        </div>
      </div>
    </div>
  );
}
