"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Plus, PoundSterling } from "lucide-react";
import { RepairsCustomerSearch } from "@/components/repairs/repairs-customer-search";
import { RepairsNewCustomerDialog } from "@/components/repairs/repairs-new-customer-dialog";
import { useRepairTicket } from "@/contexts/repair-ticket-context";
import { formatCartMoney } from "@/lib/repair-cart";
import { formatReceiptDateTime } from "@/lib/repair-ticket-snapshot";
import {
  getCustomerInitials,
  isWalkinCustomerName,
  WALKIN_CUSTOMER_NAME,
} from "@/lib/repairs-customer-data";
import type { NewCustomerFormValues } from "@/lib/repairs-customer-data";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RepairsCartLineItems } from "@/components/repairs/repairs-cart-line-items";

const VISIBLE_CART_LINES = 5;

export function RepairsCartPanel() {
  const {
    customerName,
    selectCustomer,
    ticketConfirmed,
    displayCartLineItems,
    cartTotals,
    snapshot,
    selectedCategoryLabel,
    detailsForm,
  } = useRepairTicket();
  const [newCustomerOpen, setNewCustomerOpen] = useState(false);
  const [ticketDetailsOpen, setTicketDetailsOpen] = useState(false);

  useEffect(() => {
    if (!ticketConfirmed) {
      setTicketDetailsOpen(false);
    }
  }, [ticketConfirmed]);

  const handleCustomerSaved = (
    customer: NewCustomerFormValues & { displayName: string },
  ) => {
    selectCustomer({
      id: Date.now(),
      firstName: customer.firstName,
      lastName: customer.lastName,
      displayName: customer.displayName,
      email: customer.email,
      phone: customer.phone
        ? `${customer.phoneCountryCode} ${customer.phone}`.trim()
        : null,
      customerGroup: customer.customerGroup,
      taxClass: customer.taxClass,
      city: customer.city.trim() || null,
      state: customer.state.trim() || null,
      country: customer.country,
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  const initials = getCustomerInitials(customerName);
  const isWalkin = isWalkinCustomerName(customerName);

  const displayRows = displayCartLineItems;

  const emptyRowCount =
    displayRows === null
      ? VISIBLE_CART_LINES
      : displayRows.length < VISIBLE_CART_LINES
        ? VISIBLE_CART_LINES - displayRows.length
        : 0;

  const hasCartItems = (displayRows?.length ?? 0) > 0;

  return (
    <>
      <RepairsNewCustomerDialog
        open={newCustomerOpen}
        onOpenChange={setNewCustomerOpen}
        onSave={handleCustomerSaved}
      />

      <aside className="flex min-h-0 w-full flex-col border-r border-[#E5E7EB] bg-white lg:w-[42%] lg:max-w-[42%] lg:shrink-0">
        {/* Customer block */}
        <div className="shrink-0 border-b border-[#E5E7EB] p-3 md:p-4">
          <div className="flex items-center gap-3">
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold"
              style={{
                backgroundColor: "var(--repair-primary-light)",
                color: "var(--repair-primary-light-text)",
              }}
            >
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="truncate text-sm font-semibold text-[#111827]"
                title={customerName}
              >
                {isWalkin ? WALKIN_CUSTOMER_NAME : customerName}
              </p>
              {ticketConfirmed ? (
                <p className="truncate text-xs text-[#6B7280]">Ticket confirmed</p>
              ) : null}
            </div>
            <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:max-w-[240px]">
              <RepairsCustomerSearch />
              <Button
                type="button"
                size="icon-sm"
                onClick={() => setNewCustomerOpen(true)}
                className="size-8 shrink-0 border-0 text-[var(--repair-on-primary)] hover:opacity-90"
                style={{ backgroundColor: "var(--repair-primary)" }}
                aria-label="Add customer"
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        {ticketConfirmed ? (
          <div className="shrink-0 border-b border-[#E5E7EB] px-3 py-2.5 md:px-4">
            <button
              type="button"
              id="repair-ticket-details-trigger"
              aria-expanded={ticketDetailsOpen}
              aria-controls="repair-ticket-details-panel"
              onClick={() => setTicketDetailsOpen((open) => !open)}
              className={cn(
                "flex h-10 w-full items-center justify-between gap-2 rounded-md border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] shadow-none transition-colors",
                "hover:border-[#D1D5DB] hover:bg-[#F9FAFB]",
                "focus-visible:border-[var(--repair-primary)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--repair-primary)]",
                ticketDetailsOpen && "border-[var(--repair-primary)] ring-1 ring-[var(--repair-primary)]",
              )}
            >
              <span className="min-w-0 truncate text-left">
                <span className="font-medium">{snapshot.ticketId}</span>
                <span className="text-[#6B7280]"> · {snapshot.deviceTitle}</span>
              </span>
              <ChevronDown
                className={cn(
                  "size-4 shrink-0 text-[#6B7280] transition-transform",
                  ticketDetailsOpen && "rotate-180",
                )}
                aria-hidden
              />
            </button>

            {ticketDetailsOpen ? (
              <div
                id="repair-ticket-details-panel"
                role="region"
                aria-labelledby="repair-ticket-details-trigger"
                className="mt-2 space-y-2 rounded-md border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2.5 text-xs leading-relaxed text-[#6B7280]"
              >
                {selectedCategoryLabel ? (
                  <div className="flex justify-between gap-2">
                    <span className="shrink-0 text-[#9CA3AF]">Category</span>
                    <span className="text-right font-medium text-[#374151]">
                      {selectedCategoryLabel}
                    </span>
                  </div>
                ) : null}
                <div className="flex justify-between gap-2">
                  <span className="shrink-0 text-[#9CA3AF]">Device</span>
                  <span className="text-right font-medium text-[#111827]">
                    {snapshot.deviceTitle}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="shrink-0 text-[#9CA3AF]">{snapshot.imeiSerialLabel}</span>
                  <span className="text-right font-medium text-[#374151]">
                    {snapshot.imeiSerialValue}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="shrink-0 text-[#9CA3AF]">Assigned</span>
                  <span className="text-right font-medium text-[#374151]">
                    {detailsForm.assignedTo}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="shrink-0 text-[#9CA3AF]">Status</span>
                  <span className="text-right font-medium text-[#374151]">
                    {detailsForm.repairTaskStatus}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="shrink-0 text-[#9CA3AF]">Due</span>
                  <span className="text-right font-medium text-[#374151]">
                    {formatReceiptDateTime(detailsForm.taskDueAt)}
                  </span>
                </div>
                {detailsForm.diagnosticNote.trim() ? (
                  <div className="border-t border-[#E5E7EB] pt-2">
                    <span className="text-[#9CA3AF]">Diagnostic note</span>
                    <p className="mt-1 text-[#374151]">
                      {detailsForm.diagnosticNote.trim()}
                    </p>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Item search */}
        <div className="shrink-0 border-b border-[#E5E7EB] p-3 md:p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter item name, SKU or scan bar code"
              className="h-9 flex-1 border-[#E5E7EB] text-sm"
              disabled={!ticketConfirmed}
            />
            <Button
              type="button"
              variant="outline"
              className="h-9 shrink-0 gap-1 px-2.5 text-xs font-medium hover:opacity-90"
              style={{
                borderColor: "var(--repair-primary)",
                backgroundColor: "var(--repair-primary-light)",
                color: "var(--repair-primary-light-text)",
              }}
              disabled={!ticketConfirmed}
            >
              <PoundSterling className="size-3.5" />
              Advance Search
            </Button>
          </div>
        </div>

        <RepairsCartLineItems
          displayRows={displayRows}
          emptyRowCount={emptyRowCount}
        />

        {/* Summary + total */}
        <div className="shrink-0 space-y-3 px-3 pb-3 md:px-4 md:pb-4">
          <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-3 md:p-4">
            <dl className="space-y-2 text-sm text-[#374151]">
            <div className="flex justify-between">
              <dt>Total Items</dt>
              <dd className="font-medium text-[#111827]">
                {hasCartItems ? cartTotals.itemCount : 0}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt>Sub Total</dt>
              <dd className="font-medium text-[#111827]">
                {hasCartItems ? formatCartMoney(cartTotals.subTotal) : formatCartMoney(0)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt>Discount</dt>
              <dd className="font-medium text-[#111827]">
                {hasCartItems ? formatCartMoney(cartTotals.discount) : formatCartMoney(0)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt>Tax</dt>
              <dd className="font-medium text-[#111827]">
                {hasCartItems ? formatCartMoney(cartTotals.tax) : formatCartMoney(0)}
              </dd>
            </div>
            </dl>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-[#E5E7EB] bg-white px-4 py-3.5 shadow-sm">
            <span className="text-base font-semibold text-[#111827]">Total</span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-[#111827]">
                {hasCartItems ? formatCartMoney(cartTotals.total) : formatCartMoney(0)}
              </span>
              <span className="text-[#9CA3AF]" aria-hidden>
                ▲
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
