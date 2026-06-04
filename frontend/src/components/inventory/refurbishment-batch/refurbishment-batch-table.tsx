"use client";

import { ChevronDown } from "lucide-react";
import { RefurbishmentBatchActionDropdown } from "@/components/inventory/refurbishment-batch/refurbishment-batch-action-dropdown";
import { RefurbishmentBatchStatusBadge } from "@/components/inventory/refurbishment-batch/refurbishment-batch-status-badge";
import type { RefurbishmentBatchRecord } from "@/components/inventory/refurbishment-batch/refurbishment-batch-types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface RefurbishmentBatchTableProps {
  rows: RefurbishmentBatchRecord[];
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  onView?: (row: RefurbishmentBatchRecord) => void;
  onEdit?: (row: RefurbishmentBatchRecord) => void;
  onDelete?: (row: RefurbishmentBatchRecord) => void;
}

const COLUMNS: { key: string; label: string; className?: string }[] = [
  { key: "batchId", label: "Batch ID", className: "min-w-[90px]" },
  { key: "batchName", label: "Batch Name", className: "min-w-[140px]" },
  { key: "batchDate", label: "Batch Date", className: "min-w-[120px]" },
  { key: "store", label: "Store", className: "min-w-[100px]" },
  { key: "employee", label: "Employee", className: "min-w-[110px]" },
  { key: "totalItems", label: "Total Items", className: "min-w-[90px]" },
  {
    key: "refurbishmentTicketId",
    label: "Refurbishment Ticket ID",
    className: "min-w-[150px]",
  },
  { key: "status", label: "Status", className: "min-w-[100px]" },
  { key: "action", label: "Action", className: "min-w-[90px]" },
];

export function RefurbishmentBatchTable({
  rows,
  pageSize,
  onPageSizeChange,
  onView,
  onEdit,
  onDelete,
}: RefurbishmentBatchTableProps) {
  const displayed = rows.slice(0, pageSize);

  return (
    <section className="overflow-hidden rounded-sm border border-[#E5E7EB] bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E7EB] px-4 py-3">
        <h2 className="text-base font-semibold text-[#111827]">Manage Refurbishment Batch</h2>
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
        <Table className="min-w-[1100px]">
          <TableHeader className="bg-[#F3F4F6]">
            <TableRow className="border-b border-[#E5E7EB] hover:bg-[#F3F4F6]">
              {COLUMNS.map((col) => (
                <TableHead
                  key={col.key}
                  className={`whitespace-nowrap border-r border-[#E5E7EB] px-3 py-2.5 text-xs font-semibold text-[#374151] last:border-r-0 ${col.className ?? ""}`}
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
                  colSpan={COLUMNS.length}
                  className="h-12 border-b border-[#E5E7EB] text-center text-sm italic text-[#9CA3AF]"
                >
                  No results found
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
                      className={`whitespace-normal border-r border-[#E5E7EB] px-3 py-2 text-sm text-[#374151] last:border-r-0 ${col.className ?? ""}`}
                    >
                      {col.key === "action" ? (
                        <RefurbishmentBatchActionDropdown
                          row={row}
                          onView={onView}
                          onEdit={onEdit}
                          onDelete={onDelete}
                        />
                      ) : col.key === "status" ? (
                        <RefurbishmentBatchStatusBadge status={row.status} />
                      ) : col.key === "totalItems" ? (
                        String(row.totalItems)
                      ) : (
                        (row[col.key as keyof RefurbishmentBatchRecord] as string) || ""
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
