"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Banknote,
  CreditCard,
  Landmark,
  ShoppingBag,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCartMoney } from "@/lib/repair-cart";
import type { RepairCartLineItem, RepairCartTotals } from "@/lib/repair-cart";
import type { RepairTicketSnapshot } from "@/lib/repair-ticket-snapshot";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type PaymentMethod = "cash" | "card" | "store_credit";

const PAYMENT_METHODS: {
  id: PaymentMethod;
  label: string;
  icon: typeof Banknote;
}[] = [
  { id: "cash", label: "Cash", icon: Banknote },
  { id: "card", label: "Card", icon: CreditCard },
  { id: "store_credit", label: "Store credit", icon: Landmark },
];

const fieldClass =
  "h-10 w-full rounded-md border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#1f2a44] focus:outline-none focus:ring-1 focus:ring-[#1f2a44]/30";

interface RepairsCheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  snapshot: RepairTicketSnapshot;
  cartLineItems: RepairCartLineItem[];
  cartTotals: RepairCartTotals;
  ticketConfirmed: boolean;
  onComplete?: () => void;
}

export function RepairsCheckoutDialog({
  open,
  onOpenChange,
  snapshot,
  cartLineItems,
  cartTotals,
  ticketConfirmed,
  onComplete,
}: RepairsCheckoutDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [amountTendered, setAmountTendered] = useState("");
  const [reference, setReference] = useState("");

  const amountDue = useMemo(() => {
    if (ticketConfirmed && cartTotals.total > 0) {
      return cartTotals.total;
    }
    const draft = Number.parseFloat(snapshot.repairCharges);
    return Number.isFinite(draft) && draft > 0 ? draft : 0;
  }, [ticketConfirmed, cartTotals.total, snapshot.repairCharges]);

  const displayLines = useMemo(() => {
    if (ticketConfirmed && cartLineItems.length > 0) {
      return cartLineItems;
    }
    if (amountDue <= 0) return [];
    return [
      {
        id: "checkout-draft",
        kind: "service" as const,
        qty: 1,
        name: snapshot.serviceName,
        price: amountDue,
        tax: 0,
        total: amountDue,
      },
    ];
  }, [ticketConfirmed, cartLineItems, amountDue, snapshot.serviceName]);

  useEffect(() => {
    if (!open) return;
    setPaymentMethod("cash");
    setReference("");
    setAmountTendered(amountDue > 0 ? amountDue.toFixed(2) : "");
  }, [open, amountDue]);

  const tenderedValue = Number.parseFloat(amountTendered) || 0;
  const changeDue =
    paymentMethod === "cash" && tenderedValue > amountDue
      ? tenderedValue - amountDue
      : 0;
  const canSubmit =
    amountDue > 0 &&
    (paymentMethod !== "cash" || tenderedValue >= amountDue);

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (amountDue <= 0) {
      toast.error("Nothing to charge", {
        description: "Confirm the repair ticket and add items before checkout.",
      });
      return;
    }
    if (!canSubmit) {
      toast.error("Insufficient payment", {
        description: "Amount tendered must cover the total due.",
      });
      return;
    }

    const methodLabel =
      PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label ?? "Payment";

    toast.success("Payment complete", {
      description: `${formatCartMoney(amountDue)} collected via ${methodLabel} for ticket ${snapshot.ticketId}.`,
    });
    onComplete?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/55 supports-backdrop-filter:backdrop-blur-[2px]"
        className="flex max-h-[min(90vh,800px)] w-[calc(100%-2rem)] max-w-2xl flex-col gap-0 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white p-0 shadow-xl sm:max-w-2xl"
      >
        <div className="flex items-start justify-between border-b border-[#E5E7EB] px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#1f2a44] text-white">
              <ShoppingBag className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-[#111827]">
                Checkout
              </DialogTitle>
              <p className="mt-1 text-sm text-[#6B7280]">
                Collect payment for ticket {snapshot.ticketId}.
              </p>
            </div>
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

        <form
          id="repairs-checkout-form"
          onSubmit={handleComplete}
          className="min-h-0 flex-1 space-y-5 overflow-auto px-5 py-5"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-[#E5E7EB] bg-pos-page px-4 py-3">
              <p className="text-xs font-medium text-[#6B7280]">Customer</p>
              <p className="mt-1 text-sm font-semibold text-[#111827]">
                {snapshot.customerName}
              </p>
            </div>
            <div className="rounded-lg border border-[#E5E7EB] bg-pos-page px-4 py-3">
              <p className="text-xs font-medium text-[#6B7280]">Device</p>
              <p className="mt-1 text-sm font-semibold text-[#111827]">
                {snapshot.deviceTitle}
              </p>
            </div>
          </div>

          {!ticketConfirmed ? (
            <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Confirm the repair ticket in the workflow to load cart line items.
              Checkout uses the repair charge as a draft total until then.
            </p>
          ) : null}

          <div className="overflow-hidden rounded-lg border border-[#E5E7EB]">
            <table className="w-full text-sm">
              <thead className="bg-pos-page text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                <tr>
                  <th className="px-4 py-2.5">Item</th>
                  <th className="px-3 py-2.5 text-right">Qty</th>
                  <th className="px-4 py-2.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {displayLines.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-8 text-center text-[#6B7280]"
                    >
                      No items to charge. Complete the repair workflow first.
                    </td>
                  </tr>
                ) : (
                  displayLines.map((line) => (
                    <tr key={line.id} className="border-t border-[#F3F4F6]">
                      <td className="px-4 py-3 text-[#111827]">{line.name}</td>
                      <td className="px-3 py-3 text-right text-[#374151]">
                        {line.qty}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-[#111827]">
                        {formatCartMoney(line.total)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="ml-auto w-full max-w-xs space-y-2 rounded-lg border border-[#E5E7EB] bg-pos-page p-4 text-sm">
            <div className="flex justify-between text-[#374151]">
              <span>Subtotal</span>
              <span>
                {formatCartMoney(
                  ticketConfirmed ? cartTotals.subTotal : amountDue,
                )}
              </span>
            </div>
            {ticketConfirmed && cartTotals.discount > 0 ? (
              <div className="flex justify-between text-[#374151]">
                <span>Discount</span>
                <span>-{formatCartMoney(cartTotals.discount)}</span>
              </div>
            ) : null}
            {ticketConfirmed && cartTotals.tax > 0 ? (
              <div className="flex justify-between text-[#374151]">
                <span>Tax</span>
                <span>{formatCartMoney(cartTotals.tax)}</span>
              </div>
            ) : null}
            <div className="flex justify-between border-t border-[#E5E7EB] pt-2 text-base font-semibold text-[#111827]">
              <span>Amount due</span>
              <span>{formatCartMoney(amountDue)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-[#374151]">
              Payment method
            </Label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {PAYMENT_METHODS.map(({ id, label, icon: Icon }) => {
                const selected = paymentMethod === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setPaymentMethod(id);
                      if (id === "cash") {
                        setAmountTendered(amountDue.toFixed(2));
                      }
                    }}
                    className={cn(
                      "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium transition-all",
                      selected
                        ? "border-[#1f2a44] bg-[#1f2a44] text-white shadow-sm"
                        : "border-[#E5E7EB] bg-white text-[#374151] shadow-sm hover:bg-pos-page",
                    )}
                  >
                    <Icon className="size-4" />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {paymentMethod === "cash" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="amount-tendered" className="text-xs font-medium">
                  Amount tendered
                </Label>
                <Input
                  id="amount-tendered"
                  type="number"
                  min={0}
                  step="0.01"
                  value={amountTendered}
                  onChange={(e) => setAmountTendered(e.target.value)}
                  className={fieldClass}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-[#6B7280]">
                  Change due
                </Label>
                <div className="flex h-10 items-center rounded-md border border-[#E5E7EB] bg-pos-page px-3 text-sm font-semibold text-[#111827]">
                  {formatCartMoney(changeDue)}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="payment-reference" className="text-xs font-medium">
                {paymentMethod === "card"
                  ? "Authorization / last 4 digits"
                  : "Store credit reference"}
              </Label>
              <Input
                id="payment-reference"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder={
                  paymentMethod === "card" ? "e.g. Auth 482910" : "Credit note #"
                }
                className={fieldClass}
              />
            </div>
          )}
        </form>

        <div className="flex flex-wrap justify-end gap-2 border-t border-[#E5E7EB] px-5 py-4">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#374151] shadow-sm hover:bg-pos-page"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="repairs-checkout-form"
            disabled={!canSubmit}
            className="inline-flex min-h-10 items-center justify-center rounded-lg px-5 text-sm font-medium text-white shadow-sm hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: "#1f2a44" }}
          >
            Complete payment
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
