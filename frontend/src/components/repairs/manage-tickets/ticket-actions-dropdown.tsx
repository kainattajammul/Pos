"use client";

import { Ellipsis, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const TICKET_ACTIONS = [
  "View",
  "Transfer Ticket",
  "View / Add Comment",
  "Checkout",
  "Email Receipt",
  "Print",
] as const;

interface TicketActionsDropdownProps {
  onView?: () => void;
  onTransferTicket?: () => void;
  onViewAddComment?: () => void;
}

export function TicketActionsDropdown({
  onView,
  onTransferTicket,
  onViewAddComment,
}: TicketActionsDropdownProps) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        className="inline-flex size-7 items-center justify-center rounded text-[#10A7A8] transition-colors hover:bg-[#E6FFFB]"
        aria-label="Edit ticket"
      >
        <Pencil className="size-3.5" />
      </button>
      <button
        type="button"
        className="inline-flex size-7 items-center justify-center rounded text-[#10A7A8] transition-colors hover:bg-[#E6FFFB]"
        aria-label="Delete ticket"
      >
        <Trash2 className="size-3.5" />
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="size-7 text-[#6B7280] hover:bg-[#F3F4F6]"
              aria-label="Open ticket actions menu"
            />
          }
        >
          <Ellipsis className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={6}
          className="w-44 rounded-sm border border-[#E5E7EB] bg-white p-0 shadow-lg"
        >
          {TICKET_ACTIONS.map((action) => (
            <DropdownMenuItem
              key={action}
              onClick={() => {
                if (action === "View") onView?.();
                if (action === "Transfer Ticket") onTransferTicket?.();
                if (action === "View / Add Comment") onViewAddComment?.();
              }}
              className={cn(
                "cursor-pointer rounded-none px-3 py-2 text-sm font-medium text-[#374151] focus:bg-[#F3F4F6] focus:text-[#111827]",
                action === "Transfer Ticket" &&
                  "data-highlighted:bg-[color-mix(in_srgb,var(--repair-primary)_12%,white)] data-highlighted:text-(--repair-primary)",
              )}
            >
              {action}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
