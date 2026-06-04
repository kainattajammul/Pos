"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useEffect, useRef } from "react";
import { APP_CONFIG } from "@/constants/config";
import { useAuth } from "@/hooks/use-auth";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleSidebar } from "@/store/ui-slice";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "./brand-logo";
import { SidebarSignOutButton } from "./sidebar-sign-out-button";

const SidebarNav = dynamic(
  () => import("./sidebar-nav").then((m) => m.SidebarNav),
  { ssr: false, loading: () => <div className="min-h-0 flex-1" /> },
);

type SidebarVariant = "default" | "repairs";

interface AppSidebarProps {
  className?: string;
  mobile?: boolean;
  onClose?: () => void;
  variant?: SidebarVariant;
}

export function AppSidebar({
  className,
  mobile,
  onClose,
  variant = "default",
}: AppSidebarProps) {
  const dispatch = useAppDispatch();
  const collapsed = useAppSelector((s) => s.ui.sidebarCollapsed);
  const { hydrated, isAuthenticated } = useAuth();
  const ref = useRef<HTMLElement>(null);
  const isRepairs = variant === "repairs";
  /** Collapsed desktop: hide logo entirely — toggle only, centered (no leftover gap). */
  const hideLogoCompletely = collapsed && !mobile;
  const showSignOut = hydrated && isAuthenticated;
  const navCollapsed = !mobile && collapsed;

  const collapsedWidth = APP_CONFIG.sidebarCollapsedWidth;

  useEffect(() => {
    if (!ref.current || mobile) return;
    void import("gsap").then(({ default: gsap }) => {
      gsap.to(ref.current, {
        width: collapsed ? collapsedWidth : APP_CONFIG.sidebarWidth,
        duration: 0.35,
        ease: "power3.inOut",
      });
    });
  }, [collapsed, mobile, collapsedWidth]);

  const width = mobile
    ? APP_CONFIG.sidebarWidth
    : collapsed
      ? collapsedWidth
      : APP_CONFIG.sidebarWidth;

  return (
    <aside
      ref={ref}
      style={{ width }}
      className={cn(
        "flex h-full min-h-0 shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar/95 backdrop-blur-xl",
        className,
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center border-b border-sidebar-border",
          hideLogoCompletely
            ? "justify-center px-2 py-3"
            : "justify-between gap-2 px-4 py-5",
        )}
      >
        {!hideLogoCompletely ? <BrandLogo className="min-w-0" /> : null}
        {!mobile ? (
          <Button
            variant="ghost"
            size="icon-xs"
            className="hidden shrink-0 lg:inline-flex"
            onClick={() => dispatch(toggleSidebar())}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen className="size-4" />
            ) : (
              <PanelLeftClose className="size-4" />
            )}
          </Button>
        ) : null}
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <SidebarNav collapsed={navCollapsed} onNavigate={onClose} />
      </div>

      <div
        className={cn(
          "shrink-0 border-t border-sidebar-border",
          isRepairs || showSignOut
            ? navCollapsed
              ? "flex justify-center p-2"
              : "p-3"
            : "space-y-2 p-4",
        )}
      >
        {showSignOut ? (
          <SidebarSignOutButton collapsed={navCollapsed} />
        ) : !isRepairs ? (
          <>
            <Link
              href="/register"
              className="inline-flex h-8 w-full items-center justify-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
            >
              Sign up
            </Link>
            <Link
              href="/login"
              className="inline-flex h-8 w-full items-center justify-center rounded-lg border border-border bg-background px-2.5 text-sm font-medium transition hover:bg-muted"
            >
              Log in
            </Link>
          </>
        ) : null}
      </div>
    </aside>
  );
}
