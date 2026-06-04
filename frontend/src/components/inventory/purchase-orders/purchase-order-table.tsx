"use client";

import { ArrowUpDown, Settings } from "lucide-react";
import { useState } from "react";
import { PurchaseOrderActionDropdown } from "@/components/inventory/purchase-orders/purchase-order-action-dropdown";
import type { PurchaseOrderRecord } from "@/components/inventory/purchase-orders/purchase-order-types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type SortKey = "orderId" | "createdBy" | null;

interface PurchaseOrderTableProps {
  rows: PurchaseOrderRecord[];
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  onView?: (row: PurchaseOrderRecord) => void;
  onEdit?: (row: PurchaseOrderRecord) => void;
  onDelete?: (row: PurchaseOrderRecord) => void;
  onMarkPaid?: (row: PurchaseOrderRecord) => void;
  onTrack?: (row: PurchaseOrderRecord) => void;
}

function SortableHead({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 text-xs font-semibold text-[#374151] hover:text-[#111827]"
    >
      {label}
      <ArrowUpDown className={`size-3.5 ${active ? "text-(--repair-primary)" : "text-[#9CA3AF]"}`} />
    </button>
  );
}

export function PurchaseOrderTable({
  rows,
  selectedIds,
  onSelectionChange,
  onView,
  onEdit,
  onDelete,
  onMarkPaid,
  onTrack,
}: PurchaseOrderTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortAsc, setSortAsc] = useState(true);

  const sortedRows = [...rows].sort((a, b) => {
    if (!sortKey) return 0;
    const av = sortKey === "orderId" ? a.orderId : a.createdBy;
    const bv = sortKey === "orderId" ? b.orderId : b.createdBy;
    const cmp = av.localeCompare(bv);
    return sortAsc ? cmp : -cmp;
  });

  const allSelected = rows.length > 0 && rows.every((r) => selectedIds.has(r.id));

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((v) => !v);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const toggleAll = () => {
    if (allSelected) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(rows.map((r) => r.id)));
    }
  };

  const toggleRow = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange(next);
  };

  return (
    <section className="overflow-hidden rounded-sm border border-[#E5E7EB] bg-white shadow-sm">
      <div className="flex items-center justify-end border-b border-[#E5E7EB] px-3 py-2">
        <button
          type="button"
          className="flex size-8 items-center justify-center rounded-sm text-(--repair-primary) transition-colors hover:bg-[#F4FBFB]"
          aria-label="Table settings"
        >
          <Settings className="size-4" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <Table className="min-w-[1100px]">
          <TableHeader className="bg-[#F3F4F6]">
            <TableRow className="border-b border-[#E5E7EB] hover:bg-[#F3F4F6]">
              <TableHead className="w-10 border-r border-[#E5E7EB] px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label="Select all purchase orders"
                />
              </TableHead>
              <TableHead className="min-w-[80px] border-r border-[#E5E7EB] px-3 py-2.5">
                <SortableHead
                  label="ID"
                  active={sortKey === "orderId"}
                  onClick={() => toggleSort("orderId")}
                />
              </TableHead>
              <TableHead className="min-w-[100px] border-r border-[#E5E7EB] px-3 py-2.5 text-xs font-semibold text-[#374151]">
                Date
              </TableHead>
              <TableHead className="min-w-[140px] border-r border-[#E5E7EB] px-3 py-2.5 text-xs font-semibold text-[#374151]">
                Product
              </TableHead>
              <TableHead className="min-w-[110px] border-r border-[#E5E7EB] px-3 py-2.5">
                <SortableHead
                  label="Created By"
                  active={sortKey === "createdBy"}
                  onClick={() => toggleSort("createdBy")}
                />
              </TableHead>
              <TableHead className="min-w-[100px] border-r border-[#E5E7EB] px-3 py-2.5 text-xs font-semibold text-[#374151]">
                Special Order
              </TableHead>
              <TableHead className="min-w-[110px] border-r border-[#E5E7EB] px-3 py-2.5 text-xs font-semibold text-[#374151]">
                Payment Status
              </TableHead>
              <TableHead className="min-w-[100px] border-r border-[#E5E7EB] px-3 py-2.5 text-xs font-semibold text-[#374151]">
                Supplier
              </TableHead>
              <TableHead className="min-w-[100px] border-r border-[#E5E7EB] px-3 py-2.5 text-xs font-semibold text-[#374151]">
                Tracking ID
              </TableHead>
              <TableHead className="min-w-[90px] px-3 py-2.5 text-xs font-semibold text-[#374151]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRows.length === 0 ? (
              <TableRow className="hover:bg-white">
                <TableCell
                  colSpan={10}
                  className="h-24 text-center text-sm text-[#9CA3AF]"
                >
                  No purchase orders found
                </TableCell>
              </TableRow>
            ) : (
              sortedRows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-b border-[#E5E7EB] hover:bg-[#FAFAFA]"
                >
                  <TableCell className="border-r border-[#E5E7EB] px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(row.id)}
                      onChange={() => toggleRow(row.id)}
                      aria-label={`Select ${row.orderId}`}
                    />
                  </TableCell>
                  <TableCell className="border-r border-[#E5E7EB] px-3 py-2 text-sm font-medium text-[#374151]">
                    {row.orderId}
                  </TableCell>
                  <TableCell className="border-r border-[#E5E7EB] px-3 py-2 text-sm text-[#374151]">
                    {row.date}
                  </TableCell>
                  <TableCell className="border-r border-[#E5E7EB] px-3 py-2 text-sm text-[#374151]">
                    {row.product}
                  </TableCell>
                  <TableCell className="border-r border-[#E5E7EB] px-3 py-2 text-sm text-[#374151]">
                    {row.createdBy}
                  </TableCell>
                  <TableCell className="border-r border-[#E5E7EB] px-3 py-2 text-sm text-[#374151]">
                    {row.specialOrder || "—"}
                  </TableCell>
                  <TableCell className="border-r border-[#E5E7EB] px-3 py-2 text-sm text-[#374151]">
                    {row.paymentStatus}
                  </TableCell>
                  <TableCell className="border-r border-[#E5E7EB] px-3 py-2 text-sm text-[#374151]">
                    {row.supplier}
                  </TableCell>
                  <TableCell className="border-r border-[#E5E7EB] px-3 py-2 text-sm text-[#374151]">
                    {row.trackingId || "—"}
                  </TableCell>
                  <TableCell className="px-3 py-2">
                    <PurchaseOrderActionDropdown
                      row={row}
                      onView={onView}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onMarkPaid={onMarkPaid}
                      onTrack={onTrack}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
