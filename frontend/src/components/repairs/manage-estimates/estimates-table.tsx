"use client";

import { ArrowUpDown, Settings2 } from "lucide-react";
import { EstimateDateTabs } from "@/components/repairs/manage-estimates/estimate-date-tabs";
import { EstimatesEmptyState } from "@/components/repairs/manage-estimates/estimates-empty-state";
import { EstimatePagination } from "@/components/repairs/manage-estimates/estimate-pagination";
import type { EstimateRecord } from "@/components/repairs/manage-estimates/manage-estimates-types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface EstimatesTableProps {
  rows: EstimateRecord[];
  activeDateTab: Parameters<typeof EstimateDateTabs>[0]["activeTab"];
  onDateTabChange: Parameters<typeof EstimateDateTabs>[0]["onTabChange"];
  pageSize: number;
  onPageSizeChange: (size: number) => void;
}

function SortHead({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      {label}
      <ArrowUpDown className="size-3 text-[#9CA3AF]" />
    </span>
  );
}

export function EstimatesTable({
  rows,
  activeDateTab,
  onDateTabChange,
  pageSize,
  onPageSizeChange,
}: EstimatesTableProps) {
  return (
    <section className="rounded-md border border-[#E5E7EB] bg-white">
      <div className="flex items-center justify-between border-b border-[#E5E7EB] px-3 py-2.5">
        <EstimateDateTabs activeTab={activeDateTab} onTabChange={onDateTabChange} />
        <button
          type="button"
          className="inline-flex size-7 items-center justify-center rounded text-[#0F8B8D] hover:bg-[#F3F4F6]"
          aria-label="Table settings"
        >
          <Settings2 className="size-4" />
        </button>
      </div>

      <Table className="min-w-[1040px]">
        <TableHeader className="bg-white">
          <TableRow className="hover:bg-white">
            <TableHead className="w-8">
              <input type="checkbox" aria-label="Select all estimates" />
            </TableHead>
            <TableHead><SortHead label="ID" /></TableHead>
            <TableHead><SortHead label="Product/Service" /></TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Ticket/Lead Reference</TableHead>
            <TableHead><SortHead label="Created Date" /></TableHead>
            <TableHead><SortHead label="Total" /></TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="p-0">
                <EstimatesEmptyState />
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <input type="checkbox" aria-label={`Select ${row.id}`} />
                </TableCell>
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.productService}</TableCell>
                <TableCell>{row.customer}</TableCell>
                <TableCell>{row.ticketLeadReference}</TableCell>
                <TableCell>{row.createdDate}</TableCell>
                <TableCell>£{row.total.toFixed(2)}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell>...</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <EstimatePagination pageSize={pageSize} onPageSizeChange={onPageSizeChange} total={rows.length} />
    </section>
  );
}
