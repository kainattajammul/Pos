"use client";

import {
  Bell,
  ChevronDown,
  Grid3X3,
  Headphones,
  Menu,
  Store,
} from "lucide-react";
import { POS_NAV_ITEMS } from "@/lib/repairs-pos-data";
import { useAppDispatch } from "@/store/hooks";
import { setMobileSidebarOpen } from "@/store/ui-slice";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

function ProgressRing() {
  return (
    <div className="relative flex size-9 items-center justify-center">
      <svg className="size-9 -rotate-90" viewBox="0 0 36 36" aria-hidden>
        <circle
          cx="18"
          cy="18"
          r="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-neutral-200"
        />
        <circle
          cx="18"
          cy="18"
          r="14"
          fill="none"
          stroke="var(--repair-accent)"
          strokeWidth="3"
          strokeDasharray="4 100"
        />
      </svg>
      <span
        className="absolute text-[9px] font-semibold"
        style={{ color: "var(--repair-primary-dark)" }}
      >
        0%
      </span>
    </div>
  );
}

export function RepairsTopNav() {
  const dispatch = useAppDispatch();

  return (
    <header
      className="flex h-12 shrink-0 items-center justify-between px-3 text-white shadow-md md:px-4"
      style={{ backgroundColor: "var(--repair-primary-dark)" }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3 md:gap-4">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="shrink-0 text-white hover:bg-white/10 lg:hidden"
          onClick={() => dispatch(setMobileSidebarOpen(true))}
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </Button>
        <span className="shrink-0 text-sm font-bold tracking-tight md:text-base">
          Repair Store
        </span>
        <nav className="hidden items-center gap-0.5 overflow-x-auto md:flex">
          {POS_NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              type="button"
              className={cn(
                "flex shrink-0 items-center gap-1 rounded px-2.5 py-1.5 text-xs font-medium transition-colors md:text-sm",
                item.active
                  ? "text-[var(--repair-on-primary)]"
                  : "text-white/90 hover:text-white",
              )}
              style={
                item.active
                  ? { backgroundColor: "var(--repair-primary)" }
                  : { backgroundColor: "transparent" }
              }
              onMouseEnter={(e) => {
                if (!item.active) {
                  e.currentTarget.style.backgroundColor = "var(--repair-primary-darker)";
                }
              }}
              onMouseLeave={(e) => {
                if (!item.active) {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
            >
              {item.label}
              {item.hasDropdown ? <ChevronDown className="size-3.5 opacity-80" /> : null}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex shrink-0 items-center gap-2 md:gap-3">
        <ProgressRing />
        <button
          type="button"
          className="rounded p-1.5 text-white/90 transition-colors hover:bg-white/10"
          aria-label="Support"
        >
          <Headphones className="size-5" />
        </button>
        <button
          type="button"
          className="rounded p-1.5 text-white/90 transition-colors hover:bg-white/10"
          aria-label="Store"
        >
          <Store className="size-5" />
        </button>
        <button
          type="button"
          className="rounded p-1.5 text-white/90 transition-colors hover:bg-white/10"
          aria-label="Notifications"
        >
          <Bell className="size-5" />
        </button>
        <button
          type="button"
          className="rounded p-1.5 text-white/90 transition-colors hover:bg-white/10"
          aria-label="App launcher"
        >
          <Grid3X3 className="size-5" />
        </button>
      </div>
    </header>
  );
}
