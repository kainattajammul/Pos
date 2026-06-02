import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ProductStockStatus } from "@/types/inventory-product";

const statusStyles: Record<ProductStockStatus, string> = {
  "In Stock": "border-emerald-200 bg-emerald-50 text-emerald-800",
  "Low Stock": "border-amber-200 bg-amber-50 text-amber-900",
  "Out of Stock": "border-red-200 bg-red-50 text-red-700",
  Draft: "border-neutral-200 bg-neutral-100 text-neutral-700",
};

export function StatusBadge({ status }: { status: ProductStockStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full px-2.5 font-medium", statusStyles[status])}
    >
      {status}
    </Badge>
  );
}
