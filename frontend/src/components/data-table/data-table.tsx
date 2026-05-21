"use client";

import { flexRender, type Table as TanstackTable } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  /** Total row count before client pagination (for “Showing x–y of z”) */
  totalFilteredRows: number;
  /** Column ids that allow wrapping (e.g. multiline cells) */
  wrapColumnIds?: readonly string[];
  emptyMessage?: string;
}

export function DataTable<TData>({
  table,
  totalFilteredRows,
  wrapColumnIds = [],
  emptyMessage = "No results match your search.",
}: DataTableProps<TData>) {
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const pageCount = table.getPageCount();
  const from = totalFilteredRows === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, totalFilteredRows);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-neutral-200/90 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06),0_8px_24px_rgba(15,23,42,0.04)]">
        <Table className="min-w-[960px] text-sm">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-b border-neutral-200/90 bg-neutral-50/90 hover:bg-neutral-50/90"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="h-11 px-3 text-xs font-semibold uppercase tracking-wide text-neutral-600 first:pl-4 last:pr-4"
                  >
                    {header.isPlaceholder
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
                  className="border-b border-neutral-100 transition-colors hover:bg-neutral-50/80"
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
                  className="h-28 text-center text-sm text-neutral-500"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-4 border-t border-neutral-200/80 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-600">
          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap text-neutral-500">Show</span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => {
                table.setPageSize(Number(v));
                table.setPageIndex(0);
              }}
            >
              <SelectTrigger size="sm" className="h-8 w-[88px] border-neutral-200 bg-white">
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
            <span className="whitespace-nowrap text-neutral-500">entries</span>
          </div>
          <p className="text-neutral-500">
            Showing{" "}
            <span className="font-medium text-neutral-800">
              {from}
            </span>{" "}
            to <span className="font-medium text-neutral-800">{to}</span> of{" "}
            <span className="font-medium text-neutral-800">{totalFilteredRows}</span>{" "}
            entries
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 border-neutral-200 bg-white px-2.5 text-neutral-700 shadow-sm hover:bg-neutral-50"
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
                    "h-8 min-w-8 border-neutral-200 px-2.5 font-medium shadow-sm",
                    pageIndex === i
                      ? "border-neutral-300 bg-neutral-900 text-white hover:bg-neutral-800 hover:text-white"
                      : "bg-white text-neutral-700 hover:bg-neutral-50",
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
            className="h-8 border-neutral-200 bg-white px-2.5 text-neutral-700 shadow-sm hover:bg-neutral-50"
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
