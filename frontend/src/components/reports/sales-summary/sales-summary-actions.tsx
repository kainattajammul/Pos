"use client";

import { FileSpreadsheet, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  SalesSummaryRow,
  SalesSummaryTotals,
} from "@/components/reports/sales-summary/sales-summary-types";

interface SalesSummaryActionsProps {
  rows: SalesSummaryRow[];
  totals: SalesSummaryTotals;
}

function escapeCsv(value: string | number): string {
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function exportCsv(rows: SalesSummaryRow[], totals: SalesSummaryTotals) {
  const headers = [
    "Store Name",
    "Repairs",
    "Unlocking",
    "Products",
    "Trade-In",
    "Miscellaneous",
    "Total Sales",
    "Refund",
    "COGS",
    "Discounts",
    "Net Profit",
    "Net Profit Margin",
    "Avg Sales",
    "Total Tax",
    "Payment Received",
    "Account Receivables",
  ];

  const rowToLine = (row: SalesSummaryRow | SalesSummaryTotals, isTotal = false) =>
    [
      isTotal ? "Total" : (row as SalesSummaryRow).storeName,
      row.repairs.toFixed(2),
      row.unlocking.toFixed(2),
      row.products.toFixed(2),
      row.tradeIn.toFixed(2),
      row.miscellaneous.toFixed(2),
      row.totalSales,
      row.refund.toFixed(2),
      row.cogs.toFixed(2),
      row.discounts.toFixed(2),
      row.netProfit.toFixed(2),
      `${row.netProfitMargin.toFixed(2)}%`,
      row.avgSales.toFixed(2),
      row.totalTax.toFixed(2),
      row.paymentReceived.toFixed(2),
      row.accountReceivables.toFixed(2),
    ]
      .map(escapeCsv)
      .join(",");

  const lines = [
    headers.join(","),
    rowToLine(totals, true),
    ...rows.map((row) => rowToLine(row)),
  ];

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "sales-summary-report.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}

export function SalesSummaryActions({ rows, totals }: SalesSummaryActionsProps) {
  const handleExport = () => exportCsv(rows, totals);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        className="h-8 gap-1.5 rounded-sm border-[#E5E7EB] bg-white px-3 text-xs font-medium text-[#374151] hover:bg-pos-page"
        onClick={handleExport}
      >
        <FileSpreadsheet className="size-3.5 text-[#22C55E]" />
        Excel
      </Button>
      <Button
        type="button"
        variant="outline"
        className="h-8 gap-1.5 rounded-sm border-[#E5E7EB] bg-white px-3 text-xs font-medium text-[#374151] hover:bg-pos-page"
        onClick={handleExport}
      >
        <FileSpreadsheet className="size-3.5 text-[#22C55E]" />
        Excel
      </Button>
      <Button
        type="button"
        variant="outline"
        className="h-8 gap-1.5 rounded-sm border-[#E5E7EB] bg-white px-3 text-xs font-medium text-[#374151] hover:bg-pos-page"
        onClick={() => window.print()}
      >
        <Printer className="size-3.5 text-[#374151]" />
        Print
      </Button>
    </div>
  );
}
