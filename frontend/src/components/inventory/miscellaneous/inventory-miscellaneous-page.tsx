"use client";

import { Package } from "lucide-react";
import { RepairsTopNav } from "@/components/repairs/repairs-top-nav";
import { EmptyState } from "@/components/shared/empty-state";

/** Placeholder until miscellaneous inventory CRUD is implemented. */
export function InventoryMiscellaneousPage() {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-pos-page">
      <RepairsTopNav />
      <div className="flex min-h-0 flex-1 flex-col overflow-auto p-4 md:p-6">
        <EmptyState
          icon={Package}
          title="Miscellaneous inventory"
          description="This section is coming soon. Use Products or Trade-in for inventory workflows today."
        />
      </div>
    </div>
  );
}
