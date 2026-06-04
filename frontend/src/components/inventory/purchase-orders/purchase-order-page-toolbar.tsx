"use client";

import { FileSpreadsheet, Filter, Plus, RotateCcw, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PurchaseOrderPageToolbarProps {
  filtersPinned: boolean;
  onToggleFilters: () => void;
  onCloseFilters: () => void;
  onExport: () => void;
}

const outlineBtn =
  "h-9 gap-1.5 rounded-sm border border-[#B9D8D5] bg-white px-3 text-sm font-medium text-[#227E7F] shadow-sm hover:bg-[#F4FBFB]";

export function PurchaseOrderPageToolbar({
  filtersPinned,
  onToggleFilters,
  onCloseFilters,
  onExport,
}: PurchaseOrderPageToolbarProps) {
  const router = useRouter();

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        className={cn(outlineBtn, filtersPinned && "bg-[#F4FBFB]")}
        onClick={onToggleFilters}
      >
        <Filter className="size-4" />
        New Filter
        <span
          role="button"
          tabIndex={0}
          className="inline-flex rounded-sm p-0.5 hover:bg-[#E6F6F6]"
          aria-label="Close filters"
          onClick={(e) => {
            e.stopPropagation();
            onCloseFilters();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              onCloseFilters();
            }
          }}
        >
          <X className="size-3.5 opacity-70" />
        </span>
      </Button>

      <Button type="button" variant="outline" className={outlineBtn} onClick={onExport}>
        <FileSpreadsheet className="size-4 text-[#22C55E]" />
        Export
      </Button>

      <Button
        type="button"
        className="h-9 gap-1.5 rounded-sm border-0 bg-(--repair-primary) px-4 text-sm font-semibold text-(--repair-on-primary) shadow-sm hover:opacity-90"
        onClick={() => router.push("/purchases/new")}
      >
        <Plus className="size-4" />
        Create Purchase Order
      </Button>
    </div>
  );
}

export function PurchaseOrderFilterActions({
  onUnpin,
  onReset,
  onSave,
  onSearch,
}: {
  onUnpin: () => void;
  onReset: () => void;
  onSave: () => void;
  onSearch: () => void;
}) {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#E5E7EB] pt-3">
      <Button
        type="button"
        variant="outline"
        className="h-9 gap-1.5 rounded-sm border-[#B9D8D5] bg-white text-sm font-medium text-[#227E7F] hover:bg-[#F4FBFB]"
        onClick={onUnpin}
      >
        Unpin Filter
      </Button>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#227E7F] hover:underline"
        >
          <RotateCcw className="size-4" />
          Reset
        </button>
        <button
          type="button"
          onClick={onSave}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#227E7F] hover:underline"
        >
          <Save className="size-4" />
          Save Filter
        </button>
        <Button
          type="button"
          className="h-9 min-w-[88px] rounded-sm border-0 bg-(--repair-primary) px-5 text-sm font-semibold text-(--repair-on-primary) hover:opacity-90"
          onClick={onSearch}
        >
          Search
        </Button>
      </div>
    </div>
  );
}
