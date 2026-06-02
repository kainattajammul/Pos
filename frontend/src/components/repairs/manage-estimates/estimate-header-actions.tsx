"use client";

import { Download, Filter, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EstimateHeaderActionsProps {
  onCreateEstimate: () => void;
}

export function EstimateHeaderActions({ onCreateEstimate }: EstimateHeaderActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        className="h-9 rounded-md border-(--repair-primary) bg-white px-3 text-sm font-semibold text-(--repair-primary)"
      >
        <Filter className="size-4" />
        New Filter
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        className="size-9 rounded-md border-(--repair-primary) bg-white text-(--repair-primary)"
        aria-label="Close filter"
      >
        <X className="size-4" />
      </Button>
      <Button
        type="button"
        variant="outline"
        className="h-9 rounded-md border-[#E5E7EB] bg-white px-3 text-sm font-medium text-[#374151]"
      >
        <Download className="size-4 text-[#7AAE85]" />
        Export
      </Button>
      <Button
        type="button"
        onClick={onCreateEstimate}
        className="h-9 rounded-md border-0 bg-(--repair-primary) px-3 text-sm font-semibold text-(--repair-on-primary) hover:opacity-90"
      >
        <Plus className="size-4" />
        Create Estimate
      </Button>
    </div>
  );
}
