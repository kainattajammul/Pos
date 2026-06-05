"use client";

import { flexRender, type Table as TanstackTable } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

export interface DataTableProps<TData> {
  table: TanstackTable<TData>;
  /** Total row count before client pagination (for "Showing x–y of z") */
  totalFilteredRows: number;
  /** Column ids that allow wrapping (e.g. multiline cells) */
  wrapColumnIds?: readonly string[];
  emptyMessage?: string;
  /**
   * Custom content to render inside the "actions" column header cell.
   * Used to inject the ColumnCustomizer gear icon.
   */
  actionsHeaderContent?: ReactNode;
}

export function DataTable<TData>({
  table,
  totalFilteredRows,
  wrapColumnIds = [],
  emptyMessage = "No results match your search.",
  actionsHeaderContent,
}: DataTableProps<TData>) {
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const pageCount = table.getPageCount();
  const from = totalFilteredRows === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, totalFilteredRows);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-pos bg-pos-table shadow-pos-sm">
        <Table className="min-w-[960px] text-sm">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-b border-pos bg-pos-table-header hover:bg-pos-table-header"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="h-11 px-3 text-xs font-semibold uppercase tracking-wide text-pos-muted first:pl-4 last:pr-4"
                  >
                    {header.id === "actions" && actionsHeaderContent
                      ? actionsHeaderContent
                      : header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="pos-row-hover border-b border-pos transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        "px-3 py-2.5 align-middle first:pl-4 last:pr-4",
                        !wrapColumnIds.includes(cell.column.id) && "whitespace-nowrap",
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className="h-28 text-center text-sm text-pos-muted"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-4 border-t border-pos pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3 text-sm text-pos-muted">
          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap text-pos-subtle">Show</span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => {
                table.setPageSize(Number(v));
                table.setPageIndex(0);
              }}
            >
              <SelectTrigger size="sm" className="h-8 w-[88px] border-pos bg-pos-surface">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="whitespace-nowrap text-pos-subtle">entries</span>
          </div>
          <p className="text-pos-subtle">
            Showing{" "}
            <span className="font-medium text-pos-secondary">
              {from}
            </span>{" "}
            to <span className="font-medium text-pos-secondary">{to}</span> of{" "}
            <span className="font-medium text-pos-secondary">{totalFilteredRows}</span>{" "}
            entries
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 border-pos bg-pos-surface px-2.5 text-pos-secondary shadow-pos-sm hover:bg-pos-hover"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </Button>
          {pageCount > 0
            ? Array.from({ length: pageCount }, (_, i) => (
                <Button
                  key={i}
                  type="button"
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-8 min-w-8 border-pos px-2.5 font-medium shadow-pos-sm",
                    pageIndex === i
                      ? "border-pos-strong bg-neutral-900 text-white hover:bg-neutral-800 hover:text-white dark:bg-neutral-900 dark:hover:bg-neutral-800"
                      : "bg-pos-surface text-pos-secondary hover:bg-pos-hover",
                  )}
                  onClick={() => table.setPageIndex(i)}
                >
                  {i + 1}
                </Button>
              ))
            : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 border-pos bg-pos-surface px-2.5 text-pos-secondary shadow-pos-sm hover:bg-pos-hover"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
