"use client";

import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { RefurbishmentBatchLineItem } from "@/components/inventory/refurbishment-batch/refurbishment-batch-create-types";

const ACTIONS = ["View", "Edit", "Remove"] as const;

interface RefurbishmentBatchLineActionDropdownProps {
  row: RefurbishmentBatchLineItem;
  onView: (row: RefurbishmentBatchLineItem) => void;
  onEdit: (row: RefurbishmentBatchLineItem) => void;
  onRemove: (row: RefurbishmentBatchLineItem) => void;
}

export function RefurbishmentBatchLineActionDropdown({
  row,
  onView,
  onEdit,
  onRemove,
}: RefurbishmentBatchLineActionDropdownProps) {
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
      <DropdownMenuContent align="end" className="w-32 border border-[#E5E7EB] bg-white">
        {ACTIONS.map((action) => (
          <DropdownMenuItem
            key={action}
            className="cursor-pointer text-sm text-[#374151]"
            onClick={() => {
              if (action === "View") onView(row);
              else if (action === "Edit") onEdit(row);
              else onRemove(row);
            }}
          >
            {action}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
