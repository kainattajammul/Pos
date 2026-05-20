"use client";

import { MoreHorizontal, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Sparkline } from "@/components/charts/sparkline";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { animateCounter } from "@/lib/gsap";
import type { StatCardData } from "@/types/dashboard";
import { cn } from "@/lib/utils";

const accentColors = {
  red: "#ef4444",
  yellow: "#eab308",
  green: "#22c55e",
  blue: "#3b82f6",
} as const;

interface StatCardProps {
  data: StatCardData;
  className?: string;
}

export function StatCard({ data, className }: StatCardProps) {
  const valueRef = useRef<HTMLParagraphElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const color = accentColors[data.accent];
  const TrendIcon = data.trend === "up" ? TrendingUp : TrendingDown;

  useEffect(() => {
    if (!cardRef.current) return;
    gsap.from(cardRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.55,
      ease: "power3.out",
    });
  }, []);

  useEffect(() => {
    if (!valueRef.current) return;
    const tween = animateCounter(valueRef.current, data.value);
    return () => {
      tween.kill();
    };
  }, [data.value]);

  return (
    <Card
      ref={cardRef}
      className={cn(
        "group border-0 bg-card/90 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-sm transition-shadow hover:shadow-[0_12px_40px_rgba(15,23,42,0.1)] dark:shadow-none",
        className,
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <p className="text-sm font-medium text-muted-foreground">{data.title}</p>
        <Button variant="ghost" size="icon-xs" className="opacity-0 transition group-hover:opacity-100">
          <MoreHorizontal className="size-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex items-end justify-between gap-3">
        <div>
          <p ref={valueRef} className="text-3xl font-bold tracking-tight md:text-4xl">
            0
          </p>
          <p
            className={cn(
              "mt-2 flex items-center gap-1 text-xs font-medium",
              data.trend === "up" ? "text-emerald-600" : "text-amber-600",
            )}
          >
            <TrendIcon className="size-3.5" />
            {data.trend === "up" ? "+" : "-"}
            {data.change}% vs last month
          </p>
        </div>
        <Sparkline data={data.sparkline} color={color} />
      </CardContent>
    </Card>
  );
}
