"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setMobileSidebarOpen, setSidebarCollapsed } from "@/store/ui-slice";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { AppThemeToolbar } from "./app-theme-toolbar";

const AppNavbar = dynamic(
  () => import("./app-navbar").then((m) => m.AppNavbar),
  { ssr: false },
);

const AppSidebar = dynamic(
  () => import("./app-sidebar").then((m) => m.AppSidebar),
  { ssr: false, loading: () => <aside className="hidden w-[72px] shrink-0 lg:block" /> },
);

function isRepairsRoute(pathname: string) {
  return (
    pathname === "/repairs" ||
    pathname.startsWith("/repairs/") ||
    pathname === "/inventory" ||
    pathname.startsWith("/inventory/") ||
    pathname === "/purchases" ||
    pathname.startsWith("/purchases/") ||
    pathname === "/reports" ||
    pathname.startsWith("/reports/") ||
    pathname === "/settings" ||
    pathname.startsWith("/settings/") ||
    pathname === "/profile" ||
    pathname.startsWith("/profile/") ||
    pathname === "/branches" ||
    pathname.startsWith("/branches/")
  );
}

const IDLE_PREFETCH_ROUTES = ["/dashboard", "/repairs", "/users", "/roles"] as const;

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const mobileOpen = useAppSelector((s) => s.ui.mobileSidebarOpen);
  const repairsLayout = isRepairsRoute(pathname);

  useEffect(() => {
    const prefetch = () => {
      for (const href of IDLE_PREFETCH_ROUTES) {
        router.prefetch(href);
      }
    };
    if (typeof requestIdleCallback !== "undefined") {
      const id = requestIdleCallback(prefetch, { timeout: 2000 });
      return () => cancelIdleCallback(id);
    }
    prefetch();
  }, [router]);

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
          ? "repairs-pos-theme flex h-screen min-h-screen overflow-hidden"
          : "dashboard-surface flex min-h-screen"
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
