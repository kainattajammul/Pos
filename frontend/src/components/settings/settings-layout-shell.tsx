"use client";

import { Menu } from "lucide-react";
import { useState } from "react";
import { RepairsTopNav } from "@/components/repairs/repairs-top-nav";
import { SettingsNotificationBanner } from "@/components/settings/settings-notification-banner";
import { SettingsSidebar } from "@/components/settings/settings-sidebar";
import { Button } from "@/components/ui/button";

export function SettingsLayoutShell({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="repairs-pos-theme flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <RepairsTopNav />
      <SettingsNotificationBanner />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <SettingsSidebar
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex items-center border-b border-pos bg-pos-surface px-4 py-2 md:hidden">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 rounded-sm border-pos"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu className="size-4" />
              Settings menu
            </Button>
          </div>
          <main className="scrollbar-hide min-h-0 flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}
