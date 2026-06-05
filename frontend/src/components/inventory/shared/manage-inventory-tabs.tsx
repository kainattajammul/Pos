"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MANAGE_INVENTORY_TABS } from "@/lib/manage-inventory-tabs";
import { cn } from "@/lib/utils";

interface ManageInventoryTabsProps {
  activeId?: string;
}

export function ManageInventoryTabs({ activeId }: ManageInventoryTabsProps) {
  const pathname = usePathname();

  return (
    <div className="overflow-x-auto border-b border-pos bg-pos-subtle">
      <div className="flex min-w-max px-2 pt-2">
        {MANAGE_INVENTORY_TABS.map((tab) => {
          const isActive =
            activeId === tab.id ||
            pathname === tab.href ||
            pathname.startsWith(`${tab.href}/`);

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                "relative -mb-px rounded-t-md border border-pos border-b-0 px-4 py-2.5 text-sm font-semibold transition-colors",
                isActive
                  ? "z-10 border-b-pos-surface bg-pos-surface text-pos shadow-pos-sm"
                  : "bg-pos-muted text-pos-muted hover:bg-pos-surface hover:text-pos-secondary",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
