"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { RepairsTopNav } from "@/components/repairs/repairs-top-nav";
import { RefurbishmentBatchImeiEntry } from "@/components/inventory/refurbishment-batch/refurbishment-batch-imei-entry";
import { RefurbishmentBatchInfoForm } from "@/components/inventory/refurbishment-batch/refurbishment-batch-info-form";
import { RefurbishmentBatchListTable } from "@/components/inventory/refurbishment-batch/refurbishment-batch-list-table";
import {
  buildBatchName,
  createEmptyLineItem,
  DEFAULT_STORE_NAME,
  EMPLOYEE_OPTIONS,
  formatRefurbishmentDateTime,
  type RefurbishmentBatchFormState,
  type RefurbishmentBatchLineItem,
} from "@/components/inventory/refurbishment-batch/refurbishment-batch-create-types";
import { useAuth } from "@/hooks/use-auth";

function resolveDefaultEmployee(userName?: string): string {
  if (userName && EMPLOYEE_OPTIONS.includes(userName as (typeof EMPLOYEE_OPTIONS)[number])) {
    return userName;
  }
  if (userName) return userName;
  return EMPLOYEE_OPTIONS[0];
}

function buildInitialForm(userName?: string): RefurbishmentBatchFormState {
  const now = new Date();
  const store = DEFAULT_STORE_NAME;
  return {
    store,
    dateDisplay: formatRefurbishmentDateTime(now),
    batchName: buildBatchName(store, now),
    employee: resolveDefaultEmployee(userName),
  };
}

export function NewRefurbishmentBatchPage() {
  const { user } = useAuth();
  const [form, setForm] = useState<RefurbishmentBatchFormState>(() =>
    buildInitialForm(user?.name),
  );
  const [batchNameTouched, setBatchNameTouched] = useState(false);
  const [imeiInput, setImeiInput] = useState("");
  const [lineItems, setLineItems] = useState<RefurbishmentBatchLineItem[]>([]);

  const handleFormChange = (next: RefurbishmentBatchFormState) => {
    if (next.batchName !== form.batchName) {
      setBatchNameTouched(true);
    }
    if (
      !batchNameTouched &&
      next.batchName === form.batchName &&
      (next.store !== form.store || next.dateDisplay !== form.dateDisplay)
    ) {
      setForm({
        ...next,
        batchName: buildBatchName(next.store, new Date()),
      });
      return;
    }
    setForm(next);
  };

  const handleAddImei = () => {
    const trimmed = imeiInput.trim();
    if (!trimmed) {
      toast.error("Enter an IMEI or Serial number");
      return;
    }
    const duplicate = lineItems.some(
      (item) => item.imeiSerial.toLowerCase() === trimmed.toLowerCase(),
    );
    if (duplicate) {
      toast.error("This IMEI/Serial is already in the batch");
      return;
    }
    setLineItems((prev) => [...prev, createEmptyLineItem(trimmed)]);
    setImeiInput("");
    toast.success("Item added to batch");
  };

  const handleUpdateRow = (id: string, patch: Partial<RefurbishmentBatchLineItem>) => {
    setLineItems((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  };

  const handleRemoveRow = (row: RefurbishmentBatchLineItem) => {
    setLineItems((prev) => prev.filter((item) => item.id !== row.id));
    toast.message(`Removed ${row.imeiSerial}`);
  };

  const handleViewRow = (row: RefurbishmentBatchLineItem) => {
    toast.message(`View: ${row.imeiSerial}`, {
      description: row.diagnosticNotes || "No diagnostic notes",
    });
  };

  const handleEditRow = (row: RefurbishmentBatchLineItem) => {
    setImeiInput(row.imeiSerial);
    handleRemoveRow(row);
    toast.message("Update IMEI above and click Add to re-add");
  };

  return (
    <div className="repairs-pos-theme flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-pos-page">
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
              href="/inventory/refurbishment"
              className="font-medium text-[#31A5A6] transition-colors hover:text-[#227E7F] hover:underline"
            >
              Manage Refurbishment
            </Link>
            <span className="mx-1.5 text-[#9CA3AF]">/</span>
            <span className="font-medium text-[#374151]">Refurbishment Batch</span>
          </nav>

          <h1 className="text-2xl font-semibold tracking-tight text-[#111827] md:text-[26px]">
            Refurbishment Batch
          </h1>

          <RefurbishmentBatchInfoForm value={form} onChange={handleFormChange} />

          <RefurbishmentBatchImeiEntry
            value={imeiInput}
            onChange={setImeiInput}
            onAdd={handleAddImei}
          />

          <RefurbishmentBatchListTable
            rows={lineItems}
            onUpdateRow={handleUpdateRow}
            onView={handleViewRow}
            onEdit={handleEditRow}
            onRemove={handleRemoveRow}
          />
        </div>
      </main>
    </div>
  );
}
