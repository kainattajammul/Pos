"use client";

import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type FilterFn,
} from "@tanstack/react-table";
import { AlertCircle, Filter, Plus, RefreshCw, Search, Shield } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { createRoleManagementColumns } from "@/components/roles/columns";
import { DeleteUserDialog } from "@/components/users/delete-user-dialog";
import { RoleFormDialog } from "@/components/roles/role-form-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCreateRole, useDeleteRole, useRoles, useUpdateRole } from "@/hooks/use-roles";
import { getApiErrorMessage } from "@/lib/axios";
import { cn } from "@/lib/utils";
import type { RoleTableRow } from "@/types/role-table";

const globalRoleFilter: FilterFn<RoleTableRow> = (row, _columnId, filterValue) => {
  const q = String(filterValue ?? "").toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  const haystack = [
    String(r.id),
    r.roleName,
    r.shopId != null ? String(r.shopId) : "",
    r.description ?? "",
    r.status,
    r.createdAt,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
};

type StatusFilter = "all" | "active" | "inactive";

export function RolesManagementView() {
  const [mounted, setMounted] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [formRole, setFormRole] = useState<RoleTableRow | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<RoleTableRow | null>(null);

  const { data: roles = [], isLoading, isError, error, refetch, isFetching } = useRoles();
  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();
  const deleteMutation = useDeleteRole();

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredRows = useMemo(() => {
    if (statusFilter === "all") return roles;
    return roles.filter((row) => row.status.toLowerCase() === statusFilter);
  }, [roles, statusFilter]);

  const onEdit = useCallback((role: RoleTableRow) => {
    setFormMode("edit");
    setFormRole(role);
    setFormOpen(true);
  }, []);

  const onDelete = useCallback((role: RoleTableRow) => {
    setDeleteTarget(role);
  }, []);

  const columns = useMemo(
    () => createRoleManagementColumns({ onEdit, onDelete }),
    [onEdit, onDelete],
  );

  const table = useReactTable({
    data: filteredRows,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: globalRoleFilter,
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
    setFormMode("add");
    setFormRole(null);
    setFormOpen(true);
  };

  const handleFormSave = (values: {
    roleName: string;
    shopId: number | null;
    description: string | null;
    status: string;
  }) => {
    if (formMode === "add") {
      if (values.shopId == null) return;
      createMutation.mutate(
        { shopId: values.shopId, name: values.roleName.trim() },
        { onSuccess: () => setFormOpen(false) },
      );
      return;
    }

    if (!formRole) return;

    const payload: { name: string; shopId?: number } = {
      name: values.roleName.trim(),
    };
    if (values.shopId != null) {
      payload.shopId = values.shopId;
    }

    updateMutation.mutate(
      { id: formRole.id, payload },
      { onSuccess: () => setFormOpen(false) },
    );
  };

  const isFormSubmitting = createMutation.isPending || updateMutation.isPending;

  if (!mounted) return null;

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 md:text-3xl">
            Roles
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
              placeholder="Search roles..."
              className="h-10 border-neutral-200 bg-white pl-10 pr-3 text-sm shadow-sm placeholder:text-neutral-400"
              aria-label="Search roles"
              disabled={isLoading}
            />
          </div>

          <div className="flex shrink-0 items-center justify-end gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    className="size-10 border-neutral-200 bg-white text-neutral-600 shadow-sm hover:bg-neutral-50"
                    aria-label="Filter by status"
                  />
                }
              >
                <Filter className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setStatusFilter("all");
                    table.setPageIndex(0);
                  }}
                >
                  All statuses
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setStatusFilter("active");
                    table.setPageIndex(0);
                  }}
                >
                  Active
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setStatusFilter("inactive");
                    table.setPageIndex(0);
                  }}
                >
                  Inactive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

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
              Add Role
            </Button>
          </div>
        </div>
      </header>

      {statusFilter !== "all" ? (
        <p className="text-xs text-neutral-500">
          Filter:{" "}
          <span className="font-medium capitalize text-neutral-700">{statusFilter}</span>
        </p>
      ) : null}

      {isLoading ? (
        <div className="space-y-3 rounded-xl border border-neutral-200/90 bg-white p-4 shadow-sm">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={AlertCircle}
          title="Could not load roles"
          description={getApiErrorMessage(error, "Failed to fetch roles")}
          actionLabel="Try again"
          onAction={() => void refetch()}
        />
      ) : roles.length === 0 && !globalFilter ? (
        <EmptyState
          icon={Shield}
          title="No roles yet"
          description="Add your first role to get started."
          actionLabel="Add Role"
          onAction={openAdd}
        />
      ) : (
        <DataTable
          table={table}
          totalFilteredRows={table.getFilteredRowModel().rows.length}
          emptyMessage="No roles match your search."
        />
      )}

      <RoleFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        role={formRole}
        isSubmitting={isFormSubmitting}
        onSave={handleFormSave}
      />

      <DeleteUserDialog
        open={deleteTarget != null}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setDeleteTarget(null);
        }}
        entityType="role"
        itemLabel={
          deleteTarget
            ? `${deleteTarget.roleName}${
                deleteTarget.shopId != null ? ` (Shop ${deleteTarget.shopId})` : ""
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
