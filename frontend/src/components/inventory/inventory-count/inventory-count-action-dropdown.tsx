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
import type { InventoryCountRecord } from "@/components/inventory/inventory-count/inventory-count-types";

const ROW_ACTIONS = ["View", "Continue", "Edit", "Delete"] as const;

interface InventoryCountActionDropdownProps {
  row: InventoryCountRecord;
  onView?: (row: InventoryCountRecord) => void;
  onContinue?: (row: InventoryCountRecord) => void;
  onEdit?: (row: InventoryCountRecord) => void;
  onDelete?: (row: InventoryCountRecord) => void;
}

export function InventoryCountActionDropdown({
  row,
  onView,
  onContinue,
  onEdit,
  onDelete,
}: InventoryCountActionDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className="h-8 gap-1 rounded-sm border-[#E5E7EB] bg-white px-2.5 text-xs font-medium text-[#374151] hover:bg-pos-page"
          />
        }
      >
        Action
        <ChevronDown className="size-3.5 text-[#9CA3AF]" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 border border-[#E5E7EB] bg-white">
        {ROW_ACTIONS.map((action) => (
          <DropdownMenuItem
            key={action}
            className="cursor-pointer text-sm text-[#374151]"
            onClick={() => {
              switch (action) {
                case "View":
                  onView?.(row);
                  break;
                case "Continue":
                  onContinue?.(row);
                  break;
                case "Edit":
                  onEdit?.(row);
                  break;
                case "Delete":
                  onDelete?.(row);
                  break;
              }
              if (!onView && !onContinue && !onEdit && !onDelete) {
                toast.message(`${action}: ${row.countId}`);
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
