"use client";

import { ChevronDown } from "lucide-react";
import { InventoryCountActionDropdown } from "@/components/inventory/inventory-count/inventory-count-action-dropdown";
import { InventoryCountStatusBadge } from "@/components/inventory/inventory-count/inventory-count-status-badge";
import {
  formatCostVariance,
  type InventoryCountRecord,
} from "@/components/inventory/inventory-count/inventory-count-types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface InventoryCountTableProps {
  rows: InventoryCountRecord[];
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  onView?: (row: InventoryCountRecord) => void;
  onContinue?: (row: InventoryCountRecord) => void;
  onEdit?: (row: InventoryCountRecord) => void;
  onDelete?: (row: InventoryCountRecord) => void;
}

const COLUMNS: { key: string; label: string; className?: string }[] = [
  { key: "countId", label: "Count ID", className: "min-w-[88px]" },
  { key: "date", label: "Date", className: "min-w-[140px]" },
  { key: "store", label: "Store", className: "min-w-[100px]" },
  { key: "countName", label: "Count Name", className: "min-w-[200px]" },
  { key: "employee", label: "Employee", className: "min-w-[110px]" },
  { key: "items", label: "Items", className: "min-w-[72px]" },
  { key: "status", label: "Status", className: "min-w-[90px]" },
  { key: "inStock", label: "In Stock", className: "min-w-[80px]" },
  { key: "counted", label: "Counted", className: "min-w-[80px]" },
  { key: "itemVariance", label: "Item Variance", className: "min-w-[100px]" },
  { key: "costVariance", label: "Cost Variance", className: "min-w-[100px]" },
  {
    key: "adjustmentReport",
    label: "Inventory Adjustment Report",
    className: "min-w-[160px]",
  },
  { key: "action", label: "Action", className: "min-w-[100px]" },
];

export function InventoryCountTable({
  rows,
  pageSize,
  onPageSizeChange,
  onView,
  onContinue,
  onEdit,
  onDelete,
}: InventoryCountTableProps) {
  const displayed = rows.slice(0, pageSize);

  return (
    <section className="overflow-hidden rounded-sm border border-[#E5E7EB] bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E7EB] px-4 py-3">
        <h2 className="text-base font-semibold text-[#111827]">Manage Inventory Count</h2>
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
              <TableRow>
                <TableCell
                  colSpan={COLUMNS.length}
                  className="h-14 text-center text-sm text-[#6B7280]"
                >
                  No inventory counts found
                </TableCell>
              </TableRow>
            ) : (
              displayed.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-b border-[#E5E7EB] hover:bg-[#FAFAFA]"
                >
                  {COLUMNS.map((col) => (
                    <TableCell
                      key={col.key}
                      className={`whitespace-normal px-3 py-2 text-sm text-[#374151] ${col.className ?? ""}`}
                    >
                      {col.key === "action" ? (
                        <InventoryCountActionDropdown
                          row={row}
                          onView={onView}
                          onContinue={onContinue}
                          onEdit={onEdit}
                          onDelete={onDelete}
                        />
                      ) : col.key === "status" ? (
                        <InventoryCountStatusBadge status={row.status} />
                      ) : col.key === "itemVariance" ? (
                        String(row.itemVariance)
                      ) : col.key === "costVariance" ? (
                        formatCostVariance(row.costVariance)
                      ) : (
                        (row[col.key as keyof InventoryCountRecord] as string) || ""
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
