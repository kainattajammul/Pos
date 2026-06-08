"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { UnlockingServicesHeaderActions } from "@/components/inventory/manage-services/unlocking-services-header-actions";
import { UnlockingServicesSearchFilter } from "@/components/inventory/manage-services/unlocking-services-search-filter";
import { UnlockingServicesTable } from "@/components/inventory/manage-services/unlocking-services-table";
import {
  cloneUnlockingProductById,
  deleteUnlockingProductById,
  loadUnlockingServices,
  patchUnlockingServiceListFields,
} from "@/components/inventory/manage-services/unlocking-products-store";
import {
  DEFAULT_UNLOCKING_FILTERS,
  filterUnlockingServices,
  type UnlockingService,
} from "@/components/inventory/manage-services/unlocking-services-types";
import { RepairsTopNav } from "@/components/repairs/repairs-top-nav";

export function UnlockingServicesPage() {
  const router = useRouter();
  const [rows, setRows] = useState<UnlockingService[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState(DEFAULT_UNLOCKING_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_UNLOCKING_FILTERS);
  const [pageSize, setPageSize] = useState(25);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setRows(loadUnlockingServices());
  }, []);

  const filteredRows = useMemo(
    () => filterUnlockingServices(rows, appliedFilters),
    [appliedFilters, rows],
  );

  const handleRemoveFromStore = (row: UnlockingService) => {
    deleteUnlockingProductById(row.id);
    setRows(loadUnlockingServices());
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(row.id);
      return next;
    });
    toast.success("Removed from store", { description: row.name });
  };

  const handleClone = (row: UnlockingService) => {
    const clone = cloneUnlockingProductById(row.id);
    if (!clone) {
      toast.error("Could not clone product");
      return;
    }
    setRows(loadUnlockingServices());
    toast.success("Unlocking product cloned", { description: clone.name });
  };

  const handleBulkDelete = () => {
    for (const id of selectedIds) {
      deleteUnlockingProductById(id);
    }
    setRows(loadUnlockingServices());
    toast.success(`Deleted ${selectedIds.size} item(s)`);
    setSelectedIds(new Set());
  };

  const toggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = (ids: string[]) => {
    setSelectedIds((prev) => {
      const allSelected = ids.length > 0 && ids.every((id) => prev.has(id));
      if (allSelected) return new Set();
      return new Set(ids);
    });
  };

  const updateRowField = (id: string, patch: Partial<UnlockingService>) => {
    patchUnlockingServiceListFields(id, patch);
    setRows(loadUnlockingServices());
  };

  return (
    <div className="repairs-pos-theme flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <RepairsTopNav />
      <main className="flex-1 overflow-auto">
        <div className="mx-auto w-full max-w-[1600px] space-y-4 p-4 md:p-5">
          <nav className="pos-breadcrumb" aria-label="Breadcrumb">
            <Link href="/dashboard">Home</Link>
            <span className="mx-1.5 text-pos-subtle">/</span>
            <span className="font-medium text-pos-secondary">Unlocking</span>
          </nav>

          <UnlockingServicesHeaderActions
            filterOpen={filterOpen}
            onToggleFilter={() => setFilterOpen((v) => !v)}
            onAddProduct={() => router.push("/inventory/services/unlocking/new")}
            selectedCount={selectedIds.size}
            onBulkDelete={handleBulkDelete}
            onBulkUpdate={() => toast.message("Bulk update — connect when ready")}
            onExportSelected={() =>
              toast.message(`Export ${selectedIds.size} selected item(s)`)
            }
          />

          {filterOpen ? (
            <UnlockingServicesSearchFilter
              value={draftFilters}
              onChange={setDraftFilters}
              onSearch={() => setAppliedFilters(draftFilters)}
              onReset={() => {
                setDraftFilters(DEFAULT_UNLOCKING_FILTERS);
                setAppliedFilters(DEFAULT_UNLOCKING_FILTERS);
              }}
            />
          ) : null}

          <UnlockingServicesTable
            rows={filteredRows}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            selectedIds={selectedIds}
            onToggleRow={toggleRow}
            onToggleAll={toggleAll}
            onUpdate={(row) => router.push(`/inventory/services/unlocking/${row.id}`)}
            onClone={handleClone}
            onRemoveFromStore={handleRemoveFromStore}
            onNameClick={(row) => router.push(`/inventory/services/unlocking/${row.id}`)}
            onPriceChange={(id, price) => updateRowField(id, { price })}
            onCostChange={(id, cost) => updateRowField(id, { cost })}
          />
        </div>
      </main>
    </div>
  );
}
