"use client";

import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { UnlockingService } from "@/components/inventory/manage-services/unlocking-services-types";

interface UnlockingServicesRowActionProps {
  row: UnlockingService;
  onUpdate?: (row: UnlockingService) => void;
  onClone?: (row: UnlockingService) => void;
  onRemoveFromStore?: (row: UnlockingService) => void;
}

export function UnlockingServicesRowAction({
  row,
  onUpdate,
  onClone,
  onRemoveFromStore,
}: UnlockingServicesRowActionProps) {
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
      <DropdownMenuContent align="end" className="w-44 border border-[#E5E7EB] bg-white">
        <DropdownMenuItem
          className="cursor-pointer text-sm"
          onClick={() => onUpdate?.(row)}
        >
          Update
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer text-sm"
          onClick={() => onClone?.(row)}
        >
          Clone
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer text-sm text-[#DC2626]"
          onClick={() => onRemoveFromStore?.(row)}
        >
          Remove from store
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
