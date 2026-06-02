"use client";

import { Download, MoreHorizontal, RefreshCw, Search, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_TYPES,
  STOCK_STATUS_FILTERS,
} from "@/lib/inventory-products-demo-data";

const selectClass =
  "h-10 w-full border-neutral-200 bg-white text-sm shadow-sm focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary";

export interface ProductFiltersState {
  search: string;
  category: string;
  stockStatus: string;
  productType: string;
}

interface ProductFiltersProps {
  filters: ProductFiltersState;
  onFiltersChange: (next: ProductFiltersState) => void;
  onReset: () => void;
  disabled?: boolean;
}

export function ProductFilters({
  filters,
  onFiltersChange,
  onReset,
  disabled,
}: ProductFiltersProps) {
  const set = (patch: Partial<ProductFiltersState>) => {
    onFiltersChange({ ...filters, ...patch });
  };

  return (
    <div className="space-y-4 border-b border-neutral-200/90 pb-4">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400" />
        <Input
          value={filters.search}
          onChange={(e) => set({ search: e.target.value })}
          placeholder="Search products by name, SKU, barcode, or category"
          className="h-10 border-neutral-200 bg-white pl-10 pr-3 text-sm shadow-sm placeholder:text-neutral-400"
          aria-label="Search products"
          disabled={disabled}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-neutral-600">Category</Label>
          <Select
            value={filters.category}
            onValueChange={(v) => set({ category: v ?? "All" })}
            disabled={disabled}
          >
            <SelectTrigger className={selectClass}>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {PRODUCT_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-neutral-600">Stock status</Label>
          <Select
            value={filters.stockStatus}
            onValueChange={(v) => set({ stockStatus: v ?? "All" })}
            disabled={disabled}
          >
            <SelectTrigger className={selectClass}>
              <SelectValue placeholder="Stock status" />
            </SelectTrigger>
            <SelectContent>
              {STOCK_STATUS_FILTERS.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-neutral-600">Product type</Label>
          <Select
            value={filters.productType}
            onValueChange={(v) => set({ productType: v ?? "All" })}
            disabled={disabled}
          >
            <SelectTrigger className={selectClass}>
              <SelectValue placeholder="Product type" />
            </SelectTrigger>
            <SelectContent>
              {PRODUCT_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button
            type="button"
            variant="outline"
            className="h-10 w-full border-neutral-200 bg-white text-neutral-700 shadow-sm hover:bg-neutral-50"
            onClick={onReset}
            disabled={disabled}
          >
            Reset filters
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          className="h-9 gap-2 border-neutral-200 bg-white text-neutral-700 shadow-sm hover:bg-neutral-50"
          disabled={disabled}
        >
          <Download className="size-4" />
          Export
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-9 gap-2 border-neutral-200 bg-white text-neutral-700 shadow-sm hover:bg-neutral-50"
          disabled={disabled}
        >
          <Upload className="size-4" />
          Import
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-9 gap-2 border-neutral-200 bg-white text-neutral-700 shadow-sm hover:bg-neutral-50"
          disabled={disabled}
        >
          <MoreHorizontal className="size-4" />
          Bulk Actions
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="ml-auto size-9 border-neutral-200 bg-white text-neutral-600 shadow-sm hover:bg-neutral-50"
          aria-label="Refresh products"
          disabled={disabled}
        >
          <RefreshCw className="size-4" />
        </Button>
      </div>
    </div>
  );
}
