"use client";

import { ShoppingCart } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCartMoney } from "@/lib/repair-cart";
import type { RepairCartLineItem, RepairCartLineKind } from "@/lib/repair-cart";
import { cn } from "@/lib/utils";

const VISIBLE_CART_LINES = 5;
const CART_LINE_ROW_MIN_PX = 52;
const CART_LINES_VIEWPORT_MIN_PX = VISIBLE_CART_LINES * CART_LINE_ROW_MIN_PX;

const KIND_LABEL: Record<RepairCartLineKind, string> = {
  issue: "Issue",
  part: "Part",
  service: "Service",
  product: "Product",
};

function LineKindLabel({ kind }: { kind: RepairCartLineKind }) {
  return (
    <span className="shrink-0 text-[11px] font-medium text-pos-subtle">
      {KIND_LABEL[kind]}
    </span>
  );
}

interface RepairsCartLineItemsProps {
  displayRows: RepairCartLineItem[] | null;
  emptyRowCount: number;
}

export function RepairsCartLineItems({
  displayRows,
  emptyRowCount,
}: RepairsCartLineItemsProps) {
  const showTaxColumn =
    displayRows !== null && displayRows.some((line) => line.tax > 0);
  const colSpan = showTaxColumn ? 5 : 4;
  const hasLines = displayRows !== null && displayRows.length > 0;
  const subTotal =
    hasLines && displayRows
      ? displayRows.reduce((sum, line) => sum + line.total, 0)
      : 0;

  return (
    <div className="pos-table-shell mx-3 mb-4 mt-2 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl dark:bg-neutral-900">
      <ScrollArea
        className="min-h-0 flex-1"
        style={{ minHeight: CART_LINES_VIEWPORT_MIN_PX }}
      >
        <Table className="table-fixed border-separate border-spacing-0">
          <TableHeader className="sticky top-0 z-10 bg-pos-table-header">
            <TableRow className="border-b border-pos hover:bg-transparent">
              <TableHead className="h-8 w-10 border-b border-pos px-4 text-center text-xs font-medium text-pos-muted">
                Qty
              </TableHead>
              <TableHead className="h-8 border-b border-pos px-4 text-left text-xs font-medium text-pos-muted">
                Description
              </TableHead>
              <TableHead className="h-8 w-[72px] border-b border-pos px-3 text-right text-xs font-medium text-pos-muted">
                Price
              </TableHead>
              {showTaxColumn ? (
                <TableHead className="h-8 w-[56px] border-b border-pos px-3 text-right text-xs font-medium text-pos-muted">
                  Tax
                </TableHead>
              ) : null}
              <TableHead className="h-8 w-[76px] border-b border-pos px-4 text-right text-xs font-medium text-pos-muted">
                Total
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {displayRows === null ? (
              Array.from({ length: VISIBLE_CART_LINES }).map((_, i) => (
                <TableRow
                  key={i}
                  className="hover:bg-transparent"
                  style={{ minHeight: CART_LINE_ROW_MIN_PX }}
                >
                  <TableCell colSpan={colSpan} className="p-0">
                    <div
                      className={cn(
                        "flex min-h-[52px] items-center border-b border-pos px-4",
                        i === VISIBLE_CART_LINES - 1 && "border-b-0",
                      )}
                    >
                      {i === 0 ? (
                        <p className="text-xs leading-relaxed text-pos-subtle">
                          Confirm a repair ticket or add products from the
                          Products tab to see items here.
                        </p>
                      ) : (
                        <div className="h-2 w-full max-w-[200px] rounded-full bg-pos-muted" />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : displayRows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={colSpan} className="px-4 py-12">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="flex size-9 items-center justify-center rounded-full border border-pos bg-pos-muted text-pos-subtle">
                      <ShoppingCart className="size-4" strokeWidth={1.75} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-pos-secondary">
                        No items on this ticket
                      </p>
                      <p className="mx-auto max-w-[220px] text-xs leading-relaxed text-pos-muted">
                        Add issues or parts in the workflow, then confirm to
                        update the cart.
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              <>
                {displayRows.map((line) => (
                  <TableRow
                    key={line.id}
                    className="pos-row-hover group border-pos transition-colors"
                    style={{ minHeight: CART_LINE_ROW_MIN_PX }}
                  >
                    <TableCell className="w-10 border-b border-pos px-4 py-3 text-center align-middle">
                      <span className="text-xs font-medium tabular-nums text-pos-muted">
                        {line.qty}
                      </span>
                    </TableCell>
                    <TableCell className="border-b border-pos px-4 py-3 align-middle">
                      <div className="flex min-w-0 items-baseline justify-between gap-3">
                        <span
                          className="line-clamp-2 min-w-0 text-sm leading-snug text-pos"
                          title={line.name}
                        >
                          {line.name}
                        </span>
                        <LineKindLabel kind={line.kind} />
                      </div>
                    </TableCell>
                    <TableCell className="w-[72px] border-b border-pos px-3 py-3 text-right align-middle text-sm tabular-nums text-pos-muted">
                      {formatCartMoney(line.price)}
                    </TableCell>
                    {showTaxColumn ? (
                      <TableCell className="w-[56px] border-b border-pos px-3 py-3 text-right align-middle text-sm tabular-nums text-pos-muted">
                        {formatCartMoney(line.tax)}
                      </TableCell>
                    ) : null}
                    <TableCell className="w-[76px] border-b border-pos px-4 py-3 text-right align-middle text-sm font-medium tabular-nums text-pos">
                      {formatCartMoney(line.total)}
                    </TableCell>
                  </TableRow>
                ))}
                {Array.from({ length: emptyRowCount }).map((_, i) => (
                  <TableRow
                    key={`empty-${i}`}
                    className="hover:bg-transparent"
                    style={{ minHeight: CART_LINE_ROW_MIN_PX }}
                  >
                    <TableCell colSpan={colSpan} className="p-0">
                      <div
                        className={cn(
                          "min-h-[52px] border-b border-pos",
                          i === emptyRowCount - 1 && "border-b-0",
                        )}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </>
            )}
          </TableBody>

          {hasLines ? (
            <tfoot className="sticky bottom-0 z-10 bg-pos-table-header">
              <tr className="border-t border-pos">
                <td
                  colSpan={showTaxColumn ? 4 : 3}
                  className="px-4 py-2.5 text-xs font-medium text-pos-muted"
                >
                  Lines subtotal
                </td>
                <td className="px-4 py-2.5 text-right text-sm font-semibold tabular-nums text-pos">
                  {formatCartMoney(subTotal)}
                </td>
              </tr>
            </tfoot>
          ) : null}
        </Table>
      </ScrollArea>
    </div>
  );
}
