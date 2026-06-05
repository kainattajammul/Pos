"use client";

import { FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { InventorySummaryRow } from "@/components/inventory/inventory-summary/inventory-summary-report-types";
import { formatSummaryMoney } from "@/components/inventory/inventory-summary/inventory-summary-report-types";

interface InventorySummaryReportActionsProps {
  rows: InventorySummaryRow[];
}

function exportCsv(rows: InventorySummaryRow[]) {
  const headers = [
    "SKU",
    "Category",
    "Manufacturer",
    "Device",
    "Product Name",
    "On Hand",
    "Average Cost Price",
    "Total Value",
    "On PO",
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
        row.sku,
        row.category,
        row.manufacturer,
        row.device,
        row.productName,
        row.onHand,
        row.averageCostPrice,
        row.totalValue,
        row.onPo,
      ]
        .map(escape)
        .join(","),
    ),
  ];

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "inventory-summary-report.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}

export function InventorySummaryReportActions({
  rows,
}: InventorySummaryReportActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        className="h-8 gap-1.5 rounded-sm border-[#E5E7EB] bg-white px-3 text-xs font-medium text-[#374151] hover:bg-pos-page"
        onClick={() => toast.message("Excel export — coming soon")}
      >
        <FileSpreadsheet className="size-3.5 text-[#22C55E]" />
        Excel
      </Button>
      <Button
        type="button"
        variant="outline"
        className="h-8 gap-1.5 rounded-sm border-[#E5E7EB] bg-white px-3 text-xs font-medium text-[#374151] hover:bg-pos-page"
        onClick={() => {
          if (rows.length === 0) {
            toast.error("No data to export. Run the report first.");
            return;
          }
          exportCsv(rows);
          toast.success("CSV downloaded");
        }}
      >
        <FileSpreadsheet className="size-3.5 text-[#3B82F6]" />
        CSV
      </Button>
    </div>
  );
}

export function InventorySummaryMetrics({
  totalInventoryValue,
  totalItems,
}: {
  totalInventoryValue: number;
  totalItems: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-4 md:gap-6">
      <MetricPill
        label="Total Inventory Value"
        value={formatSummaryMoney(totalInventoryValue)}
      />
      <MetricPill label="Total Item" value={String(totalItems)} />
    </div>
  );
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex size-8 items-center justify-center rounded-sm bg-[#ECFDF5] text-[#22C55E]">
        <svg
          viewBox="0 0 16 16"
          className="size-4"
          fill="currentColor"
          aria-hidden
        >
          <rect x="1" y="9" width="3" height="6" rx="0.5" />
          <rect x="6" y="6" width="3" height="9" rx="0.5" />
          <rect x="11" y="3" width="3" height="12" rx="0.5" />
        </svg>
      </div>
      <div>
        <p className="text-[11px] font-medium text-[#6B7280]">{label}</p>
        <p className="text-sm font-bold text-[#22C55E]">{value}</p>
      </div>
    </div>
  );
}
