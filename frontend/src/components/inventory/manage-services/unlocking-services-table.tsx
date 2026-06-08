"use client";

import { ChevronDown } from "lucide-react";
import { UnlockingServicesRowAction } from "@/components/inventory/manage-services/unlocking-services-row-action";
import {
  formatUnlockingMoney,
  type UnlockingService,
} from "@/components/inventory/manage-services/unlocking-services-types";
import { ManageServicesTabs } from "@/components/inventory/shared/manage-services-tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface UnlockingServicesTableProps {
  rows: UnlockingService[];
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  selectedIds: Set<string>;
  onToggleRow: (id: string) => void;
  onToggleAll: (ids: string[]) => void;
  onUpdate?: (row: UnlockingService) => void;
  onClone?: (row: UnlockingService) => void;
  onRemoveFromStore?: (row: UnlockingService) => void;
  onNameClick?: (row: UnlockingService) => void;
  onPriceChange: (id: string, price: number) => void;
  onCostChange: (id: string, cost: number) => void;
}

const COLUMNS: { key: string; label: string; className?: string }[] = [
  { key: "itemId", label: "Item ID", className: "min-w-[88px]" },
  { key: "name", label: "Name", className: "min-w-[180px]" },
  { key: "supportedDevices", label: "Supported Devices", className: "min-w-[140px]" },
  { key: "price", label: "Price", className: "min-w-[96px]" },
  { key: "cost", label: "Cost", className: "min-w-[96px]" },
  { key: "action", label: "Action", className: "min-w-[100px]" },
];

const editableInputClass =
  "h-8 w-full min-w-[72px] rounded-sm border border-[#E5E7EB] px-2 text-sm tabular-nums text-[#374151] focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary)";

export function UnlockingServicesTable({
  rows,
  pageSize,
  onPageSizeChange,
  selectedIds,
  onToggleRow,
  onToggleAll,
  onUpdate,
  onClone,
  onRemoveFromStore,
  onNameClick,
  onPriceChange,
  onCostChange,
}: UnlockingServicesTableProps) {
  const displayed = rows.slice(0, pageSize);
  const pageIds = displayed.map((r) => r.id);
  const allSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));

  const total = rows.length;
  const start = total === 0 ? 0 : 1;
  const end = displayed.length;

  return (
    <section className="pos-table-shell">
      <ManageServicesTabs activeId="unlocking" />

      <div className="flex items-center justify-end border-b border-pos px-4 py-2.5">
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
        <Table className="min-w-[900px]">
          <TableHeader className="sticky top-0 z-10 bg-pos-table-header">
            <TableRow className="border-b border-pos hover:bg-pos-table-header">
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
                  className={`whitespace-nowrap px-3 py-2.5 text-xs font-semibold text-pos-muted ${col.className ?? ""}`}
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
                  colSpan={COLUMNS.length + 1}
                  className="h-16 px-4 text-sm text-pos-muted"
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
                  <TableCell className="px-3 text-sm">
                    <button
                      type="button"
                      className="font-medium text-primary underline-offset-2 hover:text-(--repair-primary) hover:underline"
                      onClick={() => onNameClick?.(row)}
                    >
                      {row.name}
                    </button>
                  </TableCell>
                  <TableCell className="px-3 text-sm text-[#374151]">
                    {row.supportedDevices || "N/A"}
                  </TableCell>
                  <TableCell className="px-3">
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={formatUnlockingMoney(row.price)}
                      onChange={(e) =>
                        onPriceChange(row.id, Number.parseFloat(e.target.value) || 0)
                      }
                      className={editableInputClass}
                      aria-label={`Price for ${row.name}`}
                    />
                  </TableCell>
                  <TableCell className="px-3">
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={formatUnlockingMoney(row.cost)}
                      onChange={(e) =>
                        onCostChange(row.id, Number.parseFloat(e.target.value) || 0)
                      }
                      className={editableInputClass}
                      aria-label={`Cost for ${row.name}`}
                    />
                  </TableCell>
                  <TableCell className="px-3">
                    <UnlockingServicesRowAction
                      row={row}
                      onUpdate={onUpdate}
                      onClone={onClone}
                      onRemoveFromStore={onRemoveFromStore}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="border-t border-pos px-4 py-3 text-sm text-pos-muted">
        Displaying {start}–{end} of {total} results
      </div>
    </section>
  );
}
