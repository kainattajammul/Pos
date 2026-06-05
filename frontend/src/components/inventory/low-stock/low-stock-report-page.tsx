"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { RepairsTopNav } from "@/components/repairs/repairs-top-nav";
import { LowStockReportFiltersBar } from "@/components/inventory/low-stock/low-stock-report-filters";
import { LowStockReportHeaderActions } from "@/components/inventory/low-stock/low-stock-report-header-actions";
import { LowStockReportTable } from "@/components/inventory/low-stock/low-stock-report-table";
import {
  DEFAULT_LOW_STOCK_FILTERS,
  buildLowStockReport,
  getLowStockSourceProducts,
  type LowStockReportFilters,
} from "@/components/inventory/low-stock/low-stock-report-types";
import { APP_CONFIG } from "@/constants/config";

export function LowStockReportPage() {
  const router = useRouter();
  const storeName = APP_CONFIG.appName;

  const [draftFilters, setDraftFilters] = useState<LowStockReportFilters>({
    ...DEFAULT_LOW_STOCK_FILTERS,
    store: storeName,
  });
  const [appliedFilters, setAppliedFilters] = useState<LowStockReportFilters | null>(
    null,
  );
  const [pageSize, setPageSize] = useState(50);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const reportRows = useMemo(() => {
    if (!appliedFilters) return [];
    return buildLowStockReport(
      getLowStockSourceProducts(),
      appliedFilters,
      storeName,
    );
  }, [appliedFilters, storeName]);

  const handleRunReport = () => {
    if (!draftFilters.criteria) {
      toast.error("Please select a criteria before running the report.");
      return;
    }
    setAppliedFilters({ ...draftFilters, store: draftFilters.store || storeName });
    setSelectedIds(new Set());
  };

  const handleReset = () => {
    setDraftFilters({ ...DEFAULT_LOW_STOCK_FILTERS, store: storeName });
    setAppliedFilters(null);
    setSelectedIds(new Set());
  };

  const handleToggleRow = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleToggleAll = (checked: boolean) => {
    if (!checked) {
      setSelectedIds(new Set());
      return;
    }
    const visible = reportRows.slice(0, pageSize).map((r) => r.id);
    setSelectedIds(new Set(visible));
  };

  const handleAddToPurchaseOrder = () => {
    if (selectedIds.size === 0) {
      toast.error("Select at least one item to add to a purchase order.");
      return;
    }
    const ids = Array.from(selectedIds).join(",");
    toast.success(`${selectedIds.size} item(s) ready for purchase order`);
    router.push(`/purchases/new?lowStockIds=${encodeURIComponent(ids)}`);
  };

  return (
    <div className="repairs-pos-theme flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[#F8FAFC]">
      <RepairsTopNav />
      <main className="flex-1 overflow-auto">
        <div className="mx-auto w-full max-w-[1600px] space-y-4 p-4 md:p-5">
          <nav className="text-sm text-[#6B7280]" aria-label="Breadcrumb">
            <Link
              href="/dashboard"
              className="font-medium text-[#31A5A6] transition-colors hover:text-[#227E7F] hover:underline"
            >
              Home
            </Link>
            <span className="mx-1.5 text-[#9CA3AF]">/</span>
            <Link
              href="/inventory/products"
              className="font-medium text-[#31A5A6] transition-colors hover:text-[#227E7F] hover:underline"
            >
              Inventory
            </Link>
            <span className="mx-1.5 text-[#9CA3AF]">/</span>
            <span className="font-medium text-[#374151]">Low Stock Report</span>
          </nav>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-2">
              <h1 className="text-xl font-semibold text-[#111827] md:text-2xl">
                {storeName} Low Stock Report
              </h1>
              <button
                type="button"
                className="rounded-sm p-1 text-[#D1D5DB] hover:text-[#F59E0B]"
                aria-label="Add to favorites (coming soon)"
                onClick={() => toast.message("Favorites — coming soon")}
              >
                <Star className="size-5" />
              </button>
            </div>
            <LowStockReportHeaderActions />
          </div>

          <LowStockReportFiltersBar
            value={draftFilters}
            defaultStoreName={storeName}
            onChange={setDraftFilters}
            onRunReport={handleRunReport}
            onReset={handleReset}
          />

          <LowStockReportTable
            rows={reportRows}
            pageSize={pageSize}
            selectedIds={selectedIds}
            onPageSizeChange={setPageSize}
            onToggleRow={handleToggleRow}
            onToggleAll={handleToggleAll}
            onAddToPurchaseOrder={handleAddToPurchaseOrder}
          />
        </div>
      </main>
    </div>
  );
}
