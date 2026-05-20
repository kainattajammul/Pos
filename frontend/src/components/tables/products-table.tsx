"use client";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown, Download, MoreHorizontal, Search } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { mockProducts } from "@/lib/mock-data";
import type { ProductTableRow } from "@/types/dashboard";
import { formatCurrency, formatPercent } from "@/utils/format";
import { cn } from "@/lib/utils";

const statusVariant = {
  in_stock: "default",
  low_stock: "secondary",
  out_of_stock: "destructive",
} as const;

const statusLabel = {
  in_stock: "In stock",
  low_stock: "Low stock",
  out_of_stock: "Out of stock",
} as const;

const columns: ColumnDef<ProductTableRow>[] = [
  {
    accessorKey: "serialNo",
    header: "S.No",
    cell: ({ row }) => (
      <span className="font-medium text-primary">{row.original.serialNo}</span>
    ),
  },
  {
    accessorKey: "name",
    header: "Products",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted text-xs font-semibold text-muted-foreground">
          {row.original.imageUrl ? (
            <Image src={row.original.imageUrl} alt="" fill className="object-cover" />
          ) : (
            "📱"
          )}
        </div>
        <span className="font-medium">{row.original.name}</span>
      </div>
    ),
  },
  {
    accessorKey: "revenueDate",
    header: "Revenue By Date",
  },
  {
    accessorKey: "sell",
    header: "Sell",
    cell: ({ row }) => formatCurrency(row.original.sell),
  },
  {
    accessorKey: "stock",
    header: "Stock",
    cell: ({ row }) => formatCurrency(row.original.stock),
  },
  {
    accessorKey: "profit",
    header: "Profit",
    cell: ({ row }) => formatPercent(row.original.profit),
  },
  {
    accessorKey: "totalSales",
    header: "Total sales",
    cell: ({ row }) => (
      <span className="font-semibold">{formatCurrency(row.original.totalSales)}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={statusVariant[row.original.status]}>
        {statusLabel[row.original.status]}
      </Badge>
    ),
  },
  {
    id: "actions",
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-xs" />}>
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>View details</DropdownMenuItem>
          <DropdownMenuItem>Edit product</DropdownMenuItem>
          <DropdownMenuItem variant="destructive">Archive</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

interface ProductsTableProps {
  data?: ProductTableRow[];
}

export function ProductsTable({ data = mockProducts }: ProductsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredData = useMemo(() => {
    if (statusFilter === "all") return data;
    return data.filter((row) => row.status === statusFilter);
  }, [data, statusFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 8 } },
  });

  return (
    <div className="rounded-2xl border-0 bg-card/90 p-4 shadow-[0_8px_30px_rgba(15,23,42,0.06)] md:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Products Performance</h2>
          <p className="text-sm text-muted-foreground">Search, filter, and export product sales</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search products..."
              className="h-9 pl-9"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value ?? "all")}
          >
            <SelectTrigger className="h-9 w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="in_stock">In stock</SelectItem>
              <SelectItem value="low_stock">Low stock</SelectItem>
              <SelectItem value="out_of_stock">Out of stock</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="size-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-muted/50 backdrop-blur">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "text-xs font-semibold uppercase tracking-wide text-primary",
                      header.column.getCanSort() && "cursor-pointer select-none",
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <span className="inline-flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() ? (
                        <ArrowUpDown className="size-3 opacity-60" />
                      ) : null}
                    </span>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/30">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <EmptyState
                    title="No products found"
                    description="Try adjusting your search or filters."
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
