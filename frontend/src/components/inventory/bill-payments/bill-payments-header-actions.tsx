"use client";

import { ChevronDown, Download, Plus, Settings, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface BillPaymentsHeaderActionsProps {
  filterOpen: boolean;
  onToggleFilter: () => void;
  onAddItem: () => void;
  onBulkDelete?: () => void;
  onBulkUpdate?: () => void;
  onExportSelected?: () => void;
  selectedCount?: number;
}

const tealBtn =
  "h-9 gap-1.5 rounded-sm border-0 bg-(--repair-primary) px-3 text-sm font-semibold text-(--repair-on-primary) shadow-sm hover:opacity-90";

const greyBtn =
  "h-9 gap-1.5 rounded-sm border border-[#E5E7EB] bg-white px-3 text-sm font-medium text-[#374151] shadow-sm hover:bg-[#F9FAFB]";

export function BillPaymentsHeaderActions({
  filterOpen,
  onToggleFilter,
  onAddItem,
  onBulkDelete,
  onBulkUpdate,
  onExportSelected,
  selectedCount = 0,
}: BillPaymentsHeaderActionsProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Button
        type="button"
        className={cn(tealBtn, filterOpen && "ring-2 ring-(--repair-primary)/30")}
        onClick={onToggleFilter}
        aria-expanded={filterOpen}
      >
        Search Filter
        <ChevronDown
          className={cn("size-4 transition-transform", filterOpen && "rotate-180")}
        />
      </Button>

      <div className="flex flex-wrap items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button type="button" className={tealBtn} />}
          >
            <Download className="size-4" />
            <Upload className="size-4" />
            Import / Export
            <ChevronDown className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 border border-[#E5E7EB] bg-white">
            <DropdownMenuItem
              className="cursor-pointer text-sm"
              onClick={() => toast.message("Import Bill Payments — connect file upload when ready")}
            >
              <Upload className="size-4" />
              Import Bill Payments
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer text-sm"
              onClick={() => toast.message("Export Bill Payments — connect export when ready")}
            >
              <Download className="size-4" />
              Export Bill Payments
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button type="button" className={tealBtn} />}
          >
            <Plus className="size-4" />
            Add
            <ChevronDown className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 border border-[#E5E7EB] bg-white">
            <DropdownMenuItem className="cursor-pointer text-sm" onClick={onAddItem}>
              Add Bill Payment Item
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button type="button" className={greyBtn} />}
          >
            <Settings className="size-4" />
            Action
            <ChevronDown className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 border border-[#E5E7EB] bg-white">
            <DropdownMenuItem
              className="cursor-pointer text-sm"
              onClick={() => {
                if (selectedCount === 0) {
                  toast.message("Select rows to bulk delete");
                  return;
                }
                onBulkDelete?.();
              }}
            >
              Bulk Delete
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer text-sm"
              onClick={() => {
                if (selectedCount === 0) {
                  toast.message("Select rows to bulk update");
                  return;
                }
                onBulkUpdate?.();
              }}
            >
              Bulk Update
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer text-sm"
              onClick={() => {
                if (selectedCount === 0) {
                  toast.message("Select rows to export");
                  return;
                }
                onExportSelected?.();
              }}
            >
              Export Selected
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
