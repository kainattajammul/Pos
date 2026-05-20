"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setMobileSidebarOpen } from "@/store/ui-slice";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { AppNavbar } from "./app-navbar";
import { AppSidebar } from "./app-sidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const mobileOpen = useAppSelector((s) => s.ui.mobileSidebarOpen);

  return (
    <div className="flex min-h-screen bg-[#f4f6f9] dark:bg-background">
      <div className="hidden lg:block">
        <AppSidebar className="sticky top-0 h-screen" />
      </div>

      <Sheet open={mobileOpen} onOpenChange={(open) => dispatch(setMobileSidebarOpen(open))}>
        <SheetContent side="left" className="w-[min(100%,280px)] p-0">
          <AppSidebar mobile onClose={() => dispatch(setMobileSidebarOpen(false))} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <AppNavbar />
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
