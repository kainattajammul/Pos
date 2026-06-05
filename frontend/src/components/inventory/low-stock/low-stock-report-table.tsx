"use client";

import { ChevronDown, Info, Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { LowStockReportRow } from "@/components/inventory/low-stock/low-stock-report-types";

interface LowStockReportTableProps {
  rows: LowStockReportRow[];
  pageSize: number;
  selectedIds: Set<string>;
  onPageSizeChange: (size: number) => void;
  onToggleRow: (id: string, checked: boolean) => void;
  onToggleAll: (checked: boolean) => void;
  onAddToPurchaseOrder: () => void;
}

const tealBtn =
  "h-9 gap-1.5 rounded-sm border-0 bg-(--repair-primary) px-3 text-sm font-semibold text-(--repair-on-primary) shadow-sm hover:opacity-90";

function InfoHeader({ label, tip }: { label: string; tip: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      {label}
      <Tooltip>
        <TooltipTrigger
          type="button"
          className="inline-flex text-pos-subtle transition-colors hover:text-pos-muted"
          aria-label={`${label} info`}
        >
          <Info className="size-3.5" />
        </TooltipTrigger>
        <TooltipContent>{tip}</TooltipContent>
      </Tooltip>
    </span>
  );
}

export function LowStockReportTable({
  rows,
  pageSize,
  selectedIds,
  onPageSizeChange,
  onToggleRow,
  onToggleAll,
  onAddToPurchaseOrder,
}: LowStockReportTableProps) {
  const displayed = rows.slice(0, pageSize);
  const allDisplayedSelected =
    displayed.length > 0 && displayed.every((row) => selectedIds.has(row.id));
  const someSelected = displayed.some((row) => selectedIds.has(row.id));

  return (
    <TooltipProvider>
      <section className="pos-table-shell">
        <div className="flex flex-wrap items-center justify-end gap-3 border-b border-pos px-4 py-3">
          <Button type="button" className={tealBtn} onClick={onAddToPurchaseOrder}>
            <Plus className="size-4" />
            Add to Purchase Order
          </Button>
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
          <Table className="min-w-[1600px]">
            <TableHeader className="sticky top-0 z-10 bg-pos-table-header">
              <TableRow className="border-b border-pos hover:bg-pos-table-header">
                <TableHead className="w-10 px-3 py-2.5">
                  <Checkbox
                    checked={allDisplayedSelected}
                    indeterminate={someSelected && !allDisplayedSelected}
                    onCheckedChange={(checked) => onToggleAll(checked === true)}
                    aria-label="Select all rows"
                  />
                </TableHead>
                <TableHead className="min-w-[80px] whitespace-nowrap px-3 py-2.5 text-xs font-semibold text-pos-muted">
                  Item ID
                </TableHead>
                <TableHead className="min-w-[100px] whitespace-nowrap px-3 py-2.5 text-xs font-semibold text-pos-muted">
                  SKU
                </TableHead>
                <TableHead className="min-w-[100px] whitespace-nowrap px-3 py-2.5 text-xs font-semibold text-pos-muted">
                  Category
                </TableHead>
                <TableHead className="min-w-[110px] whitespace-nowrap px-3 py-2.5 text-xs font-semibold text-pos-muted">
                  Manufacturer
                </TableHead>
                <TableHead className="min-w-[120px] whitespace-nowrap px-3 py-2.5 text-xs font-semibold text-pos-muted">
                  Device
                </TableHead>
                <TableHead className="min-w-[220px] whitespace-nowrap px-3 py-2.5 text-xs font-semibold text-pos-muted">
                  Product Name
                </TableHead>
                <TableHead className="min-w-[120px] whitespace-nowrap px-3 py-2.5 text-xs font-semibold text-pos-muted">
                  Supplier
                </TableHead>
                <TableHead className="min-w-[72px] whitespace-nowrap px-3 py-2.5 text-xs font-semibold text-pos-muted">
                  On Hand
                </TableHead>
                <TableHead className="min-w-[100px] whitespace-nowrap px-3 py-2.5 text-xs font-semibold text-pos-muted">
                  Stock Warning
                </TableHead>
                <TableHead className="min-w-[110px] whitespace-nowrap px-3 py-2.5 text-xs font-semibold text-pos-muted">
                  <InfoHeader
                    label="Reorder Level"
                    tip="Minimum quantity to keep on hand before reordering."
                  />
                </TableHead>
                <TableHead className="min-w-[72px] whitespace-nowrap px-3 py-2.5 text-xs font-semibold text-pos-muted">
                  <InfoHeader
                    label="On PO"
                    tip="Quantity already on open purchase orders."
                  />
                </TableHead>
                <TableHead className="min-w-[90px] whitespace-nowrap px-3 py-2.5 text-xs font-semibold text-pos-muted">
                  Required Qty
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayed.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={13}
                    className="h-16 text-center text-sm italic text-pos-muted"
                  >
                    No results found.
                  </TableCell>
                </TableRow>
              ) : (
                displayed.map((row) => (
                  <TableRow
                    key={row.id}
                    className="pos-row-hover border-b border-pos"
                  >
                    <TableCell className="px-3 py-2">
                      <Checkbox
                        checked={selectedIds.has(row.id)}
                        onCheckedChange={(checked) =>
                          onToggleRow(row.id, checked === true)
                        }
                        aria-label={`Select item ${row.itemId}`}
                      />
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-3 py-2 text-sm text-pos-secondary">
                      {row.itemId}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-3 py-2 text-sm text-pos-secondary">
                      {row.sku}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-3 py-2 text-sm text-pos-secondary">
                      {row.category}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-3 py-2 text-sm text-pos-secondary">
                      {row.manufacturer}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-3 py-2 text-sm text-pos-secondary">
                      {row.device}
                    </TableCell>
                    <TableCell className="max-w-[280px] px-3 py-2 text-sm text-pos-secondary">
                      <span className="line-clamp-2" title={row.productName}>
                        {row.productName}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-3 py-2 text-sm text-pos-secondary">
                      {row.supplier}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-3 py-2 text-sm tabular-nums text-[#374151]">
                      {row.onHand}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-3 py-2 text-sm tabular-nums text-[#374151]">
                      {row.stockWarning}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-3 py-2 text-sm tabular-nums text-[#374151]">
                      {row.reorderLevel}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-3 py-2 text-sm tabular-nums text-[#374151]">
                      {row.onPo}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-3 py-2 text-sm tabular-nums font-medium text-pos">
                      {row.requiredQty}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </TooltipProvider>
  );
}
