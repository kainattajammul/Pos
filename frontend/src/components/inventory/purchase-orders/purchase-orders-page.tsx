"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RepairsTopNav } from "@/components/repairs/repairs-top-nav";
import { PurchaseOrderDateTabs } from "@/components/inventory/purchase-orders/purchase-order-date-tabs";
import { PurchaseOrderFilters } from "@/components/inventory/purchase-orders/purchase-order-filters";
import { PurchaseOrderPageToolbar } from "@/components/inventory/purchase-orders/purchase-order-page-toolbar";
import { PurchaseOrderSummary } from "@/components/inventory/purchase-orders/purchase-order-summary";
import { PurchaseOrderTable } from "@/components/inventory/purchase-orders/purchase-order-table";
import {
  computePurchaseOrderSummary,
  DEFAULT_PURCHASE_ORDER_FILTERS,
  matchesPurchaseOrderDateTab,
  matchesPurchaseOrderFilters,
  type PurchaseOrderDateTab,
  type PurchaseOrderFiltersState,
} from "@/components/inventory/purchase-orders/purchase-order-types";
import { APP_CONFIG } from "@/constants/config";
import { usePurchaseOrders } from "@/hooks/use-purchase-orders";
import { exportPurchaseOrdersCsv } from "@/services/purchase-order.service";

const FILTER_STORAGE_KEY = "purchase-order-saved-filter";

export function PurchaseOrdersPage() {
  const router = useRouter();
  const shopId = APP_CONFIG.defaultShopId;
  const { data: orders = [], isLoading } = usePurchaseOrders(shopId);

  const [filtersPinned, setFiltersPinned] = useState(true);
  const [draftFilters, setDraftFilters] = useState<PurchaseOrderFiltersState>(
    DEFAULT_PURCHASE_ORDER_FILTERS,
  );
  const [appliedFilters, setAppliedFilters] = useState<PurchaseOrderFiltersState>(
    DEFAULT_PURCHASE_ORDER_FILTERS,
  );
  const [activeDateTab, setActiveDateTab] = useState<PurchaseOrderDateTab>("Today");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filteredRows = useMemo(() => {
    return orders.filter((row) => {
      const rowDate = new Date(row.date);
      if (!matchesPurchaseOrderDateTab(rowDate, activeDateTab)) return false;
      return matchesPurchaseOrderFilters(row, appliedFilters);
    });
  }, [activeDateTab, appliedFilters, orders]);

  const summary = useMemo(
    () => computePurchaseOrderSummary(filteredRows),
    [filteredRows],
  );

  const handleSearch = () => {
    setAppliedFilters(draftFilters);
    toast.success("Filters applied");
  };

  const handleReset = () => {
    setDraftFilters(DEFAULT_PURCHASE_ORDER_FILTERS);
    setAppliedFilters(DEFAULT_PURCHASE_ORDER_FILTERS);
    setActiveDateTab("Today");
  };

  const handleSaveFilter = () => {
    try {
      localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(draftFilters));
      toast.success("Filter saved");
    } catch {
      toast.error("Could not save filter");
    }
  };

  const handleCloseFilters = () => {
    setFiltersPinned(false);
  };

  const handleNewFilter = () => {
    setFiltersPinned(true);
    setDraftFilters(DEFAULT_PURCHASE_ORDER_FILTERS);
  };

  const handleExport = () => {
    exportPurchaseOrdersCsv(filteredRows);
    toast.success("Export started");
  };

  return (
    <div className="repairs-pos-theme flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-pos-page">
      <RepairsTopNav />
      <main className="flex-1 overflow-auto">
        <div className="mx-auto w-full max-w-[1600px] space-y-4 p-4 md:p-5">
          <header className="space-y-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <h1 className="text-xl font-semibold text-[#111827] md:text-[22px]">
                Manage Purchase Orders
              </h1>
              <PurchaseOrderPageToolbar
                filtersPinned={filtersPinned}
                onToggleFilters={handleNewFilter}
                onCloseFilters={handleCloseFilters}
                onExport={handleExport}
              />
            </div>
            <PurchaseOrderSummary
              totalValue={summary.totalValue}
              amountPayable={summary.amountPayable}
            />
          </header>

          <PurchaseOrderFilters
            value={draftFilters}
            pinned={filtersPinned}
            onChange={setDraftFilters}
            onPinnedChange={setFiltersPinned}
            onReset={handleReset}
            onSave={handleSaveFilter}
            onSearch={handleSearch}
          />

          <PurchaseOrderDateTabs
            activeTab={activeDateTab}
            onTabChange={setActiveDateTab}
          />

          {isLoading ? (
            <div className="rounded-sm border border-[#E5E7EB] bg-white px-4 py-12 text-center text-sm text-[#6B7280]">
              Loading purchase orders…
            </div>
          ) : (
            <PurchaseOrderTable
              rows={filteredRows}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              onView={(row) => toast.message(`View ${row.orderId}`)}
              onEdit={(row) => router.push(`/purchases/new?edit=${row.id}`)}
              onDelete={(row) => toast.message(`Delete ${row.orderId}`)}
              onMarkPaid={(row) => toast.success(`Marked ${row.orderId} as paid`)}
              onTrack={(row) =>
                toast.message(`Track ${row.orderId}`, {
                  description: row.trackingId || "No tracking ID",
                })
              }
            />
          )}
        </div>
      </main>
    </div>
  );
}
