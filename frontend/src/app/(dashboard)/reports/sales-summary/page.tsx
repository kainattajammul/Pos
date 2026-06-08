import type { Metadata } from "next";
import { SalesSummaryPage } from "@/components/reports/sales-summary/sales-summary-page";

export const metadata: Metadata = {
  title: "Sales Summary Report | Fone doctors",
  description: "Sales summary report with store-level breakdown of repairs, products, trade-in, and profitability",
};

export default function SalesSummaryRoutePage() {
  return <SalesSummaryPage />;
}
