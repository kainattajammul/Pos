"use client";

import { Pin, PinOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FILTER_SELECT_OPTIONS } from "@/lib/inventory-products-demo-data";
import { cn } from "@/lib/utils";

export interface ProductAdvancedFiltersState {
  id: string;
  name: string;
  category: string;
  brand: string;
  model: string;
  skuUpc: string;
  imei: string;
  serial: string;
  supplier: string;
  valuationMethod: string;
  criteria: string;
  hideOutOfStock: boolean;
}

export const DEFAULT_PRODUCT_ADVANCED_FILTERS: ProductAdvancedFiltersState = {
  id: "",
  name: "",
  category: "",
  brand: "",
  model: "",
  skuUpc: "",
  imei: "",
  serial: "",
  supplier: "",
  valuationMethod: "",
  criteria: "",
  hideOutOfStock: false,
};

interface ProductAdvancedFiltersProps {
  filters: ProductAdvancedFiltersState;
  onChange: (filters: ProductAdvancedFiltersState) => void;
  pinned: boolean;
  onPinnedChange: (pinned: boolean) => void;
  onReset: () => void;
  onSearch: () => void;
}

function FilterField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Label className="text-xs font-medium text-neutral-600">{label}</Label>
      {children}
    </div>
  );
}

const fieldInputClass =
  "h-9 rounded border-neutral-200 bg-white text-sm shadow-none placeholder:text-neutral-400";

const fieldSelectClass = "h-9 w-full rounded border-neutral-200 bg-white text-sm shadow-none";

export function ProductAdvancedFilters({
  filters,
  onChange,
  pinned,
  onPinnedChange,
  onReset,
  onSearch,
}: ProductAdvancedFiltersProps) {
  const patch = (partial: Partial<ProductAdvancedFiltersState>) =>
    onChange({ ...filters, ...partial });

  if (!pinned) {
    return (
      <div className="flex items-center justify-between rounded border border-neutral-200 bg-white px-4 py-2.5 shadow-sm">
        <span className="text-sm text-neutral-500">Filters are unpinned</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-1.5 text-primary"
          onClick={() => onPinnedChange(true)}
        >
          <Pin className="size-4" />
          Pin Filter
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <FilterField label="ID">
          <Input
            placeholder="Enter ID"
            value={filters.id}
            onChange={(e) => patch({ id: e.target.value })}
            className={fieldInputClass}
          />
        </FilterField>
        <FilterField label="Name">
          <Input
            placeholder="Enter name"
            value={filters.name}
            onChange={(e) => patch({ name: e.target.value })}
            className={fieldInputClass}
          />
        </FilterField>
        <FilterField label="Category">
          <Select
            value={filters.category || "all"}
            onValueChange={(v: string | null) => patch({ category: v === "all" || !v ? "" : v })}
          >
            <SelectTrigger className={fieldSelectClass}>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Select category</SelectItem>
              {FILTER_SELECT_OPTIONS.categories
                .filter(Boolean)
                .map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </FilterField>
        <FilterField label="Brand">
          <Select
            value={filters.brand || "all"}
            onValueChange={(v: string | null) => patch({ brand: v === "all" || !v ? "" : v })}
          >
            <SelectTrigger className={fieldSelectClass}>
              <SelectValue placeholder="Select brand" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Select brand</SelectItem>
              {FILTER_SELECT_OPTIONS.brands
                .filter(Boolean)
                .map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField label="Model">
          <Select
            value={filters.model || "all"}
            onValueChange={(v: string | null) => patch({ model: v === "all" || !v ? "" : v })}
          >
            <SelectTrigger className={fieldSelectClass}>
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Select model</SelectItem>
              {FILTER_SELECT_OPTIONS.models
                .filter(Boolean)
                .map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </FilterField>
        <FilterField label="SKU/UPC">
          <Input
            placeholder="Enter SKU/UPC"
            value={filters.skuUpc}
            onChange={(e) => patch({ skuUpc: e.target.value })}
            className={fieldInputClass}
          />
        </FilterField>
        <FilterField label="IMEI">
          <Input
            placeholder="Enter IMEI"
            value={filters.imei}
            onChange={(e) => patch({ imei: e.target.value })}
            className={fieldInputClass}
          />
        </FilterField>
        <FilterField label="Serial">
          <Input
            placeholder="Enter serial"
            value={filters.serial}
            onChange={(e) => patch({ serial: e.target.value })}
            className={fieldInputClass}
          />
        </FilterField>

        <FilterField label="Supplier">
          <Select
            value={filters.supplier || "all"}
            onValueChange={(v: string | null) => patch({ supplier: v === "all" || !v ? "" : v })}
          >
            <SelectTrigger className={fieldSelectClass}>
              <SelectValue placeholder="Select supplier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Select supplier</SelectItem>
              {FILTER_SELECT_OPTIONS.suppliers
                .filter(Boolean)
                .map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </FilterField>
        <FilterField label="Valuation Method">
          <Select
            value={filters.valuationMethod || "all"}
            onValueChange={(v: string | null) =>
              patch({ valuationMethod: v === "all" || !v ? "" : v })
            }
          >
            <SelectTrigger className={fieldSelectClass}>
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Select method</SelectItem>
              {FILTER_SELECT_OPTIONS.valuationMethods
                .filter(Boolean)
                .map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </FilterField>
        <FilterField label="Criteria">
          <Select
            value={filters.criteria || "all"}
            onValueChange={(v: string | null) => patch({ criteria: v === "all" || !v ? "" : v })}
          >
            <SelectTrigger className={fieldSelectClass}>
              <SelectValue placeholder="Select criteria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Select criteria</SelectItem>
              {FILTER_SELECT_OPTIONS.criteria
                .filter(Boolean)
                .map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </FilterField>
        <div className="flex items-end pb-1">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700">
            <Checkbox
              checked={filters.hideOutOfStock}
              onCheckedChange={(checked) =>
                patch({ hideOutOfStock: checked === true })
              }
            />
            Hide out of stock
          </label>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-1.5 text-neutral-600 hover:text-neutral-800"
          onClick={() => onPinnedChange(false)}
        >
          <PinOff className="size-4" />
          Unpin Filter
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onReset}
            className="text-sm font-medium text-primary hover:underline"
          >
            Reset
          </button>
          <button
            type="button"
            className="text-sm font-medium text-primary hover:underline"
          >
            Save Filter
          </button>
          <Button
            type="button"
            onClick={onSearch}
            className={cn(
              "h-9 min-w-[88px] rounded bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90",
            )}
          >
            Search
          </Button>
        </div>
      </div>
    </div>
  );
}
