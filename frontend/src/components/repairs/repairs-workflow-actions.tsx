"use client";

import { useState } from "react";
import {
  FileText,
  MoreHorizontal,
  Plus,
  Receipt,
  Shield,
  Ticket,
  Trash2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { RepairsTicketActionsDialog } from "@/components/repairs/repairs-ticket-actions-dialog";
import { RepairsViewPdfDialog } from "@/components/repairs/repairs-view-pdf-dialog";
import { useRepairTicket } from "@/contexts/repair-ticket-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function ActionButton({
  label,
  icon: Icon,
  variant = "neutral",
  onClick,
}: {
  label: string;
  icon?: LucideIcon;
  variant?: "neutral" | "primary" | "danger" | "checkout";
  onClick?: () => void;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      className={cn(
        "h-9 gap-1.5 rounded-md text-xs font-medium md:text-sm",
        variant === "neutral" &&
          "border-[#D1D5DB] bg-white text-[#374151] shadow-sm hover:bg-[#F9FAFB]",
        variant === "primary" &&
          "border-[var(--repair-primary)] bg-[var(--repair-primary)] text-[var(--repair-on-primary)] shadow-sm hover:opacity-90",
        variant === "danger" &&
          "border-red-200 bg-red-50 text-red-600 hover:bg-red-100",
        variant === "checkout" &&
          "border-[var(--repair-primary)] bg-[var(--repair-primary)] text-[var(--repair-on-primary)] shadow-sm hover:opacity-90",
      )}
    >
      {Icon ? <Icon className="size-4 shrink-0" /> : null}
      {label}
    </Button>
  );
}

export function RepairsWorkflowActions() {
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const { pdfDialogOpen, pdfKind, snapshot, closePdfPreview } = useRepairTicket();

  return (
    <>
      <RepairsViewPdfDialog
        open={pdfDialogOpen}
        onOpenChange={(open) => {
          if (!open) closePdfPreview();
        }}
        kind={pdfKind}
        snapshot={snapshot}
      />
      <RepairsTicketActionsDialog
        open={ticketDialogOpen}
        onOpenChange={setTicketDialogOpen}
      />

      <div className="shrink-0 space-y-2 border-t border-[#E5E7EB] bg-[#F9FAFB] p-3 md:p-4">
        <div className="flex flex-wrap gap-2">
          <ActionButton icon={Ticket} label="View Tickets" />
          <ActionButton icon={Receipt} label="View Invoices" />
          <ActionButton icon={FileText} label="Create Estimate" />
          <ActionButton
            icon={Plus}
            label="Create Ticket"
            variant="primary"
            onClick={() => setTicketDialogOpen(true)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <ActionButton icon={Shield} label="Warranty Claim" />
          <ActionButton icon={MoreHorizontal} label="More Actions" />
          <ActionButton icon={Trash2} label="Cancel" variant="danger" />
          <ActionButton label="Checkout" variant="checkout" />
        </div>
      </div>
    </>
  );
}
