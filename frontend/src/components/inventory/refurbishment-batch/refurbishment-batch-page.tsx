"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { RepairsTopNav } from "@/components/repairs/repairs-top-nav";
import { RefurbishmentBatchCriteriaCard } from "@/components/inventory/refurbishment-batch/refurbishment-batch-criteria-card";
import { RefurbishmentBatchPageHeader } from "@/components/inventory/refurbishment-batch/refurbishment-batch-page-header";
import { RefurbishmentBatchTable } from "@/components/inventory/refurbishment-batch/refurbishment-batch-table";
import {
  DEFAULT_REFURBISHMENT_FILTERS,
  matchesRefurbishmentFilters,
  type RefurbishmentBatchFiltersState,
  type RefurbishmentBatchRecord,
} from "@/components/inventory/refurbishment-batch/refurbishment-batch-types";
import { APP_CONFIG } from "@/constants/config";
import { queryKeys } from "@/constants/query-keys";
import { useRefurbishmentBatches } from "@/hooks/use-refurbishment-batches";

export function RefurbishmentBatchPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const shopId = APP_CONFIG.defaultShopId;

  const { data: batches = [], isLoading, isFetching, refetch } =
    useRefurbishmentBatches(shopId);

  const [draftFilters, setDraftFilters] = useState<RefurbishmentBatchFiltersState>(
    DEFAULT_REFURBISHMENT_FILTERS,
  );
  const [appliedFilters, setAppliedFilters] = useState<RefurbishmentBatchFiltersState>(
    DEFAULT_REFURBISHMENT_FILTERS,
  );
  const [pageSize, setPageSize] = useState(50);

  const filteredRows = useMemo(
    () => batches.filter((row) => matchesRefurbishmentFilters(row, appliedFilters)),
    [appliedFilters, batches],
  );

  const handleRunReport = () => {
    setAppliedFilters(draftFilters);
    toast.success("Report generated");
  };

  const handleRefresh = async () => {
    setDraftFilters(DEFAULT_REFURBISHMENT_FILTERS);
    setAppliedFilters(DEFAULT_REFURBISHMENT_FILTERS);
    await queryClient.invalidateQueries({
      queryKey: queryKeys.refurbishmentBatches.list(shopId),
    });
    await refetch();
    toast.message("Report data refreshed");
  };

  const handleView = (row: RefurbishmentBatchRecord) => {
    toast.message(`View batch ${row.batchId}`);
  };

  const handleEdit = (row: RefurbishmentBatchRecord) => {
    router.push(`/inventory/refurbishment/new?edit=${row.id}`);
  };

  const handleDelete = (row: RefurbishmentBatchRecord) => {
    toast.message(`Delete ${row.batchId} — connect API when ready`);
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
            <span className="font-medium text-[#374151]">Manage Refurbishment</span>
          </nav>

          <RefurbishmentBatchPageHeader />

          <RefurbishmentBatchCriteriaCard
            value={draftFilters}
            onChange={setDraftFilters}
            onRunReport={handleRunReport}
            onRefresh={handleRefresh}
            isRefreshing={isFetching}
          />

          {isLoading ? (
            <div className="rounded-sm border border-[#E5E7EB] bg-white px-4 py-8 text-center text-sm text-[#6B7280]">
              Loading refurbishment batches…
            </div>
          ) : (
            <RefurbishmentBatchTable
              rows={filteredRows}
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>
      </main>
    </div>
  );
}
