"use client";

import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type FilterFn,
} from "@tanstack/react-table";
import { AlertCircle, Plus, RefreshCw, Search, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { createUserManagementColumns } from "@/components/users/columns";
import { DeleteUserDialog } from "@/components/users/delete-user-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeleteUser, useUsers } from "@/hooks/use-users";
import { getApiErrorMessage } from "@/lib/axios";
import { cn } from "@/lib/utils";
import type { UserTableRow } from "@/types/user-table";

const globalUserFilter: FilterFn<UserTableRow> = (row, _columnId, filterValue) => {
  const q = String(filterValue ?? "").toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  const haystack = [
    String(r.id),
    r.fullName,
    r.email,
    r.phone ?? "",
    r.accessPin ?? "",
    r.createdAt,
    r.updatedAt,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
};

export function UsersManagementView() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<UserTableRow | null>(null);

  const { data: users = [], isLoading, isError, error, refetch, isFetching } = useUsers();
  const deleteMutation = useDeleteUser();

  useEffect(() => {
    setMounted(true);
  }, []);

  const onEdit = useCallback(
    (user: UserTableRow) => {
      router.push(`/users/${user.id}/edit`);
    },
    [router],
  );

  const onDelete = useCallback((user: UserTableRow) => {
    setDeleteTarget(user);
  }, []);

  const columns = useMemo(
    () => createUserManagementColumns({ onEdit, onDelete }),
    [onEdit, onDelete],
  );

  const table = useReactTable({
    data: users,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: globalUserFilter,
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
    router.push("/users/create");
  };

  if (!mounted) return null;

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 md:text-3xl">
            Users
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
              placeholder="Search users..."
              className="h-10 border-neutral-200 bg-white pl-10 pr-3 text-sm shadow-sm placeholder:text-neutral-400"
              aria-label="Search users"
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
              Add User
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
          title="Could not load users"
          description={getApiErrorMessage(error, "Failed to fetch users")}
          actionLabel="Try again"
          onAction={() => void refetch()}
        />
      ) : users.length === 0 && !globalFilter ? (
        <EmptyState
          icon={Users}
          title="No users yet"
          description="Add your first user to get started."
          actionLabel="Add User"
          onAction={openAdd}
        />
      ) : (
        <DataTable
          table={table}
          totalFilteredRows={table.getFilteredRowModel().rows.length}
          emptyMessage="No users match your search."
        />
      )}

      <DeleteUserDialog
        open={deleteTarget != null}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setDeleteTarget(null);
        }}
        itemLabel={
          deleteTarget ? `${deleteTarget.fullName} (${deleteTarget.email})` : ""
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
