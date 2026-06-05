"use client";

import { Settings } from "lucide-react";
import { InvoiceDateTabs } from "@/components/repairs/manage-invoices/invoice-date-tabs";
import { InvoiceActions } from "@/components/repairs/manage-invoices/invoice-actions";
import type {
  InvoiceDateTab,
  InvoiceRecord,
} from "@/components/repairs/manage-invoices/manage-invoices-types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/utils/format";

interface InvoiceTableProps {
  rows: InvoiceRecord[];
  activeDateTab: InvoiceDateTab;
  onDateTabChange: (tab: InvoiceDateTab) => void;
}

export function InvoiceTable({ rows, activeDateTab, onDateTabChange }: InvoiceTableProps) {
  return (
    <section className="rounded-sm border border-[#E5E7EB] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E7EB] px-3 py-2.5">
        <InvoiceDateTabs activeTab={activeDateTab} onTabChange={onDateTabChange} />
        <button
          type="button"
          className="flex size-8 items-center justify-center rounded-sm border border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-pos-page"
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
              <TableHead className="text-xs font-semibold text-[#374151]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0
              ? Array.from({ length: 3 }).map((_, i) => (
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
                    <TableCell className="text-sm text-[#374151]">{formatCurrency(row.paid)}</TableCell>
                    <TableCell className="text-sm text-[#374151]">{formatCurrency(row.due)}</TableCell>
                    <TableCell className="text-sm font-medium text-[#374151]">
                      {formatCurrency(row.total)}
                    </TableCell>
                    <TableCell>
                      <InvoiceActions invoiceId={row.id} />
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
