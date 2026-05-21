"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ChartContainerProps {
  children: React.ReactNode;
  className?: string;
  height?: number;
}

/**
 * Wrapper that gives Recharts a measurable box (avoids width/height -1 warnings).
 */
export function ChartContainer({
  children,
  className,
  height = 280,
}: ChartContainerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const check = () => {
      const { width, height: h } = el.getBoundingClientRect();
      setReady(width > 0 && h > 0);
    };

    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, [height]);

  return (
    <div
      ref={ref}
      className={cn("relative w-full min-w-0", className)}
      style={{ height, minHeight: height }}
    >
      {ready ? (
        <div className="absolute inset-0 min-h-0 min-w-0">{children}</div>
      ) : null}
    </div>
  );
}
