"use client";

import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type FilterFn,
} from "@tanstack/react-table";
import { AlertCircle, HandCoins, Plus, RefreshCw, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { createSalesCommissionAgentColumns } from "@/components/sales-commission-agents/columns";
import { DeleteSalesCommissionAgentDialog } from "@/components/sales-commission-agents/delete-sales-commission-agent-dialog";
import { SalesCommissionAgentFormDialog } from "@/components/sales-commission-agents/sales-commission-agent-form-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCreateSalesCommissionAgent,
  useDeleteSalesCommissionAgent,
  useSalesCommissionAgent,
  useSalesCommissionAgents,
  useUpdateSalesCommissionAgent,
} from "@/hooks/use-sales-commission-agents";
import { getApiErrorMessage } from "@/lib/axios";
import { cn } from "@/lib/utils";
import type { SalesCommissionAgentTableRow } from "@/types/sales-commission-agent";

const globalAgentFilter: FilterFn<SalesCommissionAgentTableRow> = (
  row,
  _columnId,
  filterValue,
) => {
  const q = String(filterValue ?? "").toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  const haystack = [
    String(r.id),
    r.name,
    r.lastName ?? "",
    r.email ?? "",
    r.contactNumber ?? "",
    r.address ?? "",
    r.salesCommissionPercent != null ? String(r.salesCommissionPercent) : "",
    r.createdAt,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
};

type FormMode = "add" | "edit" | null;

export function SalesCommissionAgentsManagementView() {
  const [mounted, setMounted] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [editTarget, setEditTarget] = useState<SalesCommissionAgentTableRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SalesCommissionAgentTableRow | null>(null);

  const { data: agents = [], isLoading, isError, error, refetch, isFetching } =
    useSalesCommissionAgents();
  const createMutation = useCreateSalesCommissionAgent();
  const updateMutation = useUpdateSalesCommissionAgent();
  const deleteMutation = useDeleteSalesCommissionAgent();

  const editId = formMode === "edit" && editTarget ? editTarget.id : 0;
  const { data: editAgent, isFetching: editAgentFetching } = useSalesCommissionAgent(editId);

  useEffect(() => {
    setMounted(true);
  }, []);

  const onEdit = useCallback((agent: SalesCommissionAgentTableRow) => {
    setEditTarget(agent);
    setFormMode("edit");
  }, []);

  const onDelete = useCallback((agent: SalesCommissionAgentTableRow) => {
    setDeleteTarget(agent);
  }, []);

  const columns = useMemo(
    () => createSalesCommissionAgentColumns({ onEdit, onDelete }),
    [onEdit, onDelete],
  );

  const table = useReactTable({
    data: agents,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: globalAgentFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 10, pageIndex: 0 },
    },
  });

  const handleRefresh = () => {
    table.setPageIndex(0);
    void refetch();
  };

  const openAdd = () => {
    setEditTarget(null);
    setFormMode("add");
  };

  const closeForm = () => {
    if (createMutation.isPending || updateMutation.isPending) return;
    setFormMode(null);
    setEditTarget(null);
  };

  const formOpen = formMode != null;
  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const agentForForm =
    formMode === "edit" ? (editAgent ?? editTarget) : null;

  if (!mounted) return null;

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 md:text-3xl">
            Sales Commission Agents
          </h1>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end lg:max-w-2xl lg:shrink-0">
          <div className="relative min-w-0 flex-1 sm:min-w-[220px] sm:max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400" />
            <Input
              value={globalFilter}
              onChange={(e) => {
                setGlobalFilter(e.target.value);
                table.setPageIndex(0);
              }}
              placeholder="Search sales commission agents…"
              className="h-10 border-neutral-200 bg-white pl-10 pr-3 text-sm shadow-sm placeholder:text-neutral-400"
              aria-label="Search sales commission agents"
              disabled={isLoading}
            />
          </div>

          <div className="flex shrink-0 items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="size-10 border-neutral-200 bg-white text-neutral-600 shadow-sm hover:bg-neutral-50"
              aria-label="Refresh table"
              onClick={handleRefresh}
              disabled={isFetching}
            >
              <RefreshCw className={cn("size-4", isFetching && "animate-spin")} />
            </Button>

            <Button
              type="button"
              onClick={openAdd}
              className="h-10 gap-2 border-0 bg-primary px-4 font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
              disabled={isLoading}
            >
              <Plus className="size-4" />
              Add
            </Button>
          </div>
        </div>
      </header>

      {isLoading ? (
        <div className="space-y-3 rounded-xl border border-neutral-200/90 bg-white p-4 shadow-sm">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={AlertCircle}
          title="Could not load sales commission agents"
          description={getApiErrorMessage(
            error,
            "Failed to fetch sales commission agents",
          )}
          actionLabel="Try again"
          onAction={() => void refetch()}
        />
      ) : agents.length === 0 && !globalFilter ? (
        <EmptyState
          icon={HandCoins}
          title="No sales commission agents yet"
          description="Add your first sales commission agent to get started."
          actionLabel="Add"
          onAction={openAdd}
        />
      ) : (
        <DataTable
          table={table}
          totalFilteredRows={table.getFilteredRowModel().rows.length}
          emptyMessage="No sales commission agents match your search."
        />
      )}

      <SalesCommissionAgentFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          if (!open) closeForm();
        }}
        mode={formMode === "edit" ? "edit" : "add"}
        agent={agentForForm}
        isSubmitting={isSubmitting || (formMode === "edit" && editAgentFetching && !editAgent)}
        onSave={(payload) => {
          if (formMode === "add") {
            createMutation.mutate(payload, { onSuccess: () => closeForm() });
            return;
          }
          if (!editTarget) return;
          updateMutation.mutate(
            { id: editTarget.id, payload },
            { onSuccess: () => closeForm() },
          );
        }}
      />

      <DeleteSalesCommissionAgentDialog
        open={deleteTarget != null}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setDeleteTarget(null);
        }}
        agentLabel={
          deleteTarget
            ? `${deleteTarget.name}${
                deleteTarget.email ? ` (${deleteTarget.email})` : ""
              }`
            : ""
        }
        isPending={deleteMutation.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteMutation.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(null),
          });
        }}
      />
    </div>
  );
}
