"use client";

import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function InquiryActionDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className="h-9 rounded-md border-[#E5E7EB] bg-white px-3 text-sm font-medium text-[#374151] hover:bg-pos-page"
          />
        }
      >
        Action
        <ChevronDown className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 border border-[#E5E7EB] bg-white">
        <DropdownMenuItem className="cursor-pointer">Bulk Update</DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">Delete Selected</DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">Export Selected</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
