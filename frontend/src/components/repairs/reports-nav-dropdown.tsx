"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, Star } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  loadReportFavourites,
  saveReportFavourites,
} from "@/lib/reports-favourites";
import {
  REPORT_NAV_SECTIONS,
  type ReportNavItem,
  type ReportNavSection,
  isAnyReportsPage,
} from "@/lib/reports-nav-items";
import { cn } from "@/lib/utils";

type ReportsTab = "all" | "favourite";

interface ReportsNavDropdownProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function filterSectionsByFavourites(
  sections: ReportNavSection[],
  favourites: Set<string>,
): ReportNavSection[] {
  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => favourites.has(item.id)),
    }))
    .filter((section) => section.items.length > 0);
}

function ReportRow({
  item,
  isFavourite,
  onToggleFavourite,
  onNavigate,
}: {
  item: ReportNavItem;
  isFavourite: boolean;
  onToggleFavourite: (id: string) => void;
  onNavigate: () => void;
}) {
  return (
    <div className="group flex items-stretch border-b border-[#E5E7EB] last:border-b-0 hover:bg-[#F9FAFB]">
      <Link
        href={item.href}
        className="flex min-w-0 flex-1 items-center px-3 py-2.5 text-sm font-medium text-[#374151] transition-colors group-hover:text-(--repair-primary)"
        onClick={onNavigate}
      >
        <span className="truncate">{item.label}</span>
      </Link>
      <button
        type="button"
        className="flex w-9 shrink-0 items-center justify-center text-[#D1D5DB] transition-colors hover:text-amber-500"
        aria-label={isFavourite ? `Remove ${item.label} from favourites` : `Favourite ${item.label}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggleFavourite(item.id);
        }}
      >
        <Star
          className={cn(
            "size-3.5 transition-colors",
            isFavourite && "fill-amber-400 text-amber-400",
          )}
        />
      </button>
    </div>
  );
}

function ReportColumn({
  section,
  favourites,
  onToggleFavourite,
  onNavigate,
  showBorder,
}: {
  section: ReportNavSection;
  favourites: Set<string>;
  onToggleFavourite: (id: string) => void;
  onNavigate: () => void;
  showBorder?: boolean;
}) {
  const Icon = section.icon;

  return (
    <div
      className={cn(
        "flex min-w-[200px] flex-1 flex-col",
        showBorder && "border-r border-[#E5E7EB]",
      )}
    >
      {section.title ? (
        <div className="flex items-center gap-2 border-b border-[#E5E7EB] bg-[#FAFAFA] px-3 py-2.5">
          {Icon ? (
            <Icon className="size-4 shrink-0 text-(--repair-primary)" aria-hidden />
          ) : null}
          <span className="text-sm font-semibold text-[#111827]">{section.title}</span>
        </div>
      ) : (
        <div
          className="hidden border-b border-[#E5E7EB] bg-[#FAFAFA] px-3 py-2.5 sm:block sm:min-h-[41px]"
          aria-hidden
        />
      )}
      <div className="flex flex-col">
        {section.items.map((item) => (
          <ReportRow
            key={item.id}
            item={item}
            isFavourite={favourites.has(item.id)}
            onToggleFavourite={onToggleFavourite}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </div>
  );
}

export function ReportsNavDropdown({ open, onOpenChange }: ReportsNavDropdownProps) {
  const pathname = usePathname();
  const isActive = isAnyReportsPage(pathname);
  const [activeTab, setActiveTab] = useState<ReportsTab>("all");
  const [favourites, setFavourites] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setFavourites(loadReportFavourites());
  }, []);

  useEffect(() => {
    if (!open) setActiveTab("all");
  }, [open]);

  const toggleFavourite = useCallback((id: string) => {
    setFavourites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveReportFavourites(next);
      return next;
    });
  }, []);

  const visibleSections = useMemo(() => {
    if (activeTab === "all") return REPORT_NAV_SECTIONS;
    return filterSectionsByFavourites(REPORT_NAV_SECTIONS, favourites);
  }, [activeTab, favourites]);

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
        Reports
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
          "z-60 w-[min(1180px,calc(100vw-1.5rem))] overflow-hidden rounded-lg border border-[#E5E7EB] bg-white p-0",
          "shadow-[0_14px_32px_rgba(15,23,42,0.18)]",
          "animate-in fade-in-0 zoom-in-95 duration-150",
        )}
      >
        <div className="border-b border-[#E5E7EB] bg-white px-4 pt-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={cn(
                "rounded-t-sm border-b-2 px-4 py-2 text-sm font-semibold transition-colors",
                activeTab === "all"
                  ? "border-(--repair-primary) text-(--repair-primary)"
                  : "border-transparent text-[#6B7280] hover:text-[#374151]",
              )}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("favourite")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-t-sm border-b-2 bg-[#F3F4F6] px-4 py-2 text-sm font-semibold transition-colors",
                activeTab === "favourite"
                  ? "border-(--repair-primary) text-(--repair-primary)"
                  : "border-transparent text-[#6B7280] hover:text-[#374151]",
              )}
            >
              <Star className="size-3.5" />
              Favourite
            </button>
          </div>
        </div>

        {visibleSections.length === 0 ? (
          <div className="px-6 py-14 text-center text-sm text-[#9CA3AF]">
            No favourite reports found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="flex min-w-[1000px] items-stretch">
              {visibleSections.map((section, index) => (
                <ReportColumn
                  key={section.id}
                  section={section}
                  favourites={favourites}
                  onToggleFavourite={toggleFavourite}
                  onNavigate={close}
                  showBorder={index < visibleSections.length - 1}
                />
              ))}
            </div>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
