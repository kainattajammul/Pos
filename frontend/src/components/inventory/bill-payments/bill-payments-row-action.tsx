"use client";

import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { BillPaymentRecord } from "@/components/inventory/bill-payments/bill-payments-types";

interface BillPaymentsRowActionProps {
  row: BillPaymentRecord;
  onEdit?: (row: BillPaymentRecord) => void;
  onDelete?: (row: BillPaymentRecord) => void;
}

export function BillPaymentsRowAction({
  row,
  onEdit,
  onDelete,
}: BillPaymentsRowActionProps) {
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
      <DropdownMenuContent align="end" className="w-36 border border-[#E5E7EB] bg-white">
        <DropdownMenuItem
          className="cursor-pointer text-sm"
          onClick={() => onEdit?.(row)}
        >
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer text-sm text-[#DC2626]"
          onClick={() => onDelete?.(row)}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
