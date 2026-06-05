"use client";

import { ChevronDown } from "lucide-react";
import { BillPaymentsRowAction } from "@/components/inventory/bill-payments/bill-payments-row-action";
import {
  formatBillPaymentMoney,
  type BillPaymentRecord,
} from "@/components/inventory/bill-payments/bill-payments-types";
import { ManageInventoryTabs } from "@/components/inventory/shared/manage-inventory-tabs";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface BillPaymentsTableProps {
  rows: BillPaymentRecord[];
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  selectedIds: Set<string>;
  onToggleRow: (id: string) => void;
  onToggleAll: (ids: string[]) => void;
  onAddItem: () => void;
  onEdit?: (row: BillPaymentRecord) => void;
  onDelete?: (row: BillPaymentRecord) => void;
}

const COLUMNS: { key: string; label: string; className?: string }[] = [
  { key: "itemId", label: "Item ID", className: "min-w-[88px]" },
  { key: "planName", label: "Plan Name", className: "min-w-[140px]" },
  { key: "providerName", label: "Provider Name", className: "min-w-[120px]" },
  { key: "networkName", label: "Network Name", className: "min-w-[120px]" },
  { key: "planMsrp", label: "Plan MSRP", className: "min-w-[96px] text-right" },
  { key: "airtimeMargin", label: "Airtime Margin", className: "min-w-[110px] text-right" },
  { key: "unitCost", label: "Unit Cost", className: "min-w-[88px] text-right" },
  { key: "collectFee", label: "Collect Fee", className: "min-w-[96px] text-right" },
  { key: "tax911", label: "911 Tax", className: "min-w-[80px] text-right" },
  { key: "createdOn", label: "Created On", className: "min-w-[100px]" },
  { key: "action", label: "Action", className: "min-w-[100px]" },
];

function moneyCell(value: number) {
  return formatBillPaymentMoney(value);
}

export function BillPaymentsTable({
  rows,
  pageSize,
  onPageSizeChange,
  selectedIds,
  onToggleRow,
  onToggleAll,
  onAddItem,
  onEdit,
  onDelete,
}: BillPaymentsTableProps) {
  const displayed = rows.slice(0, pageSize);
  const pageIds = displayed.map((r) => r.id);
  const allSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));

  return (
    <section className="overflow-hidden rounded-sm border border-[#E5E7EB] bg-white shadow-sm">
      <ManageInventoryTabs activeId="bill-payments" />

      <div className="flex items-center justify-end border-b border-[#E5E7EB] px-4 py-2.5">
        <label className="relative">
          <select
            value={String(pageSize)}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-8 appearance-none rounded-sm border border-[#E5E7EB] bg-white py-1 pl-3 pr-8 text-xs font-medium text-[#374151]"
            aria-label="Rows per page"
          >
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-[#9CA3AF]" />
        </label>
      </div>

      <div className="overflow-x-auto">
        <Table className="min-w-[1400px]">
          <TableHeader className="bg-[#F3F4F6]">
            <TableRow className="border-b border-[#E5E7EB] hover:bg-[#F3F4F6]">
              <TableHead className="w-10 px-3">
                <input
                  type="checkbox"
                  className="size-3.5 rounded border-[#D1D5DB]"
                  checked={allSelected}
                  onChange={() => onToggleAll(pageIds)}
                  aria-label="Select all rows"
                />
              </TableHead>
              {COLUMNS.map((col) => (
                <TableHead
                  key={col.key}
                  className={`whitespace-nowrap px-3 py-2.5 text-xs font-semibold text-[#374151] ${col.className ?? ""}`}
                >
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayed.length === 0 ? (
              <TableRow className="hover:bg-white">
                <TableCell
                  colSpan={COLUMNS.length + 1}
                  className="h-16 px-4 text-sm text-[#6B7280]"
                >
                  <span>No results found. Do you want to </span>
                  <Button
                    type="button"
                    variant="outline"
                    className="ml-1 inline-flex h-7 rounded-sm border-[#E5E7EB] px-2.5 text-xs font-semibold text-[#374151] hover:bg-[#F9FAFB]"
                    onClick={onAddItem}
                  >
                    Add Item
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              displayed.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB]"
                >
                  <TableCell className="px-3">
                    <input
                      type="checkbox"
                      className="size-3.5 rounded border-[#D1D5DB]"
                      checked={selectedIds.has(row.id)}
                      onChange={() => onToggleRow(row.id)}
                      aria-label={`Select ${row.itemId}`}
                    />
                  </TableCell>
                  <TableCell className="px-3 text-sm text-[#374151]">{row.itemId}</TableCell>
                  <TableCell className="px-3 text-sm text-[#374151]">{row.planName}</TableCell>
                  <TableCell className="px-3 text-sm text-[#374151]">{row.providerName}</TableCell>
                  <TableCell className="px-3 text-sm text-[#374151]">{row.networkName}</TableCell>
                  <TableCell className="px-3 text-right text-sm text-[#374151]">
                    {moneyCell(row.planMsrp)}
                  </TableCell>
                  <TableCell className="px-3 text-right text-sm text-[#374151]">
                    {moneyCell(row.airtimeMargin)}
                  </TableCell>
                  <TableCell className="px-3 text-right text-sm text-[#374151]">
                    {moneyCell(row.unitCost)}
                  </TableCell>
                  <TableCell className="px-3 text-right text-sm text-[#374151]">
                    {moneyCell(row.collectFee)}
                  </TableCell>
                  <TableCell className="px-3 text-right text-sm text-[#374151]">
                    {moneyCell(row.tax911)}
                  </TableCell>
                  <TableCell className="px-3 text-sm text-[#374151]">{row.createdOn}</TableCell>
                  <TableCell className="px-3">
                    <BillPaymentsRowAction row={row} onEdit={onEdit} onDelete={onDelete} />
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
