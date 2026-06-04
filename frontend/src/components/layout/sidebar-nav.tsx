"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MAIN_NAV, type NavChild } from "@/constants/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SidebarNavProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

function isChildLinkActive(pathname: string, href?: string): boolean {
  if (!href || !pathname) return false;
  return (
    pathname === href ||
    (href.length > 1 && pathname.startsWith(`${href}/`))
  );
}

function isChildTreeActive(pathname: string, child: NavChild): boolean {
  if (child.href && isChildLinkActive(pathname, child.href)) return true;
  return child.children?.some((nested) => isChildTreeActive(pathname, nested)) ?? false;
}

function SidebarNavChildLinks({
  items,
  pathname,
  onNavigate,
  depth = 0,
  openGroups,
  toggleGroup,
  prefetchRoutes,
}: {
  items: NavChild[];
  pathname: string;
  onNavigate?: () => void;
  depth?: number;
  openGroups: Record<string, boolean>;
  toggleGroup: (key: string) => void;
  prefetchRoutes: boolean;
}) {
  return (
    <div className={cn("space-y-0.5", depth === 0 ? "pl-9" : "pl-3", depth > 0 && "pt-0.5")}>
      {items.map((child) => {
        const groupKey = `${depth}:${child.title}`;
        const hasNested = Boolean(child.children?.length);
        const nestedOpen = openGroups[groupKey] ?? false;
        const childActive = isChildTreeActive(pathname, child);

        if (hasNested) {
          return (
            <div key={groupKey}>
              <button
                type="button"
                onClick={() => toggleGroup(groupKey)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                  childActive
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                )}
              >
                <span className="flex-1 text-left">{child.title}</span>
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0 transition-transform duration-200",
                    nestedOpen && "rotate-180",
                  )}
                />
              </button>
              <div
                className={cn(
                  "grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out",
                  nestedOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                )}
              >
                <div className="min-h-0">
                    <SidebarNavChildLinks
                      items={child.children!}
                      pathname={pathname}
                      onNavigate={onNavigate}
                      depth={depth + 1}
                      openGroups={openGroups}
                      toggleGroup={toggleGroup}
                      prefetchRoutes={prefetchRoutes}
                    />
                </div>
              </div>
            </div>
          );
        }

        if (!child.href) return null;

        const linkActive = isChildLinkActive(pathname, child.href);

        return (
          <Link
            key={child.href}
            href={child.href}
            prefetch={prefetchRoutes}
            onClick={onNavigate}
            className={cn(
              "block rounded-lg px-3 py-2 text-sm transition-colors",
              linkActive
                ? "bg-primary/10 font-medium text-primary"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
            )}
          >
            {child.title}
          </Link>
        );
      })}
    </div>
  );
}

export function SidebarNav({ collapsed, onNavigate }: SidebarNavProps) {
  const pathname = usePathname() ?? "";
  const prevPathRef = useRef(pathname);
  const [prefetchRoutes, setPrefetchRoutes] = useState(false);

  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      setPrefetchRoutes(true);
      prevPathRef.current = pathname;
    }
  }, [pathname]);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    "User Management": true,
    Customer: true,
    Stock: true,
    "0:Manage Services": true,
  });

  useEffect(() => {
    void import("gsap").then(({ default: gsap }) => {
      gsap.fromTo(
        "[data-nav-item]",
        { opacity: 0, x: -8 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.03, ease: "power2.out" },
      );
    });
  }, []);

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <ScrollArea className="min-h-0 flex-1 px-3">
      <nav className="space-y-1 pb-4">
        {MAIN_NAV.map((item) => {
          const Icon = item.icon;
          const isActive = item.href ? pathname === item.href : false;
          const hasChildren = Boolean(item.children?.length);
          const isOpen = openGroups[item.title];

          if (hasChildren && !collapsed) {
            const groupActive =
              item.children?.some((child) => isChildTreeActive(pathname, child)) ??
              false;

            return (
              <div key={item.title} data-nav-item>
                <button
                  type="button"
                  onClick={() => toggleGroup(item.title)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                    groupActive
                      ? "bg-gray-200 font-medium text-black shadow-sm"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                  )}
                >
                  <Icon className="size-[18px] shrink-0 text-neutral-900" />
                  <span className="flex-1 text-left font-medium">{item.title}</span>
                  <ChevronDown
                    className={cn(
                      "size-4 transition-transform duration-200",
                      isOpen && "rotate-180",
                    )}
                  />
                </button>
                <div
                  className={cn(
                    "grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out",
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                  )}
                >
                  <div className="min-h-0 py-1">
                    <SidebarNavChildLinks
                      items={item.children!}
                      pathname={pathname}
                      onNavigate={onNavigate}
                      openGroups={openGroups}
                      toggleGroup={toggleGroup}
                      prefetchRoutes={prefetchRoutes}
                    />
                  </div>
                </div>
              </div>
            );
          }

          return (
            <Link
              key={item.title}
              href={item.href ?? "#"}
              prefetch={prefetchRoutes && Boolean(item.href)}
              data-nav-item
              onClick={onNavigate}
              title={collapsed ? item.title : undefined}
              className={cn(
                "mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all",
                isActive
                  ? "bg-gray-200 font-medium text-black shadow-sm"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                collapsed && "justify-center px-2",
              )}
            >
              <Icon className="size-[18px] shrink-0 text-neutral-900" />
              {!collapsed ? <span className="font-medium">{item.title}</span> : null}
            </Link>
          );
        })}
      </nav>
    </ScrollArea>
  );
}
