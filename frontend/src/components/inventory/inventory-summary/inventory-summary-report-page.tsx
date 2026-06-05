"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { RepairsTopNav } from "@/components/repairs/repairs-top-nav";
import {
  InventorySummaryMetrics,
  InventorySummaryReportActions,
} from "@/components/inventory/inventory-summary/inventory-summary-report-actions";
import { InventorySummaryReportFilters } from "@/components/inventory/inventory-summary/inventory-summary-report-filters";
import { InventorySummaryReportTable } from "@/components/inventory/inventory-summary/inventory-summary-report-table";
import {
  DEFAULT_INVENTORY_SUMMARY_FILTERS,
  buildInventorySummaryReport,
  computeSummaryMetrics,
  computeSummaryTotals,
  getInventorySummarySourceProducts,
  type InventorySummaryFilters,
} from "@/components/inventory/inventory-summary/inventory-summary-report-types";
import { APP_CONFIG } from "@/constants/config";

export function InventorySummaryReportPage() {
  const storeName = APP_CONFIG.appName;

  const [draftFilters, setDraftFilters] = useState<InventorySummaryFilters>({
    ...DEFAULT_INVENTORY_SUMMARY_FILTERS,
    store: storeName,
  });
  const [appliedFilters, setAppliedFilters] = useState<InventorySummaryFilters | null>(
    null,
  );
  const [pageSize, setPageSize] = useState(100);

  const reportRows = useMemo(() => {
    if (!appliedFilters) return [];
    return buildInventorySummaryReport(
      getInventorySummarySourceProducts(),
      appliedFilters,
      storeName,
    );
  }, [appliedFilters, storeName]);

  const metrics = useMemo(() => computeSummaryMetrics(reportRows), [reportRows]);
  const totals = useMemo(() => computeSummaryTotals(reportRows), [reportRows]);

  const handleRunReport = () => {
    if (!draftFilters.criteria) {
      toast.error("Please select a criteria before running the report.");
      return;
    }
    setAppliedFilters({
      ...draftFilters,
      store: draftFilters.store || storeName,
    });
  };

  const handleReset = () => {
    setDraftFilters({ ...DEFAULT_INVENTORY_SUMMARY_FILTERS, store: storeName });
    setAppliedFilters(null);
  };

  return (
    <div className="repairs-pos-theme flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <RepairsTopNav />
      <main className="flex-1 overflow-auto">
        <div className="mx-auto w-full max-w-[1600px] space-y-4 p-4 md:p-5">
          <nav className="pos-breadcrumb" aria-label="Breadcrumb">
            <Link href="/dashboard">Home</Link>
            <span className="mx-1.5 text-pos-subtle">/</span>
            <span className="font-medium text-pos-secondary">Statistics</span>
            <span className="mx-1.5 text-pos-subtle">/</span>
            <span className="font-medium text-pos-secondary">Inventory Summary Report</span>
          </nav>

          <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-xl font-semibold text-pos md:text-2xl">
                  Inventory Summary Report
                </h1>
                {appliedFilters ? (
                  <InventorySummaryMetrics
                    totalInventoryValue={metrics.totalInventoryValue}
                    totalItems={metrics.totalItems}
                  />
                ) : null}
              </div>
              <button
                type="button"
                className="rounded-sm p-0.5 text-pos-subtle transition-colors hover:text-[var(--repair-primary)]"
                aria-label="Add to favorites (coming soon)"
                onClick={() => toast.message("Favorites — coming soon")}
              >
                <Star className="size-5" />
              </button>
            </div>
            <InventorySummaryReportActions rows={reportRows} />
          </header>

          <InventorySummaryReportFilters
            value={draftFilters}
            defaultStoreName={storeName}
            onChange={setDraftFilters}
            onRunReport={handleRunReport}
            onReset={handleReset}
          />

          <InventorySummaryReportTable
            rows={reportRows}
            pageSize={pageSize}
            totals={totals}
            onPageSizeChange={setPageSize}
          />
        </div>
      </main>
    </div>
  );
}
