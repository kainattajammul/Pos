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
import type { RefurbishmentBatchRecord } from "@/components/inventory/refurbishment-batch/refurbishment-batch-types";

const ROW_ACTIONS = ["View", "Edit", "Delete"] as const;

interface RefurbishmentBatchActionDropdownProps {
  row: RefurbishmentBatchRecord;
  onView?: (row: RefurbishmentBatchRecord) => void;
  onEdit?: (row: RefurbishmentBatchRecord) => void;
  onDelete?: (row: RefurbishmentBatchRecord) => void;
}

export function RefurbishmentBatchActionDropdown({
  row,
  onView,
  onEdit,
  onDelete,
}: RefurbishmentBatchActionDropdownProps) {
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
        Action
        <ChevronDown className="size-3.5 text-[#9CA3AF]" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36 border border-[#E5E7EB] bg-white">
        {ROW_ACTIONS.map((action) => (
          <DropdownMenuItem
            key={action}
            className="cursor-pointer text-sm text-[#374151]"
            onClick={() => {
              if (action === "View") onView?.(row);
              else if (action === "Edit") onEdit?.(row);
              else onDelete?.(row);
              if (!onView && !onEdit && !onDelete) {
                toast.message(`${action}: ${row.batchId}`);
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
