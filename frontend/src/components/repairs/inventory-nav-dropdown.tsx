"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  type InventoryExpandableSection,
  type InventoryMegaMenuItem,
  type InventoryMenuRow,
  getMenuLayout,
  isAnyInventoryPage,
} from "@/lib/inventory-nav-items";
import { cn } from "@/lib/utils";

const ROW_HEIGHT_PX = 44;

interface InventoryNavDropdownProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function MenuLinkRow({
  item,
  onNavigate,
  indented,
}: {
  item: InventoryMegaMenuItem;
  onNavigate: () => void;
  indented?: boolean;
}) {
  const router = useRouter();

  return (
    <div
      className={cn(
        "group flex items-center justify-between transition-all duration-200",
        "text-[#374151] hover:bg-[#F3F4F6] hover:text-(--repair-primary)",
      )}
    >
      <Link
        href={item.href}
        className={cn(
          "flex min-w-0 flex-1 items-center py-2.5 text-sm font-medium",
          indented ? "pl-6 pr-3" : "px-4",
        )}
        onClick={onNavigate}
      >
        <span className="truncate">{item.label}</span>
      </Link>
      {item.quickCreateHref ? (
        <button
          type="button"
          className="mr-3 shrink-0 rounded p-0.5 text-[#D1D5DB] transition-colors hover:bg-[#F3F4F6] hover:text-(--repair-primary)"
          aria-label={`Add ${item.label}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onNavigate();
            router.push(item.quickCreateHref!);
          }}
        >
          <Plus className="size-3.5" />
        </button>
      ) : (
        <span className="mr-3 w-3.5 shrink-0" />
      )}
    </div>
  );
}

function ExpandableSectionRow({
  section,
  expanded,
  onToggle,
  onNavigate,
}: {
  section: InventoryExpandableSection;
  expanded: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}) {
  return (
    <div className="transition-all duration-200">
      <div
        className={cn(
          "group flex items-center justify-between transition-all duration-200",
          "text-[#374151] hover:bg-[#F3F4F6] hover:text-(--repair-primary)",
        )}
      >
        <button
          type="button"
          onClick={onToggle}
          className="flex min-w-0 flex-1 items-center px-4 py-2.5 text-left text-sm font-medium"
        >
          <span className="truncate">{section.label}</span>
        </button>
        <button
          type="button"
          onClick={onToggle}
          className="mr-3 shrink-0 rounded p-0.5 text-[#D1D5DB] transition-colors hover:bg-[#F3F4F6] hover:text-(--repair-primary)"
          aria-label={expanded ? `Collapse ${section.label}` : `Expand ${section.label}`}
          aria-expanded={expanded}
        >
          <ChevronDown
            className={cn(
              "size-3.5 transition-transform duration-200",
              expanded && "rotate-180",
            )}
            aria-hidden
          />
        </button>
      </div>
      {expanded ? (
        <div className="transition-all duration-200">
          {section.children.map((child) => (
            <MenuLinkRow
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

function renderMenuRow(
  row: InventoryMenuRow,
  expandedSectionId: string | null,
  onExpandSection: (id: string | null) => void,
  onNavigate: () => void,
) {
  if (row.kind === "section") {
    return (
      <ExpandableSectionRow
        key={row.section.id}
        section={row.section}
        expanded={expandedSectionId === row.section.id}
        onToggle={() =>
          onExpandSection(
            expandedSectionId === row.section.id ? null : row.section.id,
          )
        }
        onNavigate={onNavigate}
      />
    );
  }

  return (
    <MenuLinkRow
      key={row.item.id}
      item={row.item}
      onNavigate={onNavigate}
    />
  );
}

function InventoryMenuColumn({
  rows,
  rowCount,
  expandedSectionId,
  onExpandSection,
  onNavigate,
  showBorder,
}: {
  rows: InventoryMenuRow[];
  /** Min height from this column's own row count only (avoids empty gap). */
  rowCount: number;
  expandedSectionId: string | null;
  onExpandSection: (id: string | null) => void;
  onNavigate: () => void;
  showBorder?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col transition-all duration-200",
        showBorder && "border-r border-pos",
      )}
      style={{ minHeight: rowCount > 0 ? rowCount * ROW_HEIGHT_PX : undefined }}
    >
      {rows.map((row) =>
        renderMenuRow(row, expandedSectionId, onExpandSection, onNavigate),
      )}
    </div>
  );
}

export function InventoryNavDropdown({ open, onOpenChange }: InventoryNavDropdownProps) {
  const pathname = usePathname();
  const isActive = isAnyInventoryPage(pathname);
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setExpandedSectionId(null);
    } else {
      setExpandedSectionId(null);
    }
  }, [open]);

  const layout = getMenuLayout(expandedSectionId);
  const close = () => onOpenChange(false);

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className={cn(
              "flex shrink-0 items-center gap-1 rounded px-2.5 py-1.5 text-xs font-medium transition-colors md:text-sm",
              open || isActive
                ? "text-(--repair-on-primary)"
                : "text-white/90 hover:text-white",
            )}
            style={
              open || isActive
                ? { backgroundColor: "var(--repair-primary)" }
                : { backgroundColor: "transparent" }
            }
          />
        }
      >
        Inventory
        <ChevronDown
          className={cn(
            "size-3.5 opacity-80 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        sideOffset={8}
        align="start"
        className={cn(
          "pos-dropdown z-60 w-[min(620px,calc(100vw-2rem))] overflow-hidden rounded-lg p-0",
          "animate-in fade-in-0 zoom-in-95 duration-150",
        )}
      >
        <div className="grid grid-cols-1 items-start sm:grid-cols-2">
          <InventoryMenuColumn
            rows={layout.left}
            rowCount={layout.leftRowCount}
            expandedSectionId={expandedSectionId}
            onExpandSection={setExpandedSectionId}
            onNavigate={close}
            showBorder
          />
          <InventoryMenuColumn
            rows={layout.right}
            rowCount={layout.rightRowCount}
            expandedSectionId={expandedSectionId}
            onExpandSection={setExpandedSectionId}
            onNavigate={close}
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
