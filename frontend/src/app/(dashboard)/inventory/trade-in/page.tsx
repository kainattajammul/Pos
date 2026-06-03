import type { Metadata } from "next";
import { TradeinReportPage } from "@/components/inventory/trade-in-report/tradein-report-page";

export const metadata: Metadata = {
  title: "Tradein Report",
  description: "Trade-in inventory report with purchase, sales, tax, and profit summary",
};

export default function InventoryTradeInPage() {
  return <TradeinReportPage />;
}
