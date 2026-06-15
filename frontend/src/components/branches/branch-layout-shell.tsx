"use client";

import { Menu } from "lucide-react";
import { useState } from "react";
import { RepairsTopNav } from "@/components/repairs/repairs-top-nav";
import { BranchSidebar } from "@/components/branches/branch-sidebar";
import { Button } from "@/components/ui/button";
import { useBranch } from "@/hooks/use-branches";
import { Loader2 } from "lucide-react";

interface BranchDetailLayoutShellProps {
  branchUuid: string;
  children: React.ReactNode;
}

export function BranchDetailLayoutShell({ branchUuid, children }: BranchDetailLayoutShellProps) {
  const { data: branch, isLoading, isError } = useBranch(branchUuid);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="repairs-pos-theme flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <RepairsTopNav />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center bg-[#F9FAFB]">
            <Loader2 className="size-8 animate-spin text-(--repair-primary)" />
          </div>
        ) : isError || !branch ? (
          <div className="flex flex-1 items-center justify-center bg-[#F9FAFB] p-6 text-center">
            <p className="text-sm text-[#6B7280]">Branch not found.</p>
          </div>
        ) : (
          <>
            <BranchSidebar
              branch={branch}
              mobileOpen={mobileSidebarOpen}
              onMobileClose={() => setMobileSidebarOpen(false)}
            />
            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
              <div className="flex items-center border-b border-[#E5E7EB] bg-white px-4 py-2 md:hidden">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 rounded-sm border-[#E5E7EB]"
                  onClick={() => setMobileSidebarOpen(true)}
                >
                  <Menu className="size-4" />
                  Branch menu
                </Button>
              </div>
              <main className="scrollbar-hide min-h-0 flex-1 overflow-auto bg-[#F9FAFB]">
                {children}
              </main>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function BranchListLayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="repairs-pos-theme flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <RepairsTopNav />
      <main className="scrollbar-hide min-h-0 flex-1 overflow-auto bg-[#F9FAFB]">{children}</main>
    </div>
  );
}
