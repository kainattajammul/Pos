"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import {
  Bell,
  ChevronDown,
  Headphones,
  Maximize2,
  Menu,
  Plus,
  Search,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
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
import { AppLauncherDropdown } from "@/components/shared/app-launcher-dropdown";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { isAnyInventoryPage } from "@/lib/inventory-nav-items";
import { isAnyReportsPage } from "@/lib/reports-nav-items";

const InventoryNavDropdown = dynamic(
  () =>
    import("@/components/repairs/inventory-nav-dropdown").then(
      (m) => m.InventoryNavDropdown,
    ),
  { ssr: false },
);

const ReportsNavDropdown = dynamic(
  () =>
    import("@/components/repairs/reports-nav-dropdown").then(
      (m) => m.ReportsNavDropdown,
    ),
  { ssr: false },
);

const RepairPriceCalculatorModal = dynamic(
  () =>
    import("@/components/repairs/repair-price-calculator/repair-price-calculator-modal").then(
      (m) => m.RepairPriceCalculatorModal,
    ),
  { ssr: false },
);

const SelectRegisterModal = dynamic(
  () => import("@/components/repairs/select-register-modal").then((m) => m.SelectRegisterModal),
  { ssr: false },
);

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
          className="text-white/25"
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
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [repairsOpen, setRepairsOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [appLauncherOpen, setAppLauncherOpen] = useState(false);
  const [selectRegisterOpen, setSelectRegisterOpen] = useState(false);

  const isRepairsPage = pathname === "/repairs" || pathname.startsWith("/repairs/");
  const isInventoryPage = isAnyInventoryPage(pathname);
  const isReportsPage = isAnyReportsPage(pathname);

  const isMainItemActive = (label: string) => {
    if (label === "Point Of Sale" || label === "Repairs") return isRepairsPage;
    if (label === "Inventory") return isInventoryPage;
    if (label === "Reports") return isReportsPage;
    return false;
  };

  const handleInventoryOpenChange = (open: boolean) => {
    setInventoryOpen(open);
    if (open) {
      setRepairsOpen(false);
      setReportsOpen(false);
      setAppLauncherOpen(false);
      setSelectRegisterOpen(false);
    }
  };

  const handleRepairsOpenChange = (open: boolean) => {
    setRepairsOpen(open);
    if (open) {
      setInventoryOpen(false);
      setReportsOpen(false);
      setAppLauncherOpen(false);
      setSelectRegisterOpen(false);
    }
  };

  const handleReportsOpenChange = (open: boolean) => {
    setReportsOpen(open);
    if (open) {
      setInventoryOpen(false);
      setRepairsOpen(false);
      setAppLauncherOpen(false);
      setSelectRegisterOpen(false);
    }
  };

  const handleAppLauncherOpenChange = (open: boolean) => {
    setAppLauncherOpen(open);
    if (open) {
      setInventoryOpen(false);
      setRepairsOpen(false);
      setReportsOpen(false);
      setSelectRegisterOpen(false);
    }
  };

  useEffect(() => {
    setInventoryOpen(false);
    setRepairsOpen(false);
    setReportsOpen(false);
    setAppLauncherOpen(false);
    setSelectRegisterOpen(false);
  }, [pathname]);

  const closeNavDropdowns = () => {
    setInventoryOpen(false);
    setRepairsOpen(false);
    setReportsOpen(false);
    setAppLauncherOpen(false);
    setSelectRegisterOpen(false);
  };

  const handlePointOfSaleClick = () => {
    closeNavDropdowns();
    if (isRepairsPage) {
      setSelectRegisterOpen(true);
      return;
    }
    router.push("/repairs");
  };

  return (
    <>
      <header
        className="flex h-12 shrink-0 items-center justify-between border-b border-black/10 px-3 text-white shadow-pos-md md:px-4"
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
          <nav className="hidden items-center gap-0.5 overflow-visible md:flex">
            {POS_NAV_ITEMS.map((item) => {
              const isActive = isMainItemActive(item.label);

              if (item.label === "Repairs") {
                return (
                  <DropdownMenu
                    key={item.label}
                    open={repairsOpen}
                    onOpenChange={handleRepairsOpenChange}
                  >
                    <DropdownMenuTrigger
                      render={
                        <button
                          type="button"
                          className={cn(
                            "flex shrink-0 items-center gap-1 rounded px-2.5 py-1.5 text-xs font-medium transition-colors md:text-sm",
                            repairsOpen || isActive
                              ? "text-[var(--repair-on-primary)]"
                              : "text-white/90 hover:text-white",
                          )}
                          style={
                            repairsOpen || isActive
                              ? { backgroundColor: "var(--repair-primary)" }
                              : { backgroundColor: "transparent" }
                          }
                        />
                      }
                    >
                      {item.label}
                      <ChevronDown className="size-3.5 opacity-80" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      sideOffset={8}
                      align="start"
                      className="pos-dropdown w-64 rounded-lg p-0"
                    >
                      {REPAIRS_DROPDOWN_ITEMS.map((dropdownItem, index) => (
                        <DropdownMenuItem
                          key={dropdownItem}
                          onClick={() => {
                            if (dropdownItem === REPAIR_PRICE_CALCULATOR_ITEM) {
                              setCalculatorOpen(true);
                              setRepairsOpen(false);
                              return;
                            }
                            const targetRoute = REPAIRS_DROPDOWN_ROUTES[dropdownItem];
                            if (targetRoute) router.push(targetRoute);
                          }}
                          className="flex cursor-pointer items-center justify-between rounded-none px-4 py-3 text-[17px] font-medium text-pos-secondary transition-colors data-highlighted:text-(--repair-primary)"
                        >
                          <span className="transition-colors group-data-highlighted/dropdown-menu-item:text-(--repair-primary) group-data-highlighted/dropdown-menu-item:underline group-data-highlighted/dropdown-menu-item:underline-offset-2">
                            {dropdownItem}
                          </span>
                          {index < 4 ? (
                            <span
                              className={cn(
                                "ml-3 inline-flex size-6 items-center justify-center rounded-full bg-pos-muted text-pos-subtle transition-colors",
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
                );
              }

              if (item.label === "Inventory") {
                return (
                  <InventoryNavDropdown
                    key={item.label}
                    open={inventoryOpen}
                    onOpenChange={handleInventoryOpenChange}
                  />
                );
              }

              if (item.label === "Reports") {
                return (
                  <ReportsNavDropdown
                    key={item.label}
                    open={reportsOpen}
                    onOpenChange={handleReportsOpenChange}
                  />
                );
              }

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={
                    item.label === "Point Of Sale"
                      ? handlePointOfSaleClick
                      : closeNavDropdowns
                  }
                  className={cn(
                    "flex shrink-0 items-center gap-1 rounded px-2.5 py-1.5 text-xs font-medium transition-colors md:text-sm",
                    isActive
                      ? "text-(--repair-on-primary)"
                      : "text-white/90 hover:text-white",
                  )}
                  style={
                    isActive
                      ? { backgroundColor: "var(--repair-primary)" }
                      : { backgroundColor: "transparent" }
                  }
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor =
                        "var(--repair-primary-darker)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  {item.label}
                  {item.hasDropdown ? (
                    <ChevronDown className="size-3.5 opacity-80" />
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2 md:gap-3">
          <ThemeToggle variant="on-dark" />
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
            aria-label="Fullscreen"
          >
            <Maximize2 className="size-5" />
          </button>
          <button
            type="button"
            className="rounded p-1.5 text-white/90 transition-colors hover:bg-white/10"
            aria-label="Notifications"
          >
            <Bell className="size-5" />
          </button>
          <AppLauncherDropdown
            open={appLauncherOpen}
            onOpenChange={handleAppLauncherOpenChange}
          />
        </div>
      </header>
      <RepairPriceCalculatorModal open={calculatorOpen} onOpenChange={setCalculatorOpen} />
      <SelectRegisterModal
        open={selectRegisterOpen}
        onOpenChange={setSelectRegisterOpen}
        onRegisterSelected={() => {
          router.push("/repairs");
        }}
      />
    </>
  );
}
