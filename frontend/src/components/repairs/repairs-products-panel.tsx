"use client";

import { useMemo, useState } from "react";
import { Package, Search } from "lucide-react";
import { toast } from "sonner";
import { useRepairTicket } from "@/contexts/repair-ticket-context";
import {
  filterProductsForManufacturer,
  REPAIR_ACCESSORY_PRODUCTS,
} from "@/lib/repairs-products-data";
import { getManufacturerById } from "@/lib/repairs-pos-data";
import { RepairsProductCard } from "@/components/repairs/repairs-product-card";
import { cn } from "@/lib/utils";

interface RepairsProductsPanelProps {
  selectedManufacturerId?: string | null;
  manufacturers?: Parameters<typeof getManufacturerById>[1];
}

export function RepairsProductsPanel({
  selectedManufacturerId = null,
  manufacturers = [],
}: RepairsProductsPanelProps) {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | "all">("all");
  const { getAddonProductQtyInCart, addProductToBooking } = useRepairTicket();

  const manufacturer = getManufacturerById(selectedManufacturerId, manufacturers);

  const filteredProducts = useMemo(() => {
    let list = filterProductsForManufacturer(
      REPAIR_ACCESSORY_PRODUCTS,
      selectedManufacturerId,
    );
    if (categoryFilter !== "all") {
      list = list.filter((p) => p.category === categoryFilter);
    }
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      );
    }
    return list;
  }, [selectedManufacturerId, categoryFilter, query]);

  const categories = useMemo(() => {
    const set = new Set(REPAIR_ACCESSORY_PRODUCTS.map((p) => p.category));
    return ["all", ...Array.from(set).sort()];
  }, []);

  const handleAdd = (productId: string, qty: number) => {
    const product = REPAIR_ACCESSORY_PRODUCTS.find((p) => p.id === productId);
    if (!product || product.stockStatus === "out_of_stock") return;
    addProductToBooking(product, qty);
    toast.success(
      qty === 1
        ? `${product.name} added to booking`
        : `${qty}× ${product.name} added to booking`,
    );
  };

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-white">
      <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-5">
        <div className="mb-6 flex items-start gap-3">
          <div
            className="flex size-11 shrink-0 items-center justify-center rounded-lg"
            style={{
              background: `linear-gradient(135deg, var(--repair-primary) 0%, var(--repair-accent-end) 100%)`,
            }}
          >
            <Package className="size-5 text-[var(--repair-on-primary)]" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-[#111827]">Related Products</h2>
            <p className="mt-1 text-sm leading-relaxed text-[#6B7280]">
              Browse accessories and replacement products available for your device.
              Products are optional add-ons to your repair booking.
            </p>
            {manufacturer ? (
              <p className="mt-2 text-xs font-medium text-[var(--repair-primary)]">
                Showing accessories compatible with {manufacturer.name}
              </p>
            ) : (
              <p className="mt-2 text-xs text-[#9CA3AF]">
                Select a device in Repairs to see tailored suggestions.
              </p>
            )}
          </div>
        </div>

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#9CA3AF]"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="h-10 w-full rounded-md border border-[#E5E7EB] bg-white pr-3 pl-9 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-[var(--repair-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--repair-primary)]"
            />
          </div>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                categoryFilter === cat
                  ? "border-[var(--repair-primary)] bg-[color-mix(in_srgb,var(--repair-primary)_12%,white)] text-[var(--repair-primary)]"
                  : "border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#D1D5DB]",
              )}
            >
              {cat === "all" ? "All categories" : cat}
            </button>
          ))}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB] p-8 text-center">
            <p className="text-sm font-medium text-[#374151]">No products found</p>
            <p className="mt-1 text-xs text-[#6B7280]">Try a different search or category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <RepairsProductCard
                key={product.id}
                product={product}
                qtyInCart={getAddonProductQtyInCart(product.id)}
                onAdd={(qty) => handleAdd(product.id, qty)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
