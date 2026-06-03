"use client";

import { TradeinDateTabs } from "@/components/inventory/trade-in-report/tradein-date-tabs";
import {
  formatTableMoney,
  type TradeinDateTab,
  type TradeinRecord,
} from "@/components/inventory/trade-in-report/tradein-report-types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TradeinReportTableProps {
  rows: TradeinRecord[];
  periodLabel: string;
  activeDateTab: TradeinDateTab;
  onDateTabChange: (tab: TradeinDateTab) => void;
  totals: {
    purchaseAmount: number;
    saleAmount: number;
    profit: number;
  };
}

const HEADERS = [
  { key: "itemId", label: "Item ID", className: "min-w-[72px]" },
  { key: "transactionId", label: "Transaction ID", className: "min-w-[96px]" },
  { key: "storeName", label: "Store Name", className: "min-w-[88px]" },
  { key: "imeiSerial", label: "IMEI/Serial", className: "min-w-[88px]" },
  { key: "additionalDetails", label: "Additional details", className: "min-w-[100px]" },
  { key: "sku", label: "SKU", className: "min-w-[64px]" },
  { key: "conditionOnPurchase", label: "Condition on Purchase", className: "min-w-[96px]" },
  { key: "purchasedDate", label: "Purchased Date", className: "min-w-[88px]" },
  { key: "purchaseLocation", label: "Purchase Location", className: "min-w-[96px]" },
  { key: "status", label: "Status", className: "min-w-[72px]" },
  { key: "seller", label: "Seller", className: "min-w-[72px]" },
  { key: "invoiceId", label: "Invoice ID", className: "min-w-[80px]" },
  { key: "invoiceDate", label: "Invoice Date", className: "min-w-[88px]" },
  { key: "buyer", label: "Buyer", className: "min-w-[72px]" },
  { key: "sellerCustomerGroup", label: "Seller Customer Group", className: "min-w-[100px]" },
  { key: "conditionOnSale", label: "Condition On Sale", className: "min-w-[88px]" },
  { key: "purchaseAmount", label: "P", className: "min-w-[64px] text-right" },
  { key: "saleAmount", label: "S", className: "min-w-[64px] text-right" },
  { key: "profit", label: "A", className: "min-w-[64px] text-right" },
] as const;

function cellValue(row: TradeinRecord, key: (typeof HEADERS)[number]["key"]): string {
  if (key === "purchaseAmount") return formatTableMoney(row.purchaseAmount);
  if (key === "saleAmount") return formatTableMoney(row.saleAmount);
  if (key === "profit") return formatTableMoney(row.profit);
  return row[key];
}

export function TradeinReportTable({
  rows,
  periodLabel,
  activeDateTab,
  onDateTabChange,
  totals,
}: TradeinReportTableProps) {
  const amountColumnCount = 3;
  const labelColumnCount = HEADERS.length - amountColumnCount;

  return (
    <section className="overflow-hidden rounded-sm border border-[#E5E7EB] bg-white">
      <div className="flex flex-col gap-3 border-b border-[#E5E7EB] px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-[#374151]">{periodLabel}</p>
        <TradeinDateTabs activeTab={activeDateTab} onTabChange={onDateTabChange} />
      </div>

      <div className="overflow-x-auto">
        <Table className="min-w-[1800px]">
          <TableHeader className="bg-white">
            <TableRow className="hover:bg-white">
              {HEADERS.map(({ key, label, className }) => (
                <TableHead
                  key={key}
                  className={`whitespace-normal px-2 py-2 text-[11px] font-semibold leading-tight text-[#374151] ${className}`}
                >
                  {label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow className="hover:bg-white">
                <TableCell
                  colSpan={labelColumnCount}
                  className="h-16 border-b border-[#E5E7EB] text-center text-sm text-[#6B7280]"
                >
                  No Record Found
                </TableCell>
                <TableCell className="border-b border-[#E5E7EB] text-right text-sm text-[#374151]">
                  {formatTableMoney(totals.purchaseAmount)}
                </TableCell>
                <TableCell className="border-b border-[#E5E7EB] text-right text-sm text-[#374151]">
                  {formatTableMoney(totals.saleAmount)}
                </TableCell>
                <TableCell className="border-b border-[#E5E7EB] text-right text-sm text-[#374151]">
                  {formatTableMoney(totals.profit)}
                </TableCell>
              </TableRow>
            ) : (
              <>
                {rows.map((row) => (
                  <TableRow key={row.itemId} className="hover:bg-[#FAFAFA]">
                    {HEADERS.map(({ key, className }) => (
                      <TableCell
                        key={key}
                        className={`whitespace-normal px-2 py-1.5 text-xs text-[#374151] ${className}`}
                      >
                        {cellValue(row, key)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                <TableRow className="bg-[#FAFAFA] hover:bg-[#FAFAFA]">
                  <TableCell
                    colSpan={labelColumnCount}
                    className="border-t border-[#E5E7EB] text-right text-xs font-semibold text-[#374151]"
                  >
                    Totals
                  </TableCell>
                  <TableCell className="border-t border-[#E5E7EB] text-right text-xs font-semibold text-[#374151]">
                    {formatTableMoney(totals.purchaseAmount)}
                  </TableCell>
                  <TableCell className="border-t border-[#E5E7EB] text-right text-xs font-semibold text-[#374151]">
                    {formatTableMoney(totals.saleAmount)}
                  </TableCell>
                  <TableCell className="border-t border-[#E5E7EB] text-right text-xs font-semibold text-[#374151]">
                    {formatTableMoney(totals.profit)}
                  </TableCell>
                </TableRow>
              </>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
