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
  onNewFilter?: () => void;
}

const outlineBtn =
  "h-9 gap-1.5 rounded border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-700 shadow-sm hover:bg-neutral-50";

export function ProductPageToolbar({ onAddProduct, onNewFilter }: ProductPageToolbarProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <h1 className="text-xl font-semibold text-neutral-800 md:text-[22px]">
        Manage Products
      </h1>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          className={cn(outlineBtn, "border-primary/40 text-primary")}
          onClick={onNewFilter}
        >
          New Filter
          <X className="size-3.5 opacity-70" />
        </Button>

        <Button type="button" variant="outline" className={outlineBtn}>
          <Lightbulb className="size-4 text-neutral-500" />
          Insights
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button type="button" variant="outline" className={outlineBtn}>
                Import/Export
                <ChevronDown className="size-4 text-neutral-500" />
              </Button>
            }
          />
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
              <Button type="button" variant="outline" className={outlineBtn}>
                <Settings2 className="size-4 text-neutral-500" />
                Actions
                <ChevronDown className="size-4 text-neutral-500" />
              </Button>
            }
          />
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
