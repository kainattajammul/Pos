"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, Plus } from "lucide-react";
import { useState } from "react";
import {
  type InventoryExpandableSection,
  type InventoryMegaMenuItem,
  getMenuLayout,
  isAnyInventoryPage,
} from "@/lib/inventory-nav-items";
import { cn } from "@/lib/utils";

interface InventoryMobileAccordionProps {
  onNavigate?: () => void;
}

function MobileLinkRow({
  item,
  onNavigate,
  indented,
}: {
  item: InventoryMegaMenuItem;
  onNavigate?: () => void;
  indented?: boolean;
}) {
  const router = useRouter();

  return (
    <div
      className={cn(
        "flex items-center justify-between transition-all duration-200",
        "text-[#374151] hover:bg-[#F3F4F6] hover:text-(--repair-primary)",
      )}
    >
      <Link
        href={item.href}
        onClick={onNavigate}
        className={cn("flex-1 py-2.5 text-sm font-medium", indented ? "pl-6 pr-2" : "px-3")}
      >
        {item.label}
      </Link>
      {item.quickCreateHref ? (
        <button
          type="button"
          className="mr-2 rounded p-1 text-[#9CA3AF] hover:text-(--repair-primary)"
          aria-label={`Add ${item.label}`}
          onClick={() => {
            onNavigate?.();
            router.push(item.quickCreateHref!);
          }}
        >
          <Plus className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}

function MobileExpandableSection({
  section,
  expanded,
  onToggle,
  onNavigate,
}: {
  section: InventoryExpandableSection;
  expanded: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
}) {
  return (
    <div>
      <div
        className={cn(
          "flex items-center justify-between transition-all duration-200",
          "text-[#374151] hover:bg-[#F3F4F6] hover:text-(--repair-primary)",
        )}
      >
        <button
          type="button"
          onClick={onToggle}
          className="flex min-w-0 flex-1 px-3 py-2.5 text-left text-sm font-medium"
        >
          {section.label}
        </button>
        <button
          type="button"
          onClick={onToggle}
          className="mr-2 shrink-0 rounded p-1 text-[#D1D5DB] hover:text-(--repair-primary)"
          aria-label={expanded ? `Collapse ${section.label}` : `Expand ${section.label}`}
          aria-expanded={expanded}
        >
          <ChevronDown
            className={cn("size-3.5 transition-transform", expanded && "rotate-180")}
          />
        </button>
      </div>
      {expanded ? (
        <div>
          {section.children.map((child) => (
            <MobileLinkRow
              key={child.id}
              item={child}
              onNavigate={onNavigate}
              indented
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function InventoryMobileAccordion({ onNavigate }: InventoryMobileAccordionProps) {
  const pathname = usePathname();
  const inventoryActive = isAnyInventoryPage(pathname);
  const [menuOpen, setMenuOpen] = useState(inventoryActive);
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);
  const layout = getMenuLayout(expandedSectionId);

  return (
    <div className="border-b border-sidebar-border px-3 py-2">
      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
          inventoryActive || menuOpen
            ? "bg-[#e6f6f8] text-(--repair-primary)"
            : "text-muted-foreground hover:bg-sidebar-accent",
        )}
      >
        <span className="flex-1 text-left">Inventory</span>
        <ChevronDown
          className={cn("size-4 shrink-0 transition-transform duration-200", menuOpen && "rotate-180")}
        />
      </button>
      <div
        className={cn(
          "grid overflow-hidden transition-[grid-template-rows] duration-200 ease-out",
          menuOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="min-h-0 overflow-hidden rounded-md border border-[#E5E7EB] bg-white pb-2 pt-1">
          {layout.left.map((row) =>
            row.kind === "section" ? (
              <MobileExpandableSection
                key={row.section.id}
                section={row.section}
                expanded={expandedSectionId === row.section.id}
                onToggle={() =>
                  setExpandedSectionId(
                    expandedSectionId === row.section.id ? null : row.section.id,
                  )
                }
                onNavigate={onNavigate}
              />
            ) : (
              <MobileLinkRow
                key={row.item.id}
                item={row.item}
                onNavigate={onNavigate}
              />
            ),
          )}
          {layout.right.map((row) =>
            row.kind === "link" ? (
              <MobileLinkRow
                key={row.item.id}
                item={row.item}
                onNavigate={onNavigate}
              />
            ) : null,
          )}
        </div>
      </div>
    </div>
  );
}
