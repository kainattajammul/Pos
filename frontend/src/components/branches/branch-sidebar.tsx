"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { BranchStatusBadge } from "@/components/branches/branch-status-badge";
import {
  BRANCH_NAV_ITEMS,
  filterBranchNavItems,
} from "@/lib/branch-nav-items";
import type { BranchRecord } from "@/lib/branch-types";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface BranchSidebarProps {
  branch: BranchRecord;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function BranchSidebar({ branch, mobileOpen, onMobileClose }: BranchSidebarProps) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const items = useMemo(() => filterBranchNavItems(BRANCH_NAV_ITEMS, query), [query]);

  const content = (
    <aside className="flex h-full w-[280px] shrink-0 flex-col border-r border-[#E5E7EB] bg-white">
      <div className="border-b border-[#E5E7EB] px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
          Branch modules
        </p>
        <p className="mt-1 truncate text-sm font-bold text-[#111827]">{branch.name}</p>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs font-medium text-[#6B7280]">{branch.code}</span>
          <BranchStatusBadge status={branch.status} />
        </div>
      </div>

      <div className="border-b border-[#E5E7EB] px-3 py-3">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search modules..."
            className="h-9 w-full rounded-md border border-[#E5E7EB] bg-[#FAFAFA] pr-3 pl-9 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary)"
          />
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <nav className="space-y-0.5 p-2" aria-label="Branch sections">
          {items.map((item) => {
            const href = `/branches/${branch.id}/${item.slug}`;
            const active = pathname === href || pathname.startsWith(`${href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={href}
                onClick={onMobileClose}
                className={cn(
                  "flex items-start gap-3 rounded-md px-3 py-2.5 transition-colors",
                  active
                    ? "bg-[color-mix(in_srgb,var(--repair-primary)_12%,white)] text-(--repair-primary)"
                    : "text-[#374151] hover:bg-[#F3F4F6]",
                )}
              >
                <Icon className="mt-0.5 size-4 shrink-0" />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold leading-snug">{item.shortLabel}</span>
                  <span className="block text-xs leading-snug opacity-75">{item.description}</span>
                </span>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="border-t border-[#E5E7EB] p-3">
        <Link
          href="/branches"
          onClick={onMobileClose}
          className="block rounded-md px-3 py-2 text-sm font-medium text-[#31A5A6] hover:bg-[#F0FDFA]"
        >
          ← All branches
        </Link>
      </div>
    </aside>
  );

  return (
    <>
      <div className="hidden md:block">{content}</div>
      <Sheet open={mobileOpen} onOpenChange={(open) => !open && onMobileClose?.()}>
        <SheetContent side="left" className="w-[min(100%,300px)] p-0">
          {content}
        </SheetContent>
      </Sheet>
    </>
  );
}
