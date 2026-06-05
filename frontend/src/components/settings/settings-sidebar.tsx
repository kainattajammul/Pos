"use client";

import { ChevronDown, ChevronUp, Menu, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  SETTINGS_NAV_ITEMS,
  filterSettingsNavItems,
  isSettingsNavItemActive,
  type SettingsNavItem,
} from "@/lib/settings-nav-items";
import { cn } from "@/lib/utils";

interface SettingsSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

function NavItemRow({
  item,
  expanded,
  onToggle,
}: {
  item: SettingsNavItem;
  expanded: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const Icon = item.icon;
  const hasChildren = Boolean(item.children?.length);
  const childActive = item.children?.some((child) =>
    isSettingsNavItemActive(pathname, child.href),
  );
  const selfActive = item.href
    ? isSettingsNavItemActive(pathname, item.href)
    : childActive;

  if (hasChildren) {
    return (
      <div>
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-sm font-medium text-white/90 transition-colors hover:bg-white/10",
            selfActive && "text-white",
          )}
        >
          <Icon className="size-4 shrink-0 opacity-90" aria-hidden />
          <span className="min-w-0 flex-1 truncate">{item.label}</span>
          {expanded ? (
            <ChevronUp className="size-4 shrink-0 opacity-70" />
          ) : (
            <ChevronDown className="size-4 shrink-0 opacity-70" />
          )}
        </button>
        {expanded ? (
          <div className="mt-1 space-y-0.5 pl-3">
            {item.children!.map((child) => {
              const active = isSettingsNavItemActive(pathname, child.href);
              return (
                <Link
                  key={child.id}
                  href={child.href}
                  className={cn(
                    "block rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-(--repair-primary) text-white shadow-sm"
                      : "text-white/75 hover:bg-white/10 hover:text-white",
                  )}
                >
                  {child.label}
                </Link>
              );
            })}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <Link
      href={item.href ?? "#"}
      className={cn(
        "flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
        selfActive
          ? "bg-(--repair-primary) text-white"
          : "text-white/90 hover:bg-white/10",
      )}
    >
      <Icon className="size-4 shrink-0 opacity-90" aria-hidden />
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {item.badge ? (
        <span className="rounded bg-(--repair-primary) px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
          {item.badge}
        </span>
      ) : null}
    </Link>
  );
}

export function SettingsSidebar({ mobileOpen, onMobileClose }: SettingsSidebarProps) {
  const searchRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const item of SETTINGS_NAV_ITEMS) {
      if (item.defaultExpanded) initial[item.id] = true;
    }
    return initial;
  });

  const filteredItems = useMemo(
    () => filterSettingsNavItems(SETTINGS_NAV_ITEMS, searchQuery),
    [searchQuery],
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const sidebarContent = (
    <>
      <div className="border-b border-white/10 px-4 py-4">
        <h2 className="text-base font-bold text-white">Settings</h2>
      </div>

      <div className="px-3 py-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/50" />
          <input
            ref={searchRef}
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search settings"
            className="h-9 w-full rounded-md border border-white/10 bg-white/10 pl-9 pr-16 text-sm text-white placeholder:text-white/50 focus:border-white/25 focus:outline-none focus:ring-1 focus:ring-white/20"
          />
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-white/15 bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-white/60">
            Ctrl + S
          </span>
        </div>
      </div>

      <nav className="scrollbar-hide flex-1 space-y-1 overflow-y-auto px-2 pb-4" aria-label="Settings">
        {filteredItems.map((item) => (
          <div key={item.id} onClick={onMobileClose}>
            <NavItemRow
              item={item}
              expanded={expanded[item.id] ?? Boolean(item.defaultExpanded)}
              onToggle={() =>
                setExpanded((prev) => ({
                  ...prev,
                  [item.id]: !prev[item.id],
                }))
              }
            />
          </div>
        ))}
      </nav>
    </>
  );

  return (
    <>
      <aside
        className="hidden w-[240px] shrink-0 flex-col overflow-hidden md:flex"
        style={{ backgroundColor: "var(--repair-primary-dark)" }}
      >
        {sidebarContent}
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close settings menu"
            onClick={onMobileClose}
          />
          <aside
            className="relative flex h-full w-[min(280px,85vw)] flex-col shadow-xl"
            style={{ backgroundColor: "var(--repair-primary-dark)" }}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <span className="text-sm font-semibold text-white">Settings menu</span>
              <button
                type="button"
                onClick={onMobileClose}
                className="rounded p-1 text-white/80 hover:bg-white/10"
                aria-label="Close"
              >
                <Menu className="size-5" />
              </button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      ) : null}
    </>
  );
}
