"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import gsap from "gsap";
import { MAIN_NAV } from "@/constants/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SidebarNavProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

export function SidebarNav({ collapsed, onNavigate }: SidebarNavProps) {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    "User Management": true,
    Stock: true,
  });

  useEffect(() => {
    gsap.fromTo(
      "[data-nav-item]",
      { opacity: 0, x: -8 },
      { opacity: 1, x: 0, duration: 0.4, stagger: 0.03, ease: "power2.out" },
    );
  }, []);

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <ScrollArea className="flex-1 px-3">
      <nav className="space-y-1 pb-4">
        {MAIN_NAV.map((item) => {
          const Icon = item.icon;
          const isActive = item.href ? pathname === item.href : false;
          const hasChildren = Boolean(item.children?.length);
          const isOpen = openGroups[item.title];

          if (hasChildren && !collapsed) {
            return (
              <div key={item.title} data-nav-item>
                <button
                  type="button"
                  onClick={() => toggleGroup(item.title)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
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
                  <div className="min-h-0 space-y-0.5 py-1 pl-9">
                    {item.children?.map((child) => {
                      const childActive = pathname === child.href;
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={onNavigate}
                          className={cn(
                            "block rounded-lg px-3 py-2 text-sm transition-colors",
                            childActive
                              ? "bg-primary/10 font-medium text-primary"
                              : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                          )}
                        >
                          {child.title}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          }

          return (
            <Link
              key={item.title}
              href={item.href ?? "#"}
              data-nav-item
              onClick={onNavigate}
              title={collapsed ? item.title : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all mt-1",
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
