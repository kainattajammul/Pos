"use client";

import type { Column, ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { InventoryProduct } from "@/types/inventory-product";

function formatMoney(amount: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function SortableHeader({
  column,
  title,
  className,
}: {
  column: Column<InventoryProduct, unknown>;
  title: string;
  className?: string;
}) {
  const sorted = column.getIsSorted();
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center gap-1.5 text-left font-semibold tracking-tight text-neutral-800 transition hover:text-neutral-950",
        column.getCanSort() && "cursor-pointer select-none",
        className,
      )}
      onClick={column.getToggleSortingHandler()}
      disabled={!column.getCanSort()}
    >
      {title}
      {column.getCanSort() ? (
        <ArrowUpDown
          className={cn(
            "size-3.5 shrink-0 text-neutral-400",
            sorted === "asc" && "text-neutral-700",
            sorted === "desc" && "text-neutral-700",
          )}
        />
      ) : null}
    </button>
  );
}

export function createProductColumns(handlers: {
  onEdit: (product: InventoryProduct) => void;
  onDelete: (product: InventoryProduct) => void;
  onAdjustInventory: (product: InventoryProduct) => void;
}): ColumnDef<InventoryProduct>[] {
  const { onEdit, onDelete, onAdjustInventory } = handlers;

  return [
    {
      id: "select",
      enableSorting: false,
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(checked) => table.toggleAllPageRowsSelected(checked === true)}
          aria-label="Select all rows"
          className="border-neutral-300"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(checked) => row.toggleSelected(checked === true)}
          aria-label={`Select ${row.original.name}`}
          className="border-neutral-300"
        />
      ),
    },
    {
      accessorKey: "numericId",
      header: ({ column }) => <SortableHeader column={column} title="ID" />,
      cell: ({ row }) => (
        <span className="text-sm font-semibold text-primary">#{row.original.numericId}</span>
      ),
    },
    {
      accessorKey: "name",
      header: ({ column }) => <SortableHeader column={column} title="Product" />,
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="min-w-[250px] max-w-[420px]">
            <p className="line-clamp-2 text-[13px] font-medium leading-5 text-primary">{p.name}</p>
          </div>
        );
      },
    },
    {
      id: "image",
      header: () => <span className="text-neutral-700">Image</span>,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="size-8 overflow-hidden rounded border border-neutral-200 bg-white">
          {row.original.imageUrl ? (
            <Image
              src={row.original.imageUrl}
              alt={row.original.name}
              width={32}
              height={32}
              className="size-full object-contain"
            />
          ) : null}
        </div>
      ),
    },
    {
      accessorKey: "brand",
      header: ({ column }) => <SortableHeader column={column} title="Brand" />,
      cell: ({ row }) => <span className="text-neutral-700">{row.original.brand}</span>,
    },
    {
      accessorKey: "category",
      header: ({ column }) => <SortableHeader column={column} title="Category" />,
      cell: ({ row }) => (
        <span className="text-neutral-700">{row.original.category}</span>
      ),
    },
    {
      accessorKey: "model",
      header: ({ column }) => <SortableHeader column={column} title="Model" />,
      cell: ({ row }) => <span className="text-neutral-700">{row.original.model}</span>,
    },
    {
      accessorKey: "stockWarning",
      header: ({ column }) => <SortableHeader column={column} title="Stock Warning" />,
      cell: ({ row }) => (
        <span className="tabular-nums text-neutral-700">{row.original.stockWarning}</span>
      ),
    },
    {
      accessorKey: "reorderLevel",
      header: ({ column }) => <SortableHeader column={column} title="Reorder Level" />,
      cell: ({ row }) => (
        <span className="tabular-nums text-neutral-700">{row.original.reorderLevel}</span>
      ),
    },
    {
      accessorKey: "stock",
      header: ({ column }) => <SortableHeader column={column} title="On Hand" />,
      cell: ({ row }) => (
        <button
          type="button"
          className="tabular-nums font-medium text-neutral-800 underline-offset-2 hover:text-primary hover:underline"
          onClick={() => onAdjustInventory(row.original)}
        >
          {row.original.stock}
        </button>
      ),
    },
    {
      accessorKey: "salePrice",
      header: ({ column }) => <SortableHeader column={column} title="Price" />,
      cell: ({ row }) => <span className="tabular-nums text-neutral-700">{formatMoney(row.original.salePrice)}</span>,
    },
    {
      accessorKey: "costPrice",
      header: ({ column }) => <SortableHeader column={column} title="Unit Cost" />,
      cell: ({ row }) => <span className="tabular-nums text-neutral-700">{formatMoney(row.original.costPrice)}</span>,
    },
    {
      id: "actions",
      // header rendered externally by DataTable so the gear trigger has access to panel state
      header: () => null,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-0.5">
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            className="size-8 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
            aria-label={`Edit ${row.original.name}`}
            onClick={() => onEdit(row.original)}
          >
            <Pencil className="size-3.5" strokeWidth={1.75} />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            className="size-8 text-neutral-500 hover:bg-neutral-100 hover:text-red-600"
            aria-label={`Delete ${row.original.name}`}
            onClick={() => onDelete(row.original)}
          >
            <Trash2 className="size-3.5" strokeWidth={1.75} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  className="size-8 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
                  aria-label={`More actions for ${row.original.name}`}
                />
              }
            >
              <MoreHorizontal className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem onClick={() => onEdit(row.original)}>Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(row.original)}>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
}
