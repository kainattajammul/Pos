"use client";

import { ChevronDown } from "lucide-react";
import { RefurbishmentBatchLineActionDropdown } from "@/components/inventory/refurbishment-batch/refurbishment-batch-line-action-dropdown";
import {
  DEVICE_PROBLEM_OPTIONS,
  type RefurbishmentBatchLineItem,
} from "@/components/inventory/refurbishment-batch/refurbishment-batch-create-types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const cellInputClass =
  "h-9 w-full min-w-[120px] rounded-sm border border-[#E5E7EB] bg-white px-2 text-xs text-[#111827] focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary)";

const cellSelectClass =
  "h-9 w-full min-w-[140px] appearance-none rounded-sm border border-[#E5E7EB] bg-white px-2 pr-7 text-xs text-[#111827] focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary)";

interface RefurbishmentBatchListTableProps {
  rows: RefurbishmentBatchLineItem[];
  onUpdateRow: (id: string, patch: Partial<RefurbishmentBatchLineItem>) => void;
  onView: (row: RefurbishmentBatchLineItem) => void;
  onEdit: (row: RefurbishmentBatchLineItem) => void;
  onRemove: (row: RefurbishmentBatchLineItem) => void;
}

export function RefurbishmentBatchListTable({
  rows,
  onUpdateRow,
  onView,
  onEdit,
  onRemove,
}: RefurbishmentBatchListTableProps) {
  return (
    <section className="overflow-hidden rounded-sm border border-[#E5E7EB] bg-white shadow-sm">
      <div className="border-b border-[#E5E7EB] px-4 py-3">
        <h2 className="text-base font-semibold text-[#111827]">Refurbishment Batch List</h2>
      </div>

      <div className="overflow-x-auto">
        <Table className="min-w-[1000px]">
          <TableHeader className="bg-[#F3F4F6]">
            <TableRow className="border-b border-[#E5E7EB] hover:bg-[#F3F4F6]">
              <TableHead className="min-w-[120px] border-r border-[#E5E7EB] px-3 py-2.5 text-xs font-semibold text-[#374151]">
                IMEI/Serial
              </TableHead>
              <TableHead className="min-w-[110px] border-r border-[#E5E7EB] px-3 py-2.5 text-xs font-semibold text-[#374151]">
                Variants Info
              </TableHead>
              <TableHead className="min-w-[90px] border-r border-[#E5E7EB] px-3 py-2.5 text-xs font-semibold text-[#374151]">
                Warranty
              </TableHead>
              <TableHead className="min-w-[120px] border-r border-[#E5E7EB] px-3 py-2.5 text-xs font-semibold text-[#374151]">
                Supplier/Vendor
              </TableHead>
              <TableHead className="min-w-[160px] border-r border-[#E5E7EB] px-3 py-2.5 text-xs font-semibold text-[#374151]">
                Select Device Problem
              </TableHead>
              <TableHead className="min-w-[160px] border-r border-[#E5E7EB] px-3 py-2.5 text-xs font-semibold text-[#374151]">
                Add Diagnostic Notes
              </TableHead>
              <TableHead className="min-w-[90px] px-3 py-2.5 text-xs font-semibold text-[#374151]">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow className="hover:bg-white">
                <TableCell
                  colSpan={7}
                  className="h-12 border-b border-[#E5E7EB] px-3 text-sm text-[#9CA3AF]"
                >
                  No record
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-b border-[#E5E7EB] hover:bg-[#FAFAFA]"
                >
                  <TableCell className="border-r border-[#E5E7EB] px-3 py-2 text-sm font-medium text-[#374151]">
                    {row.imeiSerial}
                  </TableCell>
                  <TableCell className="border-r border-[#E5E7EB] px-2 py-2">
                    <input
                      value={row.variantsInfo}
                      onChange={(e) =>
                        onUpdateRow(row.id, { variantsInfo: e.target.value })
                      }
                      className={cellInputClass}
                      placeholder="—"
                    />
                  </TableCell>
                  <TableCell className="border-r border-[#E5E7EB] px-2 py-2">
                    <input
                      value={row.warranty}
                      onChange={(e) => onUpdateRow(row.id, { warranty: e.target.value })}
                      className={cellInputClass}
                      placeholder="—"
                    />
                  </TableCell>
                  <TableCell className="border-r border-[#E5E7EB] px-2 py-2">
                    <input
                      value={row.supplierVendor}
                      onChange={(e) =>
                        onUpdateRow(row.id, { supplierVendor: e.target.value })
                      }
                      className={cellInputClass}
                      placeholder="—"
                    />
                  </TableCell>
                  <TableCell className="border-r border-[#E5E7EB] px-2 py-2">
                    <div className="relative">
                      <select
                        value={row.deviceProblem}
                        onChange={(e) =>
                          onUpdateRow(row.id, { deviceProblem: e.target.value })
                        }
                        className={cellSelectClass}
                      >
                        <option value="">Select problem</option>
                        {DEVICE_PROBLEM_OPTIONS.filter(Boolean).map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3 -translate-y-1/2 text-[#9CA3AF]" />
                    </div>
                  </TableCell>
                  <TableCell className="border-r border-[#E5E7EB] px-2 py-2">
                    <input
                      value={row.diagnosticNotes}
                      onChange={(e) =>
                        onUpdateRow(row.id, { diagnosticNotes: e.target.value })
                      }
                      className={cellInputClass}
                      placeholder="Notes"
                    />
                  </TableCell>
                  <TableCell className="px-2 py-2">
                    <RefurbishmentBatchLineActionDropdown
                      row={row}
                      onView={onView}
                      onEdit={onEdit}
                      onRemove={onRemove}
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
