"use client";

import { FileSpreadsheet, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TradeinRecord } from "@/components/inventory/trade-in-report/tradein-report-types";

interface TradeinReportActionsProps {
  rows: TradeinRecord[];
}

function exportCsv(rows: TradeinRecord[]) {
  const headers = [
    "Item ID",
    "Transaction ID",
    "Store Name",
    "IMEI/Serial",
    "Additional details",
    "SKU",
    "Condition on Purchase",
    "Purchased Date",
    "Purchase Location",
    "Status",
    "Seller",
    "Invoice ID",
    "Invoice Date",
    "Buyer",
    "Seller Customer Group",
    "Condition On Sale",
    "Purchase Amount",
    "Sale Amount",
    "Tax Collected",
    "Profit",
  ];

  const escape = (value: string | number) => {
    const str = String(value);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      [
        row.itemId,
        row.transactionId,
        row.storeName,
        row.imeiSerial,
        row.additionalDetails,
        row.sku,
        row.conditionOnPurchase,
        row.purchasedDate,
        row.purchaseLocation,
        row.status,
        row.seller,
        row.invoiceId,
        row.invoiceDate,
        row.buyer,
        row.sellerCustomerGroup,
        row.conditionOnSale,
        row.purchaseAmount,
        row.saleAmount,
        row.taxCollected,
        row.profit,
      ]
        .map(escape)
        .join(","),
    ),
  ];

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "tradein-report.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}

export function TradeinReportActions({ rows }: TradeinReportActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        className="h-8 gap-1.5 rounded-sm border-[#E5E7EB] bg-white px-3 text-xs font-medium text-[#374151] hover:bg-pos-page"
        onClick={() => exportCsv(rows)}
      >
        <FileSpreadsheet className="size-3.5 text-[#22C55E]" />
        CSV
      </Button>
      <Button
        type="button"
        variant="outline"
        className="h-8 gap-1.5 rounded-sm border-[#E5E7EB] bg-white px-3 text-xs font-medium text-[#374151] hover:bg-pos-page"
        onClick={() => console.log("export-excel", rows)}
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
