"use client";

import { cn } from "@/lib/utils";

interface ChartContainerProps {
  children: React.ReactNode;
  className?: string;
  height?: number;
}

export function ChartContainer({
  children,
  className,
  height = 280,
}: ChartContainerProps) {
  return (
    <div className={cn("w-full", className)} style={{ height }}>
      {children}
    </div>
  );
}
