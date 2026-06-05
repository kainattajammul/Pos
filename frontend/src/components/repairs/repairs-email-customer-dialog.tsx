"use client";

import { useEffect, useMemo, useState } from "react";
import { Mail, Paperclip, Send, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  formatReceiptDateTime,
  REPAIR_STORE_NAME,
} from "@/lib/repair-ticket-snapshot";
import type { RepairTicketSnapshot } from "@/lib/repair-ticket-snapshot";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/format";
import { toast } from "sonner";

const fieldClass =
  "h-10 w-full rounded-md border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#1f2a44] focus:outline-none focus:ring-1 focus:ring-[#1f2a44]/30";

function buildDefaultEmailBody(snapshot: RepairTicketSnapshot): string {
  return [
    `Hi ${snapshot.customerName},`,
    "",
    `Thank you for visiting ${REPAIR_STORE_NAME}. Here is an update for your repair ticket ${snapshot.ticketId}.`,
    "",
    `Device: ${snapshot.deviceTitle}`,
    `Service: ${snapshot.serviceName}`,
    `${snapshot.imeiSerialLabel}: ${snapshot.imeiSerialValue}`,
    `Estimated total: ${formatCurrency(Number.parseFloat(snapshot.repairCharges) || 0)}`,
    "",
    snapshot.diagnosticNote
      ? `Notes: ${snapshot.diagnosticNote}`
      : "We will notify you when your device is ready for pickup.",
    "",
    "If you have any questions, reply to this email or call our store.",
    "",
    `— ${REPAIR_STORE_NAME}`,
  ].join("\n");
}

interface RepairsEmailCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  snapshot: RepairTicketSnapshot;
  customerEmail?: string | null;
}

export function RepairsEmailCustomerDialog({
  open,
  onOpenChange,
  snapshot,
  customerEmail,
}: RepairsEmailCustomerDialogProps) {
  const defaultSubject = useMemo(
    () => `Repair update — Ticket ${snapshot.ticketId}`,
    [snapshot.ticketId],
  );

  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState(() => buildDefaultEmailBody(snapshot));
  const [attachReceipt, setAttachReceipt] = useState(true);
  const [attachEstimate, setAttachEstimate] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTo(customerEmail?.trim() ?? "");
    setCc("");
    setSubject(`Repair update — Ticket ${snapshot.ticketId}`);
    setBody(buildDefaultEmailBody(snapshot));
    setAttachReceipt(true);
    setAttachEstimate(false);
  }, [open, snapshot, customerEmail]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const email = to.trim();
    if (!email) {
      toast.error("Recipient email is required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Enter a valid email address");
      return;
    }
    if (!subject.trim()) {
      toast.error("Subject is required");
      return;
    }
    if (!body.trim()) {
      toast.error("Message body is required");
      return;
    }

    toast.success("Email queued", {
      description: `Message to ${email} for ticket ${snapshot.ticketId} will be sent shortly.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/55 supports-backdrop-filter:backdrop-blur-[2px]"
        className="flex max-h-[min(90vh,760px)] w-[calc(100%-2rem)] max-w-2xl flex-col gap-0 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white p-0 shadow-xl sm:max-w-2xl"
      >
        <div className="flex items-start justify-between border-b border-[#E5E7EB] px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#EEF2FF] text-[#1f2a44]">
              <Mail className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-[#111827]">
                Email Customer
              </DialogTitle>
              <p className="mt-1 text-sm text-[#6B7280]">
                Send a repair update to {snapshot.customerName}.
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
          id="email-customer-form"
          onSubmit={handleSend}
          className="min-h-0 flex-1 space-y-4 overflow-auto px-5 py-5"
        >
          <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#374151]">
            <p>
              <span className="font-medium text-[#111827]">Ticket:</span>{" "}
              {snapshot.ticketId}
            </p>
            <p className="mt-1">
              <span className="font-medium text-[#111827]">Updated:</span>{" "}
              {formatReceiptDateTime(snapshot.createdAt)}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email-to" className="text-xs font-medium text-[#374151]">
              To
            </Label>
            <Input
              id="email-to"
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="customer@email.com"
              className={fieldClass}
              required
            />
            {!customerEmail ? (
              <p className="text-xs text-[#6B7280]">
                No email on file — enter the customer&apos;s address manually.
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email-cc" className="text-xs font-medium text-[#374151]">
              CC (optional)
            </Label>
            <Input
              id="email-cc"
              type="email"
              value={cc}
              onChange={(e) => setCc(e.target.value)}
              placeholder="staff@store.com"
              className={fieldClass}
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="email-subject"
              className="text-xs font-medium text-[#374151]"
            >
              Subject
            </Label>
            <Input
              id="email-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={fieldClass}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email-body" className="text-xs font-medium text-[#374151]">
              Message
            </Label>
            <textarea
              id="email-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              required
              className={cn(
                "w-full resize-y rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-sm leading-relaxed text-[#111827]",
                "placeholder:text-[#9CA3AF] focus:border-[#1f2a44] focus:outline-none focus:ring-1 focus:ring-[#1f2a44]/30",
              )}
            />
          </div>

          <div className="space-y-2 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
              <Paperclip className="size-3.5" />
              Attachments
            </p>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-[#374151]">
              <input
                type="checkbox"
                checked={attachReceipt}
                onChange={(e) => setAttachReceipt(e.target.checked)}
                className="size-4 rounded border-[#D1D5DB]"
              />
              Thermal receipt (PDF)
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-[#374151]">
              <input
                type="checkbox"
                checked={attachEstimate}
                onChange={(e) => setAttachEstimate(e.target.checked)}
                className="size-4 rounded border-[#D1D5DB]"
              />
              Estimate (PDF)
            </label>
          </div>
        </form>

        <div className="flex flex-wrap justify-end gap-2 border-t border-[#E5E7EB] px-5 py-4">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#374151] shadow-sm hover:bg-[#F9FAFB]"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="email-customer-form"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium text-white shadow-sm hover:brightness-110"
            style={{ backgroundColor: "#1f2a44" }}
          >
            <Send className="size-4" />
            Send email
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
