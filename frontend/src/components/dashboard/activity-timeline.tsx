"use client";

import { Package, ShoppingCart, Wrench } from "lucide-react";
import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ActivityItem } from "@/types/dashboard";
import { formatRelativeTime } from "@/utils/format";
import { cn } from "@/lib/utils";

const iconMap = {
  ORDER: ShoppingCart,
  STOCK: Package,
  REPAIR: Wrench,
  PRODUCT: Package,
} as const;

interface ActivityTimelineProps {
  items?: ActivityItem[];
  isLoading?: boolean;
}

export function ActivityTimeline({ items = [], isLoading }: ActivityTimelineProps) {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!listRef.current || !items.length) return;
    void import("gsap").then(({ default: gsap }) => {
      gsap.from(listRef.current!.children, {
        opacity: 0,
        x: 12,
        duration: 0.45,
        stagger: 0.08,
        ease: "power2.out",
      });
    });
  }, [items]);

  if (isLoading) {
    return (
      <Card className="border-0 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-card/90 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
      <CardHeader>
        <CardTitle className="text-lg">Live Activity Feed</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent activity.</p>
        ) : (
          <ul ref={listRef} className="relative space-y-4 before:absolute before:top-2 before:bottom-2 before:left-[15px] before:w-px before:bg-border">
            {items.map((item) => {
              const Icon = iconMap[item.type as keyof typeof iconMap] ?? Package;
              return (
                <li key={item.id} className="relative flex gap-3 pl-8">
                  <span
                    className={cn(
                      "absolute left-0 flex size-8 items-center justify-center rounded-full border bg-background",
                    )}
                  >
                    <Icon className="size-4 text-primary" />
                  </span>
                  <div className="min-w-0 flex-1 rounded-xl bg-muted/40 px-3 py-2.5">
                    <p className="text-sm leading-snug">{item.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatRelativeTime(item.createdAt)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
