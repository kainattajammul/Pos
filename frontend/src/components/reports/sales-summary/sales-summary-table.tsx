"use client";

import { CircleHelp } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, formatPercent } from "@/utils/format";
import {
  SALES_SUMMARY_DATE_TABS,
  type SalesSummaryDateTab,
  type SalesSummaryRow,
  type SalesSummaryTotals,
} from "@/components/reports/sales-summary/sales-summary-types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SalesSummaryTableProps {
  rows: SalesSummaryRow[];
  totals: SalesSummaryTotals;
  periodLabel: string;
  activeDateTab: SalesSummaryDateTab;
  onDateTabChange: (tab: SalesSummaryDateTab) => void;
}

const COLUMNS = [
  { key: "storeName", label: "Store Name", info: false, align: "left" },
  { key: "repairs", label: "Repairs", info: false, align: "right" },
  { key: "unlocking", label: "Unlocking", info: false, align: "right" },
  { key: "products", label: "Products", info: false, align: "right" },
  { key: "tradeIn", label: "Trade-In", info: false, align: "right" },
  { key: "miscellaneous", label: "Miscellaneous", info: false, align: "right" },
  { key: "totalSales", label: "Total Sales", info: true, align: "right" },
  { key: "refund", label: "Refund", info: true, align: "right" },
  { key: "cogs", label: "COGS", info: true, align: "right" },
  { key: "discounts", label: "Discounts", info: true, align: "right" },
  { key: "netProfit", label: "Net Profit", info: true, align: "right" },
  { key: "netProfitMargin", label: "Net Profit Margin", info: false, align: "right" },
  { key: "avgSales", label: "Avg Sales", info: true, align: "right" },
  { key: "totalTax", label: "Total Tax", info: true, align: "right" },
  { key: "paymentReceived", label: "Payment Received", info: true, align: "right" },
  { key: "accountReceivables", label: "Account Receivables", info: true, align: "right" },
] as const;

type ColumnKey = (typeof COLUMNS)[number]["key"];

function formatCellValue(row: SalesSummaryRow | SalesSummaryTotals, key: ColumnKey): string {
  if (key === "storeName") return (row as SalesSummaryRow).storeName ?? "";
  if (key === "totalSales") return String(row.totalSales);
  if (key === "netProfitMargin") {
    return row.netProfitMargin > 0 ? formatPercent(row.netProfitMargin) : "%";
  }
  return formatCurrency(row[key]);
}

function TotalCellValue({ totals, columnKey }: { totals: SalesSummaryTotals; columnKey: ColumnKey }) {
  if (columnKey === "storeName") {
    return <span className="font-semibold text-[#374151]">Total</span>;
  }
  if (columnKey === "totalSales") {
    return <span className="font-semibold text-[#374151]">{totals.totalSales}</span>;
  }
  if (columnKey === "netProfitMargin") {
    const label =
      totals.netProfitMargin > 0 ? formatPercent(totals.netProfitMargin) : "%";
    return <span className="font-semibold text-[#374151]">{label}</span>;
  }
  return (
    <span className="font-semibold text-[#374151]">{formatCurrency(totals[columnKey])}</span>
  );
}

export function SalesSummaryTable({
  rows,
  totals,
  periodLabel,
  activeDateTab,
  onDateTabChange,
}: SalesSummaryTableProps) {
  return (
    <section className="overflow-hidden rounded-sm border border-[#E5E7EB] bg-white">
      <div className="flex flex-col gap-3 border-b border-[#E5E7EB] px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-[#374151]">{periodLabel}</p>
        <div className="inline-flex overflow-hidden rounded-sm border border-[#E5E7EB]">
          {SALES_SUMMARY_DATE_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => onDateTabChange(tab)}
              className={cn(
                "border-r border-[#E5E7EB] px-3 py-1.5 text-xs font-medium text-[#374151] last:border-r-0 hover:bg-pos-page",
                activeDateTab === tab && "bg-(--repair-primary) text-white hover:bg-(--repair-primary)",
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table className="min-w-[1400px]">
          <TableHeader className="bg-white">
            <TableRow className="hover:bg-white">
              {COLUMNS.map(({ key, label, info, align }) => (
                <TableHead
                  key={key}
                  className={cn(
                    "whitespace-nowrap px-2 py-2 text-[11px] font-semibold text-[#374151]",
                    align === "right" && "text-right",
                  )}
                >
                  <span className="inline-flex items-center gap-1">
                    {label}
                    {info && (
                      <CircleHelp className="size-3 text-[#D1D5DB]" aria-hidden />
                    )}
                  </span>
                </TableHead>
              ))}
            </TableRow>
            <TableRow className="bg-[#FAFAFA] hover:bg-[#FAFAFA]">
              {COLUMNS.map(({ key, align }) => (
                <TableCell
                  key={key}
                  className={cn(
                    "border-b border-[#E5E7EB] px-2 py-1.5 text-xs",
                    align === "right" && "text-right",
                  )}
                >
                  <TotalCellValue totals={totals} columnKey={key} />
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.storeName} className="hover:bg-[#FAFAFA]">
                {COLUMNS.map(({ key, align }) => (
                  <TableCell
                    key={key}
                    className={cn(
                      "whitespace-nowrap px-2 py-1.5 text-xs text-[#374151]",
                      align === "right" && "text-right",
                      key === "storeName" && "font-medium",
                    )}
                  >
                    {key === "storeName"
                      ? row.storeName
                      : formatCellValue(row, key)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
