"use client";

import { ChevronDown, FileSpreadsheet, SlidersHorizontal, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const outlineTealBtn =
  "h-9 gap-1.5 rounded-sm border border-(--repair-primary) bg-white px-3 text-sm font-semibold text-(--repair-primary) hover:bg-[#F0FDFA]";

const solidTealBtn =
  "h-9 rounded-sm border-0 bg-(--repair-primary) px-4 text-sm font-semibold text-(--repair-on-primary) shadow-sm hover:opacity-90";

export function RepairsServicesToolbar() {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        className={outlineTealBtn}
        onClick={() => toast.message("New filter — coming soon")}
      >
        <SlidersHorizontal className="size-4" />
        New Filter
      </Button>

      <Button
        type="button"
        variant="outline"
        size="icon"
        className={cn(
          "size-9 rounded-sm border border-(--repair-primary) bg-white text-(--repair-primary) hover:bg-[#F0FDFA]",
        )}
        aria-label="Clear filter"
        onClick={() => toast.message("Clear filter — coming soon")}
      >
        <X className="size-4" />
      </Button>

      <Button
        type="button"
        variant="outline"
        className="h-9 gap-1.5 rounded-sm border border-[#E5E7EB] bg-white px-3 text-sm font-medium text-[#374151] shadow-sm hover:bg-pos-page"
        onClick={() => toast.message("Import/Export — coming soon")}
      >
        <FileSpreadsheet className="size-4 text-[#22C55E]" />
        Import/Export
        <ChevronDown className="size-3.5 text-[#9CA3AF]" />
      </Button>

      <Button
        type="button"
        className={solidTealBtn}
        onClick={() => toast.message("Bulk Price Editor — coming soon")}
      >
        Bulk Price Editor
      </Button>

      <Button
        type="button"
        className={solidTealBtn}
        onClick={() => toast.message("Create Service — coming soon")}
      >
        Create Service
      </Button>
    </div>
  );
}
