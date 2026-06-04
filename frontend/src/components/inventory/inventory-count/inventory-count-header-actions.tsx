"use client";

import { ChevronDown, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface InventoryCountHeaderActionsProps {
  filterOpen: boolean;
  onToggleFilter: () => void;
}

const tealBtn =
  "h-9 gap-1.5 rounded-sm border-0 bg-(--repair-primary) px-3 text-sm font-semibold text-(--repair-on-primary) shadow-sm hover:opacity-90";

export function InventoryCountHeaderActions({
  filterOpen,
  onToggleFilter,
}: InventoryCountHeaderActionsProps) {
  const router = useRouter();

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

      <Button
        type="button"
        className={tealBtn}
        onClick={() => router.push("/inventory/count/new")}
      >
        <Plus className="size-4" />
        New Inventory Count
      </Button>
    </div>
  );
}
