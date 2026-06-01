"use client";

import { useMemo, useState } from "react";
import { Eye, Search, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  formatRecordDate,
  formatRecordMoney,
  getRepairInvoicesList,
  getRepairTicketsList,
  type RepairInvoiceRecord,
  type RepairTicketRecord,
} from "@/lib/repairs-records-demo-data";
import type { RepairTicketSnapshot } from "@/lib/repair-ticket-snapshot";
import { cn } from "@/lib/utils";

type RecordsVariant = "tickets" | "invoices";

interface RepairsRecordsListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant: RecordsVariant;
  currentSnapshot?: RepairTicketSnapshot | null;
  onViewTicket?: (record: RepairTicketRecord) => void;
  onViewInvoice?: (record: RepairInvoiceRecord) => void;
}

function statusClassName(status: string): string {
  switch (status) {
    case "Open":
    case "Unpaid":
      return "bg-amber-50 text-amber-800 ring-amber-200";
    case "In Progress":
      return "bg-blue-50 text-blue-800 ring-blue-200";
    case "Ready":
      return "bg-emerald-50 text-emerald-800 ring-emerald-200";
    case "Paid":
    case "Closed":
      return "bg-zinc-100 text-zinc-700 ring-zinc-200";
    default:
      return "bg-zinc-100 text-zinc-700 ring-zinc-200";
  }
}

export function RepairsRecordsListDialog({
  open,
  onOpenChange,
  variant,
  currentSnapshot,
  onViewTicket,
  onViewInvoice,
}: RepairsRecordsListDialogProps) {
  const [query, setQuery] = useState("");

  const title = variant === "tickets" ? "View Tickets" : "View Invoices";
  const tickets = useMemo(
    () => getRepairTicketsList(currentSnapshot),
    [currentSnapshot],
  );
  const invoices = useMemo(
    () => getRepairInvoicesList(currentSnapshot),
    [currentSnapshot],
  );

  const normalizedQuery = query.trim().toLowerCase();

  const filteredTickets = useMemo(() => {
    if (!normalizedQuery) return tickets;
    return tickets.filter((row) =>
      [row.ticketNumber, row.customerName, row.deviceTitle, row.serviceName, row.status]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [tickets, normalizedQuery]);

  const filteredInvoices = useMemo(() => {
    if (!normalizedQuery) return invoices;
    return invoices.filter((row) =>
      [
        row.invoiceNumber,
        row.ticketNumber,
        row.customerName,
        row.deviceTitle,
        row.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [invoices, normalizedQuery]);

  const rows = variant === "tickets" ? filteredTickets : filteredInvoices;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setQuery("");
        onOpenChange(next);
      }}
    >
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/55 supports-backdrop-filter:backdrop-blur-[2px]"
        className="flex max-h-[min(90vh,720px)] w-[calc(100%-2rem)] max-w-3xl flex-col gap-0 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white p-0 shadow-xl sm:max-w-3xl"
      >
        <div className="flex items-start justify-between border-b border-[#E5E7EB] px-5 py-4">
          <div>
            <DialogTitle className="text-lg font-semibold text-[#111827]">
              {title}
            </DialogTitle>
            <p className="mt-1 text-sm text-[#6B7280]">
              {variant === "tickets"
                ? "Browse repair tickets and open a receipt preview."
                : "Browse invoices linked to repair tickets."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-md p-1 text-[#6B7280] transition-colors hover:bg-[#F3F4F6] hover:text-[#111827]"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="border-b border-[#E5E7EB] px-5 py-3">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#9CA3AF]" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                variant === "tickets"
                  ? "Search ticket #, customer, device..."
                  : "Search invoice #, ticket #, customer..."
              }
              className="h-10 border-[#E5E7EB] bg-[#F9FAFB] pl-9"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="sticky top-0 z-10 bg-[#F9FAFB] text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
              <tr className="border-b border-[#E5E7EB]">
                <th className="px-5 py-3">
                  {variant === "tickets" ? "Ticket #" : "Invoice #"}
                </th>
                <th className="px-3 py-3">Customer</th>
                <th className="px-3 py-3">Device</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Total</th>
                <th className="px-3 py-3">Date</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-[#6B7280]"
                  >
                    No {variant === "tickets" ? "tickets" : "invoices"} match your
                    search.
                  </td>
                </tr>
              ) : variant === "tickets" ? (
                (rows as RepairTicketRecord[]).map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-[#F3F4F6] transition-colors hover:bg-[#F9FAFB]"
                  >
                    <td className="px-5 py-3 font-medium text-[#111827]">
                      {row.ticketNumber}
                    </td>
                    <td className="px-3 py-3 text-[#374151]">{row.customerName}</td>
                    <td className="px-3 py-3 text-[#374151]">{row.deviceTitle}</td>
                    <td className="px-3 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
                          statusClassName(row.status),
                        )}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-medium text-[#111827]">
                      {formatRecordMoney(row.total)}
                    </td>
                    <td className="px-3 py-3 text-[#6B7280]">
                      {formatRecordDate(row.createdAt)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => onViewTicket?.(row)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-xs font-medium text-[#374151] shadow-sm hover:bg-[#F9FAFB]"
                      >
                        <Eye className="size-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                (rows as RepairInvoiceRecord[]).map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-[#F3F4F6] transition-colors hover:bg-[#F9FAFB]"
                  >
                    <td className="px-5 py-3 font-medium text-[#111827]">
                      {row.invoiceNumber}
                    </td>
                    <td className="px-3 py-3 text-[#374151]">{row.customerName}</td>
                    <td className="px-3 py-3 text-[#374151]">{row.deviceTitle}</td>
                    <td className="px-3 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
                          statusClassName(row.status),
                        )}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-medium text-[#111827]">
                      {formatRecordMoney(row.total)}
                    </td>
                    <td className="px-3 py-3 text-[#6B7280]">
                      {formatRecordDate(row.createdAt)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => onViewInvoice?.(row)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-xs font-medium text-[#374151] shadow-sm hover:bg-[#F9FAFB]"
                      >
                        <Eye className="size-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
