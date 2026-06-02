"use client";

import type { Table } from "@tanstack/react-table";
import {
  ColumnCustomizer,
  type ColumnMeta,
} from "@/components/inventory/products/column-customizer";
import { DataTable } from "@/components/data-table/data-table";
import type { InventoryProduct } from "@/types/inventory-product";

interface ProductTableProps {
  table: Table<InventoryProduct>;
  emptyMessage?: string;
  customizerProps?: {
    columns: ColumnMeta[];
    columnOrder: string[];
    hiddenColumns: Set<string>;
    onSave: (order: string[], hidden: Set<string>) => void;
  };
}

export function ProductTable({
  table,
  emptyMessage = "No products match your filters.",
  customizerProps,
}: ProductTableProps) {
  return (
    <DataTable
      table={table}
      totalFilteredRows={table.getFilteredRowModel().rows.length}
      wrapColumnIds={["name"]}
      emptyMessage={emptyMessage}
      actionsHeaderContent={
        customizerProps ? <ColumnCustomizer {...customizerProps} /> : undefined
      }
    />
  );
}
