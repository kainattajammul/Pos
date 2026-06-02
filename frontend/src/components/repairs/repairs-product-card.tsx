"use client";

import { useState } from "react";
import {
  Battery,
  Cable,
  Headphones,
  Layers,
  Minus,
  Package,
  Plug,
  Plus,
  Shield,
  Smartphone,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCartMoney } from "@/lib/repair-cart";
import {
  PRODUCT_STOCK_LABEL,
  type ProductStockStatus,
  type RepairAccessoryProduct,
} from "@/lib/repairs-products-data";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "Phone Cases": Smartphone,
  "Screen Protectors": Shield,
  Chargers: Plug,
  "Charging Cables": Cable,
  Batteries: Battery,
  Earphones: Headphones,
  Accessories: Layers,
  "Replacement Parts": Wrench,
};

function stockBadgeClass(status: ProductStockStatus): string {
  switch (status) {
    case "in_stock":
      return "bg-[#ECFDF5] text-[#047857] ring-1 ring-[#A7F3D0]";
    case "limited_stock":
      return "bg-[#FFFBEB] text-[#B45309] ring-1 ring-[#FDE68A]";
    case "out_of_stock":
      return "bg-[#FEF2F2] text-[#B91C1C] ring-1 ring-[#FECACA]";
  }
}

interface RepairsProductCardProps {
  product: RepairAccessoryProduct;
  qtyInCart: number;
  onAdd: (qty: number) => void;
}

export function RepairsProductCard({ product, qtyInCart, onAdd }: RepairsProductCardProps) {
  const [qty, setQty] = useState(1);
  const outOfStock = product.stockStatus === "out_of_stock";
  const canAdd = !outOfStock;
  const Icon = CATEGORY_ICONS[product.category] ?? Package;

  const handleAdd = () => {
    if (!canAdd) return;
    onAdd(qty);
    setQty(1);
  };

  return (
    <article
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm transition-all",
        canAdd && "hover:border-(--repair-primary) hover:shadow-md",
        outOfStock && "opacity-[0.92]",
      )}
    >
      <div className="relative flex h-36 items-center justify-center bg-[#F3F4F6] p-3 sm:h-40 sm:p-4">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt=""
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <div
            className="flex size-16 items-center justify-center rounded-xl"
            style={{
              background: `linear-gradient(135deg, color-mix(in srgb, var(--repair-primary) 18%, white) 0%, color-mix(in srgb, var(--repair-accent-end) 12%, white) 100%)`,
            }}
          >
            <Icon className="size-8 text-(--repair-primary)" strokeWidth={1.5} aria-hidden />
          </div>
        )}
        <span
          className={cn(
            "absolute top-2.5 right-2.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            stockBadgeClass(product.stockStatus),
          )}
        >
          {PRODUCT_STOCK_LABEL[product.stockStatus]}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        <p className="text-[11px] font-medium uppercase tracking-wide text-[#9CA3AF]">
          {product.category}
        </p>
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-[#111827]">
          {product.name}
        </h3>
        <p className="mt-1.5 line-clamp-2 flex-1 text-xs leading-relaxed text-[#6B7280]">
          {product.description}
        </p>
        <p className="mt-2.5 text-base font-bold tabular-nums text-[#111827] sm:mt-3 sm:text-lg">
          {formatCartMoney(product.price)}
        </p>

        {canAdd ? (
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex w-full items-center justify-center rounded-md border border-[#E5E7EB] bg-[#F9FAFB] sm:w-auto sm:justify-start">
              <button
                type="button"
                className="flex size-9 items-center justify-center text-[#6B7280] hover:bg-white hover:text-[#111827] disabled:opacity-40"
                onClick={() => setQty((n) => Math.max(1, n - 1))}
                disabled={qty <= 1}
                aria-label="Decrease quantity"
              >
                <Minus className="size-4" />
              </button>
              <span className="min-w-8 text-center text-sm font-semibold tabular-nums text-[#111827]">
                {qty}
              </span>
              <button
                type="button"
                className="flex size-9 items-center justify-center text-[#6B7280] hover:bg-white hover:text-[#111827]"
                onClick={() => setQty((n) => n + 1)}
                aria-label="Increase quantity"
              >
                <Plus className="size-4" />
              </button>
            </div>
            <Button
              type="button"
              onClick={handleAdd}
              className="h-9 w-full flex-1 border-0 text-xs font-semibold text-(--repair-on-primary) shadow-sm hover:opacity-90 sm:w-auto"
              style={{
                background: `linear-gradient(135deg, var(--repair-primary) 0%, var(--repair-accent-end) 100%)`,
              }}
            >
              {qtyInCart > 0 ? `Add more (${qtyInCart} in cart)` : "Add to booking"}
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            disabled
            className="mt-4 h-9 w-full cursor-not-allowed border-[#E5E7EB] bg-[#F3F4F6] text-xs font-semibold text-[#9CA3AF]"
          >
            Out of Stock
          </Button>
        )}
      </div>
    </article>
  );
}
