"use client";

import type { BranchCommunicationSettings, BranchRecord } from "@/lib/branch-types";
import {
  PAYMENT_TERMS_OPTIONS,
} from "@/lib/branch-communication-defaults";
import {
  BranchSectionCard,
  branchInputClass,
  branchSelectClass,
  branchTextareaClass,
} from "@/components/branches/branch-ui-primitives";

interface BranchInvoiceSettingsCardProps {
  branch: BranchRecord;
  onCommunicationChange: (communication: BranchCommunicationSettings) => void;
}

function updateInvoice(
  branch: BranchRecord,
  onCommunicationChange: (communication: BranchCommunicationSettings) => void,
  patch: Partial<BranchCommunicationSettings["invoice"]>,
) {
  onCommunicationChange({
    ...branch.communication,
    invoice: { ...branch.communication.invoice, ...patch },
  });
}

export function BranchInvoiceSettingsCard({
  branch,
  onCommunicationChange,
}: BranchInvoiceSettingsCardProps) {
  const invoice = branch.communication.invoice;

  return (
    <BranchSectionCard
      title="Branch invoice settings"
      description="Numbering, payment terms, and legal text shown on branch invoices."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="text-sm font-medium text-[#374151]">Invoice prefix / numbering format</span>
          <input
            value={invoice.invoicePrefix}
            onChange={(e) =>
              updateInvoice(branch, onCommunicationChange, { invoicePrefix: e.target.value })
            }
            placeholder="INV-MB-"
            className={branchInputClass}
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium text-[#374151]">Next invoice number</span>
          <input
            type="number"
            min={1}
            value={invoice.nextInvoiceNumber}
            onChange={(e) =>
              updateInvoice(branch, onCommunicationChange, {
                nextInvoiceNumber: Number(e.target.value) || 1,
              })
            }
            className={branchInputClass}
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium text-[#374151]">Default payment terms</span>
          <select
            value={invoice.paymentTerms}
            onChange={(e) =>
              updateInvoice(branch, onCommunicationChange, { paymentTerms: e.target.value })
            }
            className={branchSelectClass}
          >
            {PAYMENT_TERMS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium text-[#374151]">Default due days</span>
          <input
            type="number"
            min={0}
            value={invoice.dueDays}
            onChange={(e) =>
              updateInvoice(branch, onCommunicationChange, {
                dueDays: Number(e.target.value) || 0,
              })
            }
            className={branchInputClass}
          />
        </label>
        <label className="space-y-1 sm:col-span-2">
          <span className="text-sm font-medium text-[#374151]">Company / legal name on invoice</span>
          <input
            value={invoice.legalName}
            onChange={(e) =>
              updateInvoice(branch, onCommunicationChange, { legalName: e.target.value })
            }
            placeholder={branch.name}
            className={branchInputClass}
          />
        </label>
        <label className="flex items-center justify-between rounded-md border border-[#E5E7EB] px-3 py-2.5 sm:col-span-2">
          <span className="text-sm font-medium text-[#374151]">Show VAT breakdown on invoices</span>
          <input
            type="checkbox"
            checked={invoice.showVatBreakdown}
            onChange={(e) =>
              updateInvoice(branch, onCommunicationChange, { showVatBreakdown: e.target.checked })
            }
            className="size-4 rounded border-[#D1D5DB]"
          />
        </label>
        <label className="flex items-center justify-between rounded-md border border-[#E5E7EB] px-3 py-2.5 sm:col-span-2">
          <span className="text-sm font-medium text-[#374151]">Show branch address on invoice</span>
          <input
            type="checkbox"
            checked={invoice.showBranchAddress}
            onChange={(e) =>
              updateInvoice(branch, onCommunicationChange, { showBranchAddress: e.target.checked })
            }
            className="size-4 rounded border-[#D1D5DB]"
          />
        </label>
        <label className="space-y-1 sm:col-span-2">
          <span className="text-sm font-medium text-[#374151]">Invoice footer / terms &amp; conditions</span>
          <textarea
            value={invoice.footerTerms}
            onChange={(e) =>
              updateInvoice(branch, onCommunicationChange, { footerTerms: e.target.value })
            }
            placeholder="Payment terms, warranty disclaimers, etc."
            className={branchTextareaClass}
          />
        </label>
        <label className="space-y-1 sm:col-span-2">
          <span className="text-sm font-medium text-[#374151]">Default invoice notes</span>
          <textarea
            value={invoice.defaultNotes}
            onChange={(e) =>
              updateInvoice(branch, onCommunicationChange, { defaultNotes: e.target.value })
            }
            placeholder="Notes appended to new invoices"
            className={branchTextareaClass}
          />
        </label>
      </div>
    </BranchSectionCard>
  );
}
