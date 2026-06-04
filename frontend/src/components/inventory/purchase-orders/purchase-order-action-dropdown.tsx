"use client";

import { ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { PurchaseOrderRecord } from "@/components/inventory/purchase-orders/purchase-order-types";

const ACTIONS = [
  "View",
  "Edit",
  "Delete",
  "Mark as Paid",
  "Track Order",
] as const;

interface PurchaseOrderActionDropdownProps {
  row: PurchaseOrderRecord;
  onView?: (row: PurchaseOrderRecord) => void;
  onEdit?: (row: PurchaseOrderRecord) => void;
  onDelete?: (row: PurchaseOrderRecord) => void;
  onMarkPaid?: (row: PurchaseOrderRecord) => void;
  onTrack?: (row: PurchaseOrderRecord) => void;
}

export function PurchaseOrderActionDropdown({
  row,
  onView,
  onEdit,
  onDelete,
  onMarkPaid,
  onTrack,
}: PurchaseOrderActionDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className="h-8 gap-1 rounded-sm border-[#E5E7EB] bg-white px-2.5 text-xs font-medium text-[#374151] hover:bg-[#F9FAFB]"
          />
        }
      >
        Actions
        <ChevronDown className="size-3.5 text-[#9CA3AF]" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 border border-[#E5E7EB] bg-white">
        {ACTIONS.map((action) => (
          <DropdownMenuItem
            key={action}
            className="cursor-pointer text-sm text-[#374151]"
            onClick={() => {
              switch (action) {
                case "View":
                  onView?.(row);
                  break;
                case "Edit":
                  onEdit?.(row);
                  break;
                case "Delete":
                  onDelete?.(row);
                  break;
                case "Mark as Paid":
                  onMarkPaid?.(row);
                  break;
                case "Track Order":
                  onTrack?.(row);
                  break;
              }
              if (!onView && !onEdit && !onDelete && !onMarkPaid && !onTrack) {
                toast.message(`${action}: ${row.orderId}`);
              }
            }}
          >
            {action}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
