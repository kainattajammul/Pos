"use client";

import {
  ChevronDown,
  Lightbulb,
  Plus,
  Settings2,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ProductPageToolbarProps {
  onAddProduct: () => void;
  filtersOpen?: boolean;
  onToggleFilters?: () => void;
  onClearFilters?: () => void;
  insightsOpen?: boolean;
  onToggleInsights?: () => void;
}

const outlineBtn =
  "h-9 gap-1.5 rounded border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-700 shadow-sm hover:bg-neutral-50";

export function ProductPageToolbar({
  onAddProduct,
  filtersOpen = true,
  onToggleFilters,
  onClearFilters,
  insightsOpen = true,
  onToggleInsights,
}: ProductPageToolbarProps) {
  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-3">
      <h1 className="shrink-0 text-xl font-semibold text-neutral-800 md:text-[22px]">
        Manage Products
      </h1>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          className={cn(
            outlineBtn,
            "border-primary/40 text-primary",
            filtersOpen && "bg-primary/5",
          )}
          onClick={onToggleFilters}
        >
          New Filter
          <span
            role="button"
            tabIndex={0}
            className="inline-flex rounded-sm p-0.5 hover:bg-primary/10"
            aria-label="Clear filters"
            onClick={(e) => {
              e.stopPropagation();
              onClearFilters?.();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                onClearFilters?.();
              }
            }}
          >
            <X className="size-3.5 opacity-70" />
          </span>
        </Button>

        <Button
          type="button"
          variant="outline"
          className={cn(outlineBtn, insightsOpen && "bg-neutral-50")}
          onClick={onToggleInsights}
        >
          <Lightbulb className="size-4 text-neutral-500" />
          Insights
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button type="button" variant="outline" className={outlineBtn} />
            }
          >
            Import/Export
            <ChevronDown className="size-4 text-neutral-500" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem>
              <Upload className="size-4" />
              Import products
            </DropdownMenuItem>
            <DropdownMenuItem>Export CSV</DropdownMenuItem>
            <DropdownMenuItem>Export Excel</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button type="button" variant="outline" className={outlineBtn} />
            }
          >
            <Settings2 className="size-4 text-neutral-500" />
            Actions
            <ChevronDown className="size-4 text-neutral-500" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>Bulk update prices</DropdownMenuItem>
            <DropdownMenuItem>Print barcodes</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">Delete selected</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          type="button"
          onClick={onAddProduct}
          className="h-9 gap-1.5 rounded border-0 bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
        >
          <Plus className="size-4" />
          Add Product
        </Button>
      </div>
    </div>
  );
}
