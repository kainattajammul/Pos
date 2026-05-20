"use client";

import Link from "next/link";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { APP_CONFIG } from "@/constants/config";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleSidebar } from "@/store/ui-slice";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "./brand-logo";
import { SidebarNav } from "./sidebar-nav";

interface AppSidebarProps {
  className?: string;
  mobile?: boolean;
  onClose?: () => void;
}

export function AppSidebar({ className, mobile, onClose }: AppSidebarProps) {
  const dispatch = useAppDispatch();
  const collapsed = useAppSelector((s) => s.ui.sidebarCollapsed);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current || mobile) return;
    gsap.to(ref.current, {
      width: collapsed ? APP_CONFIG.sidebarCollapsedWidth : APP_CONFIG.sidebarWidth,
      duration: 0.35,
      ease: "power3.inOut",
    });
  }, [collapsed, mobile]);

  const width = mobile
    ? APP_CONFIG.sidebarWidth
    : collapsed
      ? APP_CONFIG.sidebarCollapsedWidth
      : APP_CONFIG.sidebarWidth;

  return (
    <aside
      ref={ref}
      style={{ width }}
      className={cn(
        "flex h-full shrink-0 flex-col border-r border-sidebar-border bg-sidebar/95 backdrop-blur-xl",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-sidebar-border px-4 py-5">
        <BrandLogo collapsed={!mobile && collapsed} />
        {!mobile ? (
          <Button
            variant="ghost"
            size="icon-xs"
            className="hidden lg:inline-flex"
            onClick={() => dispatch(toggleSidebar())}
          >
            {collapsed ? (
              <PanelLeftOpen className="size-4" />
            ) : (
              <PanelLeftClose className="size-4" />
            )}
          </Button>
        ) : null}
      </div>

      <SidebarNav collapsed={!mobile && collapsed} onNavigate={onClose} />

      <div className="mt-auto space-y-2 border-t border-sidebar-border p-4">
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
      </div>
    </aside>
  );
}
