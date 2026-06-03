"use client";

import { FileSpreadsheet, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LeadActionDropdown } from "@/components/repairs/manage-leads/lead-action-dropdown";

interface LeadHeaderActionsProps {
  filterOpen: boolean;
  onToggleFilter: () => void;
  onNewLeads: () => void;
}

export function LeadHeaderActions({
  filterOpen,
  onToggleFilter,
  onNewLeads,
}: LeadHeaderActionsProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Button
        type="button"
        variant="outline"
        className="h-9 rounded-sm border-[#E5E7EB] bg-white px-3 text-sm font-medium text-[#374151] hover:bg-[#F9FAFB]"
        onClick={onToggleFilter}
        aria-expanded={filterOpen}
      >
        <FileSpreadsheet className="size-4 text-[#22C55E]" />
        Search Filter
      </Button>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          className="h-9 rounded-sm border-[#E5E7EB] bg-white px-3 text-sm font-medium text-[#374151] hover:bg-[#F9FAFB]"
          onClick={onNewLeads}
        >
          <Printer className="size-4 text-[#3B82F6]" />
          New Leads
        </Button>
        <LeadActionDropdown />
      </div>
    </div>
  );
}
