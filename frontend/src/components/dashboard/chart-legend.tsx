import type { ChartLegendItem } from "@/types/dashboard";
import { cn } from "@/lib/utils";

interface ChartLegendProps {
  items: ChartLegendItem[];
  className?: string;
}

export function ChartLegend({ items, className }: ChartLegendProps) {
  return (
    <ul className={cn("space-y-2.5 text-sm", className)}>
      {items.map((item) => (
        <li key={item.label} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-2 text-muted-foreground">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            {item.label}
          </span>
          <span className="font-medium tabular-nums">{item.value.toLocaleString()}</span>
        </li>
      ))}
    </ul>
  );
}
