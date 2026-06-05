"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { RepairsTopNav } from "@/components/repairs/repairs-top-nav";
import { InventoryCountHeaderActions } from "@/components/inventory/inventory-count/inventory-count-header-actions";
import { InventoryCountSearchFilter } from "@/components/inventory/inventory-count/inventory-count-search-filter";
import { InventoryCountTable } from "@/components/inventory/inventory-count/inventory-count-table";
import {
  DEFAULT_INVENTORY_COUNT_FILTERS,
  matchesInventoryCountFilters,
  type InventoryCountFiltersState,
  type InventoryCountRecord,
} from "@/components/inventory/inventory-count/inventory-count-types";
import { APP_CONFIG } from "@/constants/config";
import { useInventoryCounts } from "@/hooks/use-inventory-counts";

export function InventoryCountPage() {
  const router = useRouter();
  const shopId = APP_CONFIG.defaultShopId;
  const { data: counts = [], isLoading } = useInventoryCounts(shopId);

  const [filterOpen, setFilterOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState<InventoryCountFiltersState>(
    DEFAULT_INVENTORY_COUNT_FILTERS,
  );
  const [appliedFilters, setAppliedFilters] = useState<InventoryCountFiltersState>(
    DEFAULT_INVENTORY_COUNT_FILTERS,
  );
  const [pageSize, setPageSize] = useState(50);

  const filteredRows = useMemo(
    () => counts.filter((row) => matchesInventoryCountFilters(row, appliedFilters)),
    [appliedFilters, counts],
  );

  const handleSearch = () => {
    setAppliedFilters(draftFilters);
  };

  const handleReset = () => {
    setDraftFilters(DEFAULT_INVENTORY_COUNT_FILTERS);
    setAppliedFilters(DEFAULT_INVENTORY_COUNT_FILTERS);
  };

  const handleView = (row: InventoryCountRecord) => {
    toast.message(`View count ${row.countId}`);
  };

  const handleContinue = (row: InventoryCountRecord) => {
    toast.message(`Continue count ${row.countId}`);
  };

  const handleEdit = (row: InventoryCountRecord) => {
    router.push(`/inventory/count/new?edit=${row.id}`);
  };

  const handleDelete = (row: InventoryCountRecord) => {
    toast.message(`Delete ${row.countId} — connect API when ready`);
  };

  return (
    <div className="repairs-pos-theme flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-pos-page">
      <RepairsTopNav />
      <main className="flex-1 overflow-auto">
        <div className="mx-auto w-full max-w-[1600px] space-y-4 p-4 md:p-5">
          <nav
            className="text-sm text-[#6B7280]"
            aria-label="Breadcrumb"
          >
            <Link
              href="/dashboard"
              className="font-medium text-[#31A5A6] transition-colors hover:text-[#227E7F] hover:underline"
            >
              Home
            </Link>
            <span className="mx-1.5 text-[#9CA3AF]">/</span>
            <span className="font-medium text-[#374151]">Manage Inventory Count</span>
          </nav>

          <InventoryCountHeaderActions
            filterOpen={filterOpen}
            onToggleFilter={() => setFilterOpen((v) => !v)}
          />

          {filterOpen ? (
            <InventoryCountSearchFilter
              value={draftFilters}
              onChange={setDraftFilters}
              onSearch={handleSearch}
              onReset={handleReset}
            />
          ) : null}

          {isLoading ? (
            <div className="rounded-sm border border-[#E5E7EB] bg-white px-4 py-8 text-center text-sm text-[#6B7280]">
              Loading inventory counts…
            </div>
          ) : (
            <InventoryCountTable
              rows={filteredRows}
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
              onView={handleView}
              onContinue={handleContinue}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>
      </main>
    </div>
  );
}
