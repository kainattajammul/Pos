"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { BillPaymentsHeaderActions } from "@/components/inventory/bill-payments/bill-payments-header-actions";
import { BillPaymentsSearchFilter } from "@/components/inventory/bill-payments/bill-payments-search-filter";
import { BillPaymentsTable } from "@/components/inventory/bill-payments/bill-payments-table";
import {
  DEFAULT_BILL_PAYMENT_FILTERS,
  formValuesToBillPayment,
  matchesBillPaymentFilters,
  type BillPaymentFormValues,
  type BillPaymentRecord,
} from "@/components/inventory/bill-payments/bill-payments-types";
import { RepairsTopNav } from "@/components/repairs/repairs-top-nav";
import { APP_CONFIG } from "@/constants/config";
import { useBillPayments } from "@/hooks/use-bill-payments";

const BillPaymentsFormDialog = dynamic(
  () =>
    import("@/components/inventory/bill-payments/bill-payments-form-dialog").then(
      (m) => m.BillPaymentsFormDialog,
    ),
  { ssr: false },
);

type FormMode = "add" | "edit" | null;

export function BillPaymentsPage() {
  const searchParams = useSearchParams();
  const shopId = APP_CONFIG.defaultShopId;
  const { data: apiRows = [], isLoading } = useBillPayments(shopId);

  const [rows, setRows] = useState<BillPaymentRecord[]>([]);

  const [filterOpen, setFilterOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState(DEFAULT_BILL_PAYMENT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_BILL_PAYMENT_FILTERS);
  const [pageSize, setPageSize] = useState(25);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [editTarget, setEditTarget] = useState<BillPaymentRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isLoading) setRows(apiRows);
  }, [apiRows, isLoading]);

  useEffect(() => {
    if (searchParams.get("add") === "1") {
      setEditTarget(null);
      setFormMode("add");
    }
  }, [searchParams]);

  const filteredRows = useMemo(
    () => rows.filter((row) => matchesBillPaymentFilters(row, appliedFilters)),
    [appliedFilters, rows],
  );

  const openAdd = () => {
    setEditTarget(null);
    setFormMode("add");
  };

  const openEdit = (row: BillPaymentRecord) => {
    setEditTarget(row);
    setFormMode("edit");
  };

  const closeForm = () => {
    if (isSaving) return;
    setFormMode(null);
    setEditTarget(null);
  };

  const handleSave = (values: BillPaymentFormValues) => {
    setIsSaving(true);
    setTimeout(() => {
      if (formMode === "add") {
        const created = formValuesToBillPayment(values);
        setRows((prev) => [created, ...prev]);
        toast.success("Bill payment item added", { description: created.planName });
      } else if (formMode === "edit" && editTarget) {
        const updated = formValuesToBillPayment(values, editTarget);
        setRows((prev) => prev.map((r) => (r.id === editTarget.id ? updated : r)));
        toast.success("Bill payment item updated", { description: updated.planName });
      }
      setIsSaving(false);
      closeForm();
    }, 300);
  };

  const handleDelete = (row: BillPaymentRecord) => {
    setRows((prev) => prev.filter((r) => r.id !== row.id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(row.id);
      return next;
    });
    toast.success("Bill payment item deleted", { description: row.planName });
  };

  const handleBulkDelete = () => {
    setRows((prev) => prev.filter((r) => !selectedIds.has(r.id)));
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
              Manage Inventory
            </Link>
            <span className="mx-1.5 text-[#9CA3AF]">/</span>
            <span className="font-medium text-[#374151]">Bill Payments</span>
          </nav>

          <BillPaymentsHeaderActions
            filterOpen={filterOpen}
            onToggleFilter={() => setFilterOpen((v) => !v)}
            onAddItem={openAdd}
            selectedCount={selectedIds.size}
            onBulkDelete={handleBulkDelete}
            onBulkUpdate={() => toast.message("Bulk update — connect when ready")}
            onExportSelected={() =>
              toast.message(`Export ${selectedIds.size} selected item(s)`)
            }
          />

          {filterOpen ? (
            <BillPaymentsSearchFilter
              value={draftFilters}
              onChange={setDraftFilters}
              onSearch={() => setAppliedFilters(draftFilters)}
              onReset={() => {
                setDraftFilters(DEFAULT_BILL_PAYMENT_FILTERS);
                setAppliedFilters(DEFAULT_BILL_PAYMENT_FILTERS);
              }}
            />
          ) : null}

          {isLoading ? (
            <div className="rounded-sm border border-[#E5E7EB] bg-white px-4 py-8 text-center text-sm text-[#6B7280]">
              Loading bill payments…
            </div>
          ) : (
            <BillPaymentsTable
              rows={filteredRows}
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
              selectedIds={selectedIds}
              onToggleRow={toggleRow}
              onToggleAll={toggleAll}
              onAddItem={openAdd}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          )}
        </div>
      </main>

      <BillPaymentsFormDialog
        open={formMode != null}
        onOpenChange={(open) => {
          if (!open) closeForm();
        }}
        mode={formMode === "edit" ? "edit" : "add"}
        initial={editTarget}
        isSubmitting={isSaving}
        onSave={handleSave}
      />
    </div>
  );
}
