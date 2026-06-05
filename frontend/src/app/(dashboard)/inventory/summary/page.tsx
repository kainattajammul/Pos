import type { Metadata } from "next";
import dynamic from "next/dynamic";

const InventorySummaryReportPage = dynamic(
  () =>
    import("@/components/inventory/inventory-summary/inventory-summary-report-page").then(
      (m) => m.InventorySummaryReportPage,
    ),
  {
    loading: () => (
      <div className="flex min-h-[320px] flex-1 items-center justify-center bg-[#F8FAFC] text-sm text-[#6B7280]">
        Loading inventory summary…
      </div>
    ),
  },
);

export const metadata: Metadata = {
  title: "Inventory Summary Report",
  description: "Inventory summary report with stock value, on-hand totals, and export",
};

export default function InventorySummaryRoutePage() {
  return <InventorySummaryReportPage />;
}
