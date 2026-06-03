"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setMobileSidebarOpen, setSidebarCollapsed } from "@/store/ui-slice";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { AppNavbar } from "./app-navbar";
import { AppSidebar } from "./app-sidebar";
import { AppThemeToolbar } from "./app-theme-toolbar";

function isRepairsRoute(pathname: string) {
  return (
    pathname === "/repairs" ||
    pathname.startsWith("/repairs/") ||
    pathname === "/inventory" ||
    pathname.startsWith("/inventory/") ||
    pathname === "/purchases" ||
    pathname.startsWith("/purchases/")
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const mobileOpen = useAppSelector((s) => s.ui.mobileSidebarOpen);
  const repairsLayout = isRepairsRoute(pathname);

  useEffect(() => {
    if (!repairsLayout) return;

    dispatch(setSidebarCollapsed(true));
    dispatch(setMobileSidebarOpen(false));

    return () => {
      dispatch(setSidebarCollapsed(false));
    };
  }, [repairsLayout, dispatch]);

  return (
    <div
      className={
        repairsLayout
          ? "flex h-screen min-h-screen overflow-hidden bg-[#F8FAFC]"
          : "flex min-h-screen bg-[#f4f6f9] dark:bg-background"
      }
    >
      <div className="hidden lg:block">
        <AppSidebar
          variant={repairsLayout ? "repairs" : "default"}
          className="sticky top-0 h-screen shrink-0"
        />
      </div>

      <Sheet open={mobileOpen} onOpenChange={(open) => dispatch(setMobileSidebarOpen(open))}>
        <SheetContent side="left" className="w-[min(100%,280px)] p-0">
          <AppSidebar
            variant={repairsLayout ? "repairs" : "default"}
            mobile
            onClose={() => dispatch(setMobileSidebarOpen(false))}
          />
        </SheetContent>
      </Sheet>

      {repairsLayout ? (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {children}
        </div>
      ) : (
        <div className="flex min-w-0 flex-1 flex-col">
          <AppNavbar />
          <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      )}

      <AppThemeToolbar />
    </div>
  );
}
