"use client";

import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type FilterFn,
} from "@tanstack/react-table";
import { AlertCircle, Filter, Plus, RefreshCw, Search, UserCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { createCustomerManagementColumns } from "@/components/customers/columns";
import { CustomerFormDialog } from "@/components/customers/customer-form-dialog";
import { DeleteUserDialog } from "@/components/users/delete-user-dialog";
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
import {
  useCreateCustomer,
  useCustomers,
  useDeleteCustomer,
  useUpdateCustomer,
} from "@/hooks/use-customers";
import { getApiErrorMessage } from "@/lib/axios";
import { cn } from "@/lib/utils";
import type { CustomerFormValues, CustomerTableRow } from "@/types/customer-table";

const globalCustomerFilter: FilterFn<CustomerTableRow> = (row, _columnId, filterValue) => {
  const q = String(filterValue ?? "").toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  const haystack = [
    String(r.id),
    r.displayName,
    r.firstName,
    r.lastName,
    r.email,
    r.phone ?? "",
    r.customerGroup,
    r.city ?? "",
    r.state ?? "",
    r.country,
    r.status,
    r.createdAt,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
};

type StatusFilter = "all" | "active" | "inactive";

export function CustomersManagementView() {
  const [mounted, setMounted] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [formCustomer, setFormCustomer] = useState<CustomerTableRow | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<CustomerTableRow | null>(null);

  const { data: customers = [], isLoading, isError, error, refetch, isFetching } =
    useCustomers();
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const deleteMutation = useDeleteCustomer();

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredRows = useMemo(() => {
    if (statusFilter === "all") return customers;
    return customers.filter((row) => row.status.toLowerCase() === statusFilter);
  }, [customers, statusFilter]);

  const onEdit = useCallback((customer: CustomerTableRow) => {
    setFormMode("edit");
    setFormCustomer(customer);
    setFormOpen(true);
  }, []);

  const onDelete = useCallback((customer: CustomerTableRow) => {
    setDeleteTarget(customer);
  }, []);

  const columns = useMemo(
    () => createCustomerManagementColumns({ onEdit, onDelete }),
    [onEdit, onDelete],
  );

  const table = useReactTable({
    data: filteredRows,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: globalCustomerFilter,
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
    setFormCustomer(null);
    setFormOpen(true);
  };

  const handleFormSave = (values: CustomerFormValues) => {
    if (formMode === "add") {
      createMutation.mutate(values, {
        onSuccess: () => setFormOpen(false),
      });
      return;
    }

    if (!formCustomer) return;
    updateMutation.mutate(
      { id: formCustomer.id, payload: values },
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
            Customers
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
              placeholder="Search customers..."
              className="h-10 border-neutral-200 bg-white pl-10 pr-3 text-sm shadow-sm placeholder:text-neutral-400"
              aria-label="Search customers"
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
              Add Customer
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
          title="Could not load customers"
          description={getApiErrorMessage(error, "Failed to fetch customers")}
          actionLabel="Try again"
          onAction={() => void refetch()}
        />
      ) : customers.length === 0 && !globalFilter ? (
        <EmptyState
          icon={UserCircle}
          title="No customers yet"
          description="Add your first customer to get started."
          actionLabel="Add Customer"
          onAction={openAdd}
        />
      ) : (
        <DataTable
          table={table}
          totalFilteredRows={table.getFilteredRowModel().rows.length}
          emptyMessage="No customers match your search."
        />
      )}

      <CustomerFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        customer={formCustomer}
        isSubmitting={isFormSubmitting}
        onSave={handleFormSave}
      />

      <DeleteUserDialog
        open={deleteTarget != null}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setDeleteTarget(null);
        }}
        entityType="customer"
        itemLabel={
          deleteTarget
            ? `${deleteTarget.displayName}${
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
