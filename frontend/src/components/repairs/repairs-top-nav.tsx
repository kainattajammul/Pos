"use client";

import { useState } from "react";
import {
  Bell,
  ChevronDown,
  Grid3X3,
  Headphones,
  Menu,
  Plus,
  Search,
  Store,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { POS_NAV_ITEMS } from "@/lib/repairs-pos-data";
import { useAppDispatch } from "@/store/hooks";
import { setMobileSidebarOpen } from "@/store/ui-slice";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RepairPriceCalculatorModal } from "@/components/repairs/repair-price-calculator/repair-price-calculator-modal";

const REPAIR_PRICE_CALCULATOR_ITEM = "Repair Price Calculator v1.1" as const;

const REPAIRS_DROPDOWN_ITEMS = [
  "Manage Invoices",
  "Manage Tickets",
  "Manage Leads",
  "Manage Estimates",
  "Repair Price Calculator v1.1",
  "Manage Inquiries",
] as const;

const REPAIRS_DROPDOWN_ROUTES: Partial<Record<(typeof REPAIRS_DROPDOWN_ITEMS)[number], string>> =
  {
    "Manage Invoices": "/repairs/manage-invoices",
    "Manage Tickets": "/repairs/manage-tickets",
    "Manage Leads": "/repairs/manage-leads",
    "Manage Estimates": "/repairs/manage-estimates",
    "Manage Inquiries": "/repairs/manage-inquiries",
  };

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
  const router = useRouter();
  const [calculatorOpen, setCalculatorOpen] = useState(false);

  return (
    <>
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
        <nav className="hidden items-center gap-0.5 overflow-hidden md:flex">
          {POS_NAV_ITEMS.map((item) => (
            item.label === "Repairs" ? (
              <DropdownMenu key={item.label}>
                <DropdownMenuTrigger
                  render={
                    <button
                      type="button"
                      className={cn(
                        "flex shrink-0 items-center gap-1 rounded px-2.5 py-1.5 text-xs font-medium transition-colors md:text-sm",
                        "text-white/90 hover:text-white",
                      )}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "var(--repair-primary-darker)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    />
                  }
                >
                  {item.label}
                  <ChevronDown className="size-3.5 opacity-80" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  sideOffset={8}
                  align="start"
                  className="w-64 rounded-none border border-[#D1D5DB] bg-white p-0 text-[#374151] shadow-lg"
                >
                  {REPAIRS_DROPDOWN_ITEMS.map((dropdownItem, index) => (
                    <DropdownMenuItem
                      key={dropdownItem}
                      onClick={() => {
                        if (dropdownItem === REPAIR_PRICE_CALCULATOR_ITEM) {
                          setCalculatorOpen(true);
                          return;
                        }
                        const targetRoute = REPAIRS_DROPDOWN_ROUTES[dropdownItem];
                        if (targetRoute) router.push(targetRoute);
                      }}
                      className="flex cursor-pointer items-center justify-between rounded-none px-4 py-3 text-[17px] font-medium text-[#374151] transition-colors data-highlighted:text-(--repair-primary)"
                    >
                      <span className="transition-colors group-data-highlighted/dropdown-menu-item:text-(--repair-primary) group-data-highlighted/dropdown-menu-item:underline group-data-highlighted/dropdown-menu-item:underline-offset-2">
                        {dropdownItem}
                      </span>
                      {index < 4 ? (
                        <span
                          className={cn(
                            "ml-3 inline-flex size-6 items-center justify-center rounded-full bg-[#F3F4F6] text-[#D1D5DB] transition-colors",
                            "group-data-highlighted/dropdown-menu-item:bg-(--repair-primary)",
                            "group-data-highlighted/dropdown-menu-item:text-(--repair-on-primary)",
                          )}
                        >
                          <Plus className="size-3.5" />
                        </span>
                      ) : null}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button
                key={item.label}
                type="button"
                className={cn(
                  "flex shrink-0 items-center gap-1 rounded px-2.5 py-1.5 text-xs font-medium transition-colors md:text-sm",
                  item.active
                    ? "text-(--repair-on-primary)"
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
            )
          ))}
        </nav>
      </div>

      <div className="flex shrink-0 items-center gap-2 md:gap-3">
        <ProgressRing />
        <button
          type="button"
          className="hidden items-center gap-1.5 rounded-md bg-(--repair-primary) px-3 py-1.5 text-xs font-semibold text-(--repair-on-primary) transition-colors hover:opacity-90 md:inline-flex"
          aria-label="Support"
        >
          <Headphones className="size-4" />
          Contact Support
        </button>
        <button
          type="button"
          className="rounded p-1.5 text-white/90 transition-colors hover:bg-white/10 md:hidden"
          aria-label="Contact support"
        >
          <Headphones className="size-5" />
        </button>
        <button
          type="button"
          className="rounded p-1.5 text-white/90 transition-colors hover:bg-white/10"
          aria-label="Search"
        >
          <Search className="size-5" />
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
    <RepairPriceCalculatorModal open={calculatorOpen} onOpenChange={setCalculatorOpen} />
    </>
  );
}
