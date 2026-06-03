"use client";

import { useEffect, useState } from "react";
import { Shield, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RepairTicketSnapshot } from "@/lib/repair-ticket-snapshot";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const WARRANTY_TYPES = [
  { value: "manufacturer", label: "Manufacturer warranty" },
  { value: "store", label: "Store warranty" },
  { value: "extended", label: "Extended protection plan" },
] as const;

const fieldClass =
  "h-10 w-full rounded-md border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#1f2a44] focus:outline-none focus:ring-1 focus:ring-[#1f2a44]/30";

interface RepairsWarrantyClaimDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  snapshot: RepairTicketSnapshot;
}

export function RepairsWarrantyClaimDialog({
  open,
  onOpenChange,
  snapshot,
}: RepairsWarrantyClaimDialogProps) {
  const [warrantyType, setWarrantyType] = useState<string>("manufacturer");
  const [issueDescription, setIssueDescription] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [proofReference, setProofReference] = useState("");

  useEffect(() => {
    if (!open) return;
    setWarrantyType("manufacturer");
    setIssueDescription(
      snapshot.diagnosticNote ||
        "Device issue covered under warranty — describe symptoms and when they started.",
    );
    setPurchaseDate("");
    setProofReference("");
  }, [open, snapshot]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueDescription.trim()) {
      toast.error("Please describe the warranty issue");
      return;
    }
    toast.success("Warranty claim submitted", {
      description: `Claim for ticket ${snapshot.ticketId} has been recorded.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/55 supports-backdrop-filter:backdrop-blur-[2px]"
        className="flex max-h-[min(90vh,720px)] w-[calc(100%-2rem)] max-w-2xl flex-col gap-0 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white p-0 shadow-xl sm:max-w-2xl"
      >
        <div className="flex items-start justify-between border-b border-[#E5E7EB] px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#EEF2FF] text-[#1f2a44]">
              <Shield className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-[#111827]">
                Warranty Claim
              </DialogTitle>
              <p className="mt-1 text-sm text-[#6B7280]">
                Submit a warranty claim for this repair ticket.
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
          id="warranty-claim-form"
          onSubmit={handleSubmit}
          className="min-h-0 flex-1 space-y-4 overflow-auto px-5 py-5"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-[#6B7280]">Ticket #</Label>
              <Input
                readOnly
                value={snapshot.ticketId}
                className={cn(fieldClass, "bg-[#F9FAFB]")}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-[#6B7280]">Customer</Label>
              <Input
                readOnly
                value={snapshot.customerName}
                className={cn(fieldClass, "bg-[#F9FAFB]")}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-medium text-[#6B7280]">Device</Label>
              <Input
                readOnly
                value={snapshot.deviceTitle}
                className={cn(fieldClass, "bg-[#F9FAFB]")}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-medium text-[#6B7280]">
                {snapshot.imeiSerialLabel}
              </Label>
              <Input
                readOnly
                value={snapshot.imeiSerialValue}
                className={cn(fieldClass, "bg-[#F9FAFB]")}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-[#374151]">
              Warranty type
            </Label>
            <Select
              value={warrantyType}
              onValueChange={(v: string | null) => {
                if (v) setWarrantyType(v);
              }}
            >
              <SelectTrigger className={fieldClass}>
                <SelectValue placeholder="Select warranty type" />
              </SelectTrigger>
              <SelectContent>
                {WARRANTY_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-[#374151]">
                Original purchase date
              </Label>
              <Input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className={fieldClass}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-[#374151]">
                Receipt / proof reference
              </Label>
              <Input
                value={proofReference}
                onChange={(e) => setProofReference(e.target.value)}
                placeholder="Receipt # or order ID"
                className={fieldClass}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-[#374151]">
              Issue description
            </Label>
            <textarea
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              rows={4}
              required
              placeholder="Describe the defect and warranty coverage requested..."
              className={cn(
                "w-full resize-y rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827]",
                "placeholder:text-[#9CA3AF] focus:border-[#1f2a44] focus:outline-none focus:ring-1 focus:ring-[#1f2a44]/30",
              )}
            />
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
            form="warranty-claim-form"
            className="inline-flex min-h-10 items-center justify-center rounded-lg px-4 text-sm font-medium text-white shadow-sm hover:brightness-110"
            style={{ backgroundColor: "#1f2a44" }}
          >
            Submit claim
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
