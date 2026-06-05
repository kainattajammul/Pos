"use client";

import { ChevronDown } from "lucide-react";
import { InquiryDateTabs } from "@/components/repairs/manage-inquiries/inquiry-date-tabs";
import type { InquiryRecord } from "@/components/repairs/manage-inquiries/manage-inquiries-types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/utils/format";

interface InquiryResultsTableProps {
  rows: InquiryRecord[];
  periodLabel: string;
  activeDateTab: Parameters<typeof InquiryDateTabs>[0]["activeTab"];
  onDateTabChange: Parameters<typeof InquiryDateTabs>[0]["onTabChange"];
  pageSize: number;
  onPageSizeChange: (value: number) => void;
}

export function InquiryResultsTable({
  rows,
  periodLabel,
  activeDateTab,
  onDateTabChange,
  pageSize,
  onPageSizeChange,
}: InquiryResultsTableProps) {
  return (
    <section className="rounded-sm border border-[#E5E7EB] bg-white">
      <div className="flex flex-col gap-3 border-b border-[#E5E7EB] px-3 py-2.5 lg:flex-row lg:items-center lg:justify-between">
        <p className="text-sm font-semibold text-[#111827]">{periodLabel}</p>
        <div className="flex flex-wrap items-center gap-3">
          <InquiryDateTabs activeTab={activeDateTab} onTabChange={onDateTabChange} />
          <label className="relative">
            <select
              value={String(pageSize)}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-8 appearance-none rounded-sm border border-[#E5E7EB] bg-white py-1 pl-3 pr-8 text-xs font-medium text-[#374151]"
            >
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-[#9CA3AF]" />
          </label>
        </div>
      </div>

      <Table className="min-w-[940px]">
        <TableHeader className="bg-white">
          <TableRow className="hover:bg-white">
            <TableHead className="w-8">
              <input type="checkbox" aria-label="Select all inquiries" />
            </TableHead>
            <TableHead>ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Reference</TableHead>
            <TableHead>Inquiry Value</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Created Date</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={8}
                className="h-12 text-sm italic text-[#6AA4A6]"
              >
                No result found
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.id} className="hover:bg-[#FAFAFA]">
                <TableCell>
                  <input type="checkbox" aria-label={`Select ${row.id}`} />
                </TableCell>
                <TableCell className="font-medium text-[#374151]">{row.id}</TableCell>
                <TableCell>{row.customerName}</TableCell>
                <TableCell>{row.reference}</TableCell>
                <TableCell>{formatCurrency(row.inquiryValue)}</TableCell>
                <TableCell>{row.assignedTo}</TableCell>
                <TableCell>{row.createdDate}</TableCell>
                <TableCell>{row.status}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </section>
  );
}
