"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { TicketRow } from "@/components/repairs/manage-tickets/ticket-table";

const LOCATION_OPTIONS = [
  "Main Branch",
  "Bradford Branch",
  "London Branch",
  "Warehouse",
] as const;

const ASSIGNEE_OPTIONS = [
  "Faisal She",
  "Admin User",
  "Repair Staff",
  "Technician",
] as const;

function SelectInput({
  label,
  value,
  options,
  placeholder = "Select",
  error,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  placeholder?: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-[#4B5563]">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "h-10 w-full appearance-none rounded-md border border-[#E5E7EB] bg-white px-3 pr-9 text-sm text-[#111827] outline-none transition focus:border-(--repair-primary) focus:ring-1 focus:ring-(--repair-primary)",
            !value && "text-[#9CA3AF]",
            error && "border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]",
          )}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-[#9CA3AF]" />
      </div>
      {error ? <p className="text-xs text-[#DC2626]">{error}</p> : null}
    </div>
  );
}

function TextAreaInput({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-[#4B5563]">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-[76px] w-full resize-none rounded-md border border-[#E5E7EB] px-3 py-2 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-(--repair-primary) focus:ring-1 focus:ring-(--repair-primary)"
      />
    </div>
  );
}

interface TransferTicketModalProps {
  open: boolean;
  ticket: TicketRow | null;
  onOpenChange: (open: boolean) => void;
}

export function TransferTicketModal({
  open,
  ticket,
  onOpenChange,
}: TransferTicketModalProps) {
  const [toLocation, setToLocation] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [staffComments, setStaffComments] = useState("");
  const [permanentTransfer, setPermanentTransfer] = useState(false);
  const [errors, setErrors] = useState<{ toLocation?: string; assignedTo?: string }>({});

  const title = useMemo(
    () => `Transfer Ticket # ${ticket?.id ?? ""}`,
    [ticket?.id],
  );

  const resetForm = () => {
    setToLocation("");
    setAssignedTo("");
    setStaffComments("");
    setPermanentTransfer(false);
    setErrors({});
  };

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) resetForm();
  };

  const handleSave = () => {
    const nextErrors: { toLocation?: string; assignedTo?: string } = {};
    if (!toLocation) nextErrors.toLocation = "Please select a location";
    if (!assignedTo) nextErrors.assignedTo = "Please select assignee";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !ticket) return;

    const payload = {
      ticketId: ticket.id,
      toLocation,
      assignedTo,
      staffComments,
      permanentTransfer,
    };
    // Replace with API call when backend endpoint is ready.
    console.log("transfer-ticket-payload", payload);
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[420px] max-w-[calc(100%-1.5rem)] gap-0 overflow-hidden rounded-md border border-[#E5E7EB] bg-white p-0 shadow-2xl sm:max-w-[420px]"
        overlayClassName="bg-black/25"
      >
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-3">
          <DialogTitle className="text-lg font-semibold tracking-tight text-[#374151]">
            {title}
          </DialogTitle>
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            className="rounded p-1 text-[#9CA3AF] transition-colors hover:bg-[#F3F4F6] hover:text-[#6B7280]"
            aria-label="Close transfer ticket dialog"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-3 px-4 py-4">
          <SelectInput
            label="To Location"
            value={toLocation}
            options={LOCATION_OPTIONS}
            error={errors.toLocation}
            onChange={(value) => {
              setToLocation(value);
              setErrors((prev) => ({ ...prev, toLocation: undefined }));
            }}
          />
          <SelectInput
            label="Assigned To"
            value={assignedTo}
            options={ASSIGNEE_OPTIONS}
            error={errors.assignedTo}
            onChange={(value) => {
              setAssignedTo(value);
              setErrors((prev) => ({ ...prev, assignedTo: undefined }));
            }}
          />
          <TextAreaInput
            label="Staff Comments"
            value={staffComments}
            placeholder="Write Here..."
            onChange={setStaffComments}
          />
          <label className="flex items-center gap-2 text-sm font-medium text-[#4B5563]">
            <input
              type="checkbox"
              checked={permanentTransfer}
              onChange={(e) => setPermanentTransfer(e.target.checked)}
              className="size-4 rounded border-[#D1D5DB] text-(--repair-primary) focus:ring-(--repair-primary)"
            />
            Permanent Transfer
          </label>
        </div>

        <div className="flex justify-end border-t border-[#E5E7EB] px-4 py-3">
          <Button
            type="button"
            onClick={handleSave}
            className="h-9 rounded-md border-0 bg-(--repair-primary) px-5 text-sm font-semibold text-(--repair-on-primary) hover:opacity-90"
          >
            <Save className="size-4" />
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
