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
    <div className="overflow-x-auto border-b border-[#E5E7EB] bg-[#F9FAFB]">
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
                "relative -mb-px rounded-t-sm border border-[#E5E7EB] border-b-0 px-4 py-2.5 text-sm font-semibold transition-colors",
                isActive
                  ? "z-10 border-b-white bg-white text-[#111827]"
                  : "bg-[#F3F4F6] text-[#6B7280] hover:bg-white hover:text-[#374151]",
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
