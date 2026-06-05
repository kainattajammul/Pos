import type { Metadata } from "next";
import dynamic from "next/dynamic";

const LowStockReportPage = dynamic(
  () =>
    import("@/components/inventory/low-stock/low-stock-report-page").then(
      (m) => m.LowStockReportPage,
    ),
  {
    loading: () => (
      <div className="flex min-h-[320px] flex-1 items-center justify-center bg-[#F8FAFC] text-sm text-[#6B7280]">
        Loading low stock report…
      </div>
    ),
  },
);

export const metadata: Metadata = {
  title: "Low Stock Report",
  description: "View low stock inventory items and add them to purchase orders",
};

export default function LowStockReportRoutePage() {
  return <LowStockReportPage />;
}
