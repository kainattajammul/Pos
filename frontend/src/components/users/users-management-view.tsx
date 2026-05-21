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
import { useCallback, useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { createUserManagementColumns } from "@/components/users/columns";
import { DeleteUserDialog } from "@/components/users/delete-user-dialog";
import { UserFormDialog } from "@/components/users/user-form-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCreateUser,
  useDeleteUser,
  useUpdateUser,
  useUsers,
} from "@/hooks/use-users";
import { getApiErrorMessage } from "@/lib/axios";
import { cn } from "@/lib/utils";
import type { CreateUserPayload, UpdateUserPayload, UserTableRow } from "@/types/user-table";

const globalUserFilter: FilterFn<UserTableRow> = (row, _columnId, filterValue) => {
  const q = String(filterValue ?? "").toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  const haystack = [
    String(r.id),
    r.fullName,
    r.email,
    r.phone ?? "",
    r.createdAt,
    r.updatedAt,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
};

function mapStatusToApi(status: "active" | "inactive"): CreateUserPayload["status"] {
  return status === "inactive" ? "INACTIVE" : "ACTIVE";
}

export function UsersManagementView() {
  const [mounted, setMounted] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [formUser, setFormUser] = useState<UserTableRow | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<UserTableRow | null>(null);

  const { data: users = [], isLoading, isError, error, refetch, isFetching } = useUsers();
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();

  useEffect(() => {
    setMounted(true);
  }, []);

  const onEdit = useCallback((user: UserTableRow) => {
    setFormMode("edit");
    setFormUser(user);
    setFormOpen(true);
  }, []);

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
    setFormMode("add");
    setFormUser(null);
    setFormOpen(true);
  };

  const handleFormSave = (values: {
    fullName: string;
    email: string;
    password?: string;
    phone: string | null;
    roleId: number | null;
    shopId: number | null;
    status: string;
  }) => {
    if (formMode === "add") {
      if (!values.password || values.shopId == null) return;
      const payload: CreateUserPayload = {
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        phone: values.phone,
        shopId: values.shopId,
        roleId: values.roleId,
        status: mapStatusToApi(values.status as "active" | "inactive"),
      };
      createMutation.mutate(payload, {
        onSuccess: () => setFormOpen(false),
      });
      return;
    }

    if (!formUser) return;
    const payload: UpdateUserPayload = {
      fullName: values.fullName,
      email: values.email,
      phone: values.phone,
    };
    if (values.password) {
      payload.password = values.password;
    }
    updateMutation.mutate(
      { id: formUser.id, payload },
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
              className="h-10 gap-2 border-0 bg-orange-500 px-4 font-semibold text-white shadow-sm hover:bg-orange-600 hover:text-white"
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

      <UserFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        user={formUser}
        isSubmitting={isFormSubmitting}
        onSave={handleFormSave}
      />

      <DeleteUserDialog
        open={deleteTarget != null}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setDeleteTarget(null);
        }}
        userLabel={
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
