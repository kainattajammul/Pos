"use client";

import { useMemo, useState } from "react";
import { FileText, Printer, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

import { cn } from "@/lib/utils";
import { formatCartMoney } from "@/lib/repair-cart";
import { formatReceiptDateTime, REPAIR_STORE_NAME } from "@/lib/repair-ticket-snapshot";
import type { RepairTicketSnapshot } from "@/lib/repair-ticket-snapshot";
import type { RepairCartLineItem, RepairCartTotals } from "@/lib/repair-cart";
import { toast } from "sonner";

interface RepairsEstimateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  snapshot: RepairTicketSnapshot;
  cartLineItems: RepairCartLineItem[];
  cartTotals: RepairCartTotals;
  ticketConfirmed: boolean;
}

export function RepairsEstimateDialog({
  open,
  onOpenChange,
  snapshot,
  cartLineItems,
  cartTotals,
  ticketConfirmed,
}: RepairsEstimateDialogProps) {
  const estimateNumber = useMemo(
    () => `EST-${snapshot.ticketId.replace(/^T-/, "")}`,
    [snapshot.ticketId],
  );
  const [notes, setNotes] = useState(
    "This estimate is valid for 14 days. Prices may change if additional issues are found during repair.",
  );

  const displayLines = useMemo(() => {
    if (ticketConfirmed && cartLineItems.length > 0) {
      return cartLineItems;
    }
    const amount = Number.parseFloat(snapshot.repairCharges) || 0;
    return [
      {
        id: "estimate-service",
        kind: "service" as const,
        qty: 1,
        name: snapshot.serviceName,
        price: amount,
        tax: 0,
        total: amount,
      },
    ];
  }, [ticketConfirmed, cartLineItems, snapshot]);

  const subtotal =
    ticketConfirmed && cartLineItems.length > 0
      ? cartTotals.subTotal
      : Number.parseFloat(snapshot.repairCharges) || 0;
  const tax =
    ticketConfirmed && cartLineItems.length > 0 ? cartTotals.tax : 0;
  const total =
    ticketConfirmed && cartLineItems.length > 0
      ? cartTotals.total
      : subtotal + tax;

  const handlePrint = () => {
    toast.success("Estimate ready", {
      description: `${estimateNumber} prepared for ${snapshot.customerName}.`,
    });
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/55 supports-backdrop-filter:backdrop-blur-[2px]"
        className="flex max-h-[min(90vh,760px)] w-[calc(100%-2rem)] max-w-2xl flex-col gap-0 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white p-0 shadow-xl sm:max-w-2xl"
      >
        <div className="flex items-start justify-between border-b border-[#E5E7EB] px-5 py-4">
          <div>
            <DialogTitle className="text-lg font-semibold text-[#111827]">
              Create Estimate
            </DialogTitle>
            <p className="mt-1 text-sm text-[#6B7280]">
              Review line items and share a quote with your customer.
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

        <div className="min-h-0 flex-1 space-y-5 overflow-auto px-5 py-5">
          <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                  {REPAIR_STORE_NAME}
                </p>
                <p className="mt-1 text-lg font-semibold text-[#111827]">
                  {estimateNumber}
                </p>
              </div>
              <div className="text-right text-sm text-[#6B7280]">
                <p>{formatReceiptDateTime(new Date())}</p>
                <p className="mt-1">Ticket {snapshot.ticketId}</p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-[#6B7280]">Customer</p>
                <p className="text-sm font-medium text-[#111827]">
                  {snapshot.customerName}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-[#6B7280]">Device</p>
                <p className="text-sm font-medium text-[#111827]">
                  {snapshot.deviceTitle}
                </p>
              </div>
            </div>
          </div>

          {!ticketConfirmed ? (
            <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Complete the repair workflow to pull confirmed cart line items. Showing
              a draft estimate from the current ticket.
            </p>
          ) : null}

          <div className="overflow-hidden rounded-lg border border-[#E5E7EB]">
            <table className="w-full text-sm">
              <thead className="bg-[#F9FAFB] text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                <tr>
                  <th className="px-4 py-2.5">Item</th>
                  <th className="px-3 py-2.5 text-right">Qty</th>
                  <th className="px-3 py-2.5 text-right">Price</th>
                  <th className="px-4 py-2.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {displayLines.map((line) => (
                  <tr key={line.id} className="border-t border-[#F3F4F6]">
                    <td className="px-4 py-3 text-[#111827]">{line.name}</td>
                    <td className="px-3 py-3 text-right text-[#374151]">
                      {line.qty}
                    </td>
                    <td className="px-3 py-3 text-right text-[#374151]">
                      {formatCartMoney(line.price)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-[#111827]">
                      {formatCartMoney(line.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="ml-auto w-full max-w-xs space-y-2 text-sm">
            <div className="flex justify-between text-[#374151]">
              <span>Subtotal</span>
              <span>{formatCartMoney(subtotal)}</span>
            </div>
            <div className="flex justify-between text-[#374151]">
              <span>Tax</span>
              <span>{formatCartMoney(tax)}</span>
            </div>
            <div className="flex justify-between border-t border-[#E5E7EB] pt-2 text-base font-semibold text-[#111827]">
              <span>Estimate total</span>
              <span>{formatCartMoney(total)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="estimate-notes"
              className="text-sm font-medium text-[#374151]"
            >
              Notes for customer
            </label>
            <textarea
              id="estimate-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className={cn(
                "w-full resize-none rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827]",
                "outline-none focus-visible:border-[#1f2a44] focus-visible:ring-2 focus-visible:ring-[#1f2a44]/20",
              )}
            />
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-[#E5E7EB] px-5 py-4">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#374151] shadow-sm hover:bg-[#F9FAFB]"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              toast.success("Estimate saved", {
                description: `${estimateNumber} saved for ${snapshot.customerName}.`,
              });
              onOpenChange(false);
            }}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#374151] shadow-sm hover:bg-[#F9FAFB]"
          >
            <FileText className="size-4" />
            Save estimate
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium text-white shadow-sm"
            style={{ backgroundColor: "#1f2a44" }}
          >
            <Printer className="size-4" />
            Print estimate
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
