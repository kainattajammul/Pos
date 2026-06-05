"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  InventorySummaryRow,
  InventorySummaryTotals,
} from "@/components/inventory/inventory-summary/inventory-summary-report-types";
import { formatSummaryMoney } from "@/components/inventory/inventory-summary/inventory-summary-report-types";

interface InventorySummaryReportTableProps {
  rows: InventorySummaryRow[];
  pageSize: number;
  totals: InventorySummaryTotals;
  onPageSizeChange: (size: number) => void;
}

const COLUMNS = [
  { key: "sku", label: "SKU", className: "min-w-[88px]" },
  { key: "category", label: "Category", className: "min-w-[100px]" },
  { key: "manufacturer", label: "Manufacturer", className: "min-w-[100px]" },
  { key: "device", label: "Device", className: "min-w-[120px]" },
  { key: "productName", label: "Product Name", className: "min-w-[200px]" },
  { key: "onHand", label: "On Hand", className: "min-w-[72px] text-right" },
  { key: "averageCostPrice", label: "Average Cost Price", className: "min-w-[120px] text-right" },
  { key: "totalValue", label: "Total Value", className: "min-w-[100px] text-right" },
  { key: "onPo", label: "On PO", className: "min-w-[64px] text-right" },
] as const;

const VALUE_COLUMN_COUNT = 4;
const LABEL_COLUMN_COUNT = COLUMNS.length - VALUE_COLUMN_COUNT;

export function InventorySummaryReportTable({
  rows,
  pageSize,
  totals,
  onPageSizeChange,
}: InventorySummaryReportTableProps) {
  const displayed = rows.slice(0, pageSize);

  return (
    <section className="pos-table-shell">
      <div className="flex justify-end border-b border-pos px-4 py-2.5">
        <label className="relative">
          <select
            value={String(pageSize)}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="pos-input h-8 appearance-none rounded-sm py-1 pl-3 pr-8 text-xs font-medium"
            aria-label="Rows per page"
          >
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-pos-subtle" />
        </label>
      </div>

      <div className="overflow-x-auto">
        <Table className="min-w-[1200px]">
          <TableHeader className="sticky top-0 z-10 bg-pos-table-header">
            <TableRow className="border-b border-pos hover:bg-pos-table-header">
              {COLUMNS.map((col) => (
                <TableHead
                  key={col.key}
                  className={`whitespace-nowrap px-3 py-2.5 text-xs font-semibold text-pos-muted ${col.className}`}
                >
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayed.length === 0 ? (
              <TableRow className="hover:bg-pos-surface">
                <TableCell
                  colSpan={COLUMNS.length}
                  className="h-16 border-b border-dashed border-pos text-center text-sm italic text-pos-muted"
                >
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              displayed.map((row) => (
                <TableRow
                  key={row.id}
                  className="pos-row-hover border-b border-dashed border-pos"
                >
                  <TableCell className="px-3 py-2 text-sm">
                    <Link
                      href={`/inventory/products?sku=${encodeURIComponent(row.sku)}`}
                      className="font-medium text-[var(--repair-primary)] hover:underline"
                    >
                      {row.sku}
                    </Link>
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-3 py-2 text-sm text-[#374151]">
                    {row.category}
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-3 py-2 text-sm text-[#374151]">
                    {row.manufacturer}
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-3 py-2 text-sm text-[#374151]">
                    {row.device}
                  </TableCell>
                  <TableCell className="max-w-[280px] px-3 py-2 text-sm text-[#374151]">
                    <span className="line-clamp-2" title={row.productName}>
                      {row.productName}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-3 py-2 text-right text-sm tabular-nums text-[#374151]">
                    {row.onHand}
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-3 py-2 text-right text-sm tabular-nums text-[#374151]">
                    {formatSummaryMoney(row.averageCostPrice)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-3 py-2 text-right text-sm tabular-nums text-[#374151]">
                    {formatSummaryMoney(row.totalValue)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-3 py-2 text-right text-sm tabular-nums text-[#374151]">
                    {row.onPo}
                  </TableCell>
                </TableRow>
              ))
            )}

            <TableRow className="bg-[#F3F4F6] hover:bg-[#F3F4F6]">
              <TableCell
                colSpan={LABEL_COLUMN_COUNT}
                className="px-3 py-2.5 text-sm font-semibold text-[#374151]"
              >
                Total
              </TableCell>
              <TableCell className="px-3 py-2.5 text-right text-sm font-semibold tabular-nums text-[#374151]">
                {totals.onHand}
              </TableCell>
              <TableCell className="px-3 py-2.5 text-right text-sm font-semibold tabular-nums text-[#374151]">
                {formatSummaryMoney(totals.averageCostPrice)}
              </TableCell>
              <TableCell className="px-3 py-2.5 text-right text-sm font-semibold tabular-nums text-[#374151]">
                {formatSummaryMoney(totals.totalValue)}
              </TableCell>
              <TableCell className="px-3 py-2.5 text-right text-sm font-semibold tabular-nums text-[#374151]">
                {totals.onPo}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
