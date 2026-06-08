"use client";

import { ArrowUpDown, Settings2 } from "lucide-react";
import { formatCurrency } from "@/utils/format";
import type { RepairsService } from "@/components/inventory/manage-services/repairs-services-types";
import { ManageServicesTabs } from "@/components/inventory/shared/manage-services-tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface RepairsServicesTableProps {
  rows: RepairsService[];
}

function SortableHeader({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      {label}
      <ArrowUpDown className="size-3 text-[#9CA3AF]" aria-hidden />
    </span>
  );
}

export function RepairsServicesTable({ rows }: RepairsServicesTableProps) {
  return (
    <section className="pos-table-shell">
      <ManageServicesTabs activeId="repairs" />

      <div className="overflow-x-auto">
        <Table className="min-w-[900px]">
          <TableHeader className="sticky top-0 z-10 bg-pos-table-header">
            <TableRow className="border-b border-pos hover:bg-pos-table-header">
              <TableHead className="min-w-[60px] whitespace-nowrap px-3 py-2.5 text-xs font-semibold text-pos-muted">
                <SortableHeader label="ID" />
              </TableHead>
              <TableHead className="min-w-[100px] whitespace-nowrap px-3 py-2.5 text-xs font-semibold text-pos-muted">
                Category
              </TableHead>
              <TableHead className="min-w-[100px] whitespace-nowrap px-3 py-2.5 text-xs font-semibold text-pos-muted">
                Brand
              </TableHead>
              <TableHead className="min-w-[110px] whitespace-nowrap px-3 py-2.5 text-xs font-semibold text-pos-muted">
                Model
              </TableHead>
              <TableHead className="min-w-[200px] whitespace-nowrap px-3 py-2.5 text-xs font-semibold text-pos-muted">
                <SortableHeader label="Service Name" />
              </TableHead>
              <TableHead className="min-w-[80px] whitespace-nowrap px-3 py-2.5 text-xs font-semibold text-pos-muted">
                Price
              </TableHead>
              <TableHead className="min-w-[120px] whitespace-nowrap px-3 py-2.5 text-xs font-semibold text-pos-muted">
                Display On Widget
              </TableHead>
              <TableHead className="w-10 px-3 py-2.5 text-right text-xs font-semibold text-pos-muted">
                <Settings2 className="ml-auto size-4 text-[#9CA3AF]" aria-label="Actions" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-16 text-center text-sm italic text-pos-muted"
                >
                  No Record Found.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id} className="pos-row-hover border-b border-pos">
                  <TableCell className="whitespace-nowrap px-3 py-2 text-sm text-pos-secondary">
                    {row.numericId}
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-3 py-2 text-sm text-pos-secondary">
                    {row.category}
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-3 py-2 text-sm text-pos-secondary">
                    {row.brand}
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-3 py-2 text-sm text-pos-secondary">
                    {row.model}
                  </TableCell>
                  <TableCell className="px-3 py-2 text-sm text-pos-secondary">
                    {row.serviceName}
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-3 py-2 text-sm tabular-nums text-pos-secondary">
                    {formatCurrency(row.price)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-3 py-2 text-sm text-pos-secondary">
                    {row.displayOnWidget ? "Yes" : "No"}
                  </TableCell>
                  <TableCell className="px-3 py-2 text-right">
                    <button
                      type="button"
                      className="inline-flex rounded-sm p-1 text-[#9CA3AF] hover:text-[#6B7280]"
                      aria-label={`Settings for ${row.serviceName}`}
                    >
                      <Settings2 className="size-4" />
                    </button>
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
