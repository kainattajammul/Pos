"use client";

import { ChevronDown, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LeadActionDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className="h-9 rounded-sm border-[#E5E7EB] bg-white px-3 text-sm font-medium text-[#374151] hover:bg-pos-page"
          />
        }
      >
        <Wrench className="size-4 text-[#EF4444]" />
        Action
        <ChevronDown className="size-4 text-[#9CA3AF]" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px]">
        <DropdownMenuItem onClick={() => console.log("Bulk Update")}>
          Bulk Update
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => console.log("Delete Selected")}>
          Delete Selected
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => console.log("Export Selected")}>
          Export Selected
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
