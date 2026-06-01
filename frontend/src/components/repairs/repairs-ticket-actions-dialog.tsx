"use client";

import {
  FileSearch,
  Mail,
  Plus,
  Printer,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  TICKET_ACTION_ITEMS,
  type TicketActionId,
} from "@/lib/repairs-ticket-actions-data";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRepairTicket } from "@/contexts/repair-ticket-context";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ACTION_ICONS: Record<TicketActionId, LucideIcon> = {
  "print-label": Printer,
  "print-service-receipt": Printer,
  "print-thermal-receipt": Printer,
  "view-ticket": FileSearch,
  "email-ticket": Mail,
  "new-sale": Plus,
};

interface RepairsTicketActionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAction?: (actionId: TicketActionId) => void;
}

export function RepairsTicketActionsDialog({
  open,
  onOpenChange,
  onAction,
}: RepairsTicketActionsDialogProps) {
  const { openPdfPreview } = useRepairTicket();

  const handleAction = (id: TicketActionId, label: string) => {
    onAction?.(id);

    if (id === "print-label") {
      onOpenChange(false);
      openPdfPreview("label");
      return;
    }

    if (id === "print-thermal-receipt") {
      onOpenChange(false);
      openPdfPreview("thermal");
      return;
    }

    if (id === "email-ticket") {
      onOpenChange(false);
      onAction?.(id);
      return;
    }

    if (id === "new-sale") {
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem("repair-pos-current-ticket");
      }
      toast.message("New sale", {
        description: "Starting a new sale. Ticket number will refresh on the next ticket.",
      });
      return;
    }

    toast.message(label, {
      description: "This action will be connected to your ticket flow.",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/55 supports-backdrop-filter:backdrop-blur-[2px]"
        className="w-[calc(100%-2rem)] max-w-lg gap-0 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white p-0 shadow-xl sm:max-w-lg"
      >
        <div className="flex items-start justify-between border-b border-[#E5E7EB] px-5 py-4">
          <DialogTitle className="text-lg font-semibold text-[#111827]">Ticket</DialogTitle>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-md p-1 text-[#6B7280] transition-colors hover:bg-[#F3F4F6] hover:text-[#111827]"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="px-5 py-6">
          <p className="mb-6 text-center text-sm text-[#6B7280]">
            You probably want to do one of the following
          </p>

          <div className="grid grid-cols-2 gap-4">
            {TICKET_ACTION_ITEMS.map((item) => {
              const Icon = ACTION_ICONS[item.id];
              const isPrimary = item.variant === "primary";

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleAction(item.id, item.label)}
                  className={cn(
                    "flex min-h-[108px] flex-col items-center justify-center gap-3 rounded-lg border px-3 py-4 text-center transition-all",
                    isPrimary
                      ? "border-[var(--repair-primary)] bg-[var(--repair-primary)] text-[var(--repair-on-primary)] shadow-md hover:opacity-90"
                      : "border-[#E5E7EB] bg-white text-[#374151] shadow-sm hover:border-[var(--repair-primary)] hover:shadow-md",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-9",
                      isPrimary ? "text-[var(--repair-on-primary)]" : "text-[#374151]",
                    )}
                    strokeWidth={1.5}
                  />
                  <span
                    className={cn(
                      "text-xs font-medium leading-tight",
                      isPrimary && "text-[var(--repair-on-primary)]",
                    )}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
