"use client";

import { Info } from "lucide-react";
import type { InventoryProduct } from "@/types/inventory-product";
import { cn } from "@/lib/utils";

function formatMoney(amount: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

function SummaryCard({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded border border-neutral-200 bg-white px-4 py-3 shadow-sm">
      <div className="mb-1 flex items-center gap-1.5">
        <span className="text-sm font-medium text-neutral-600">{label}</span>
        <Info className="size-3.5 text-neutral-400" aria-hidden />
      </div>
      <p className={cn("text-xl font-semibold tabular-nums", valueClassName)}>{value}</p>
    </div>
  );
}

export function ProductSummaryCards({ products }: { products: InventoryProduct[] }) {
  const stockRetailValue = products.reduce(
    (sum, p) => sum + p.salePrice * p.stock,
    0,
  );
  const stockCostValue = products.reduce(
    (sum, p) => sum + p.costPrice * p.stock,
    0,
  );
  const lowStockCount = products.filter(
    (p) => p.status === "Low Stock" || (p.stock > 0 && p.stock <= p.lowStockAlert),
  ).length;
  const inPurchaseOrder = products.reduce(
    (sum, p) => sum + (p.inPurchaseOrder ?? 0),
    19,
  );

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        label="Stock Retail Value"
        value={formatMoney(stockRetailValue)}
        valueClassName="text-primary"
      />
      <SummaryCard
        label="Stock Cost Value"
        value={formatMoney(stockCostValue)}
        valueClassName="text-primary"
      />
      <SummaryCard
        label="Low Stock Inventory"
        value={String(lowStockCount)}
        valueClassName="text-[#dc2626]"
      />
      <SummaryCard
        label="In Purchase Order"
        value={String(inPurchaseOrder)}
        valueClassName="text-primary"
      />
    </div>
  );
}
