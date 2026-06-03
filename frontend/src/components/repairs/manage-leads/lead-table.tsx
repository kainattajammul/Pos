"use client";

import { MoreHorizontal, Settings } from "lucide-react";
import { LeadDateTabs } from "@/components/repairs/manage-leads/lead-date-tabs";
import type { LeadDateTab, LeadRecord } from "@/components/repairs/manage-leads/manage-leads-types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

function money(amount: number) {
  return `£${amount.toFixed(2)}`;
}

interface LeadTableProps {
  rows: LeadRecord[];
  activeDateTab: LeadDateTab;
  onDateTabChange: (tab: LeadDateTab) => void;
}

export function LeadTable({ rows, activeDateTab, onDateTabChange }: LeadTableProps) {
  return (
    <section className="rounded-sm border border-[#E5E7EB] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E7EB] px-3 py-2.5">
        <LeadDateTabs activeTab={activeDateTab} onTabChange={onDateTabChange} />
        <button
          type="button"
          className="flex size-8 items-center justify-center rounded-sm border border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#F9FAFB]"
          aria-label="Table settings"
        >
          <Settings className="size-4" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <Table className="min-w-[1100px]">
          <TableHeader className="bg-white">
            <TableRow className="hover:bg-white">
              <TableHead className="text-xs font-semibold text-[#374151]">ID</TableHead>
              <TableHead className="text-xs font-semibold text-[#374151]">Reference</TableHead>
              <TableHead className="text-xs font-semibold text-[#374151]">Created Date</TableHead>
              <TableHead className="text-xs font-semibold text-[#374151]">Customer</TableHead>
              <TableHead className="text-xs font-semibold text-[#374151]">Organization</TableHead>
              <TableHead className="text-xs font-semibold text-[#374151]">Invoice Status</TableHead>
              <TableHead className="text-xs font-semibold text-[#374151]">Paid</TableHead>
              <TableHead className="text-xs font-semibold text-[#374151]">Due</TableHead>
              <TableHead className="text-xs font-semibold text-[#374151]">Total</TableHead>
              <TableHead className="text-xs font-semibold text-[#374151]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0
              ? Array.from({ length: 2 }).map((_, i) => (
                  <TableRow key={`empty-${i}`} className="h-10 hover:bg-white">
                    <TableCell colSpan={10} className="border-b border-[#E5E7EB]" />
                  </TableRow>
                ))
              : rows.map((row) => (
                  <TableRow key={row.id} className="hover:bg-[#FAFAFA]">
                    <TableCell className="text-sm text-[#374151]">{row.id}</TableCell>
                    <TableCell className="text-sm text-[#374151]">{row.reference}</TableCell>
                    <TableCell className="text-sm text-[#374151]">{row.createdDate}</TableCell>
                    <TableCell className="text-sm text-[#374151]">{row.customer}</TableCell>
                    <TableCell className="text-sm text-[#374151]">{row.organization}</TableCell>
                    <TableCell className="text-sm text-[#374151]">{row.invoiceStatus}</TableCell>
                    <TableCell className="text-sm text-[#374151]">{money(row.paid)}</TableCell>
                    <TableCell className="text-sm text-[#374151]">{money(row.due)}</TableCell>
                    <TableCell className="text-sm font-medium text-[#374151]">
                      {money(row.total)}
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="size-8 text-[#6B7280]"
                        aria-label={`Actions for ${row.id}`}
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
