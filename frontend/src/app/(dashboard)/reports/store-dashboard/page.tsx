import type { Metadata } from "next";
import { StoreDashboardPage } from "@/components/reports/store-dashboard/store-dashboard-page";

export const metadata: Metadata = {
  title: "Store Dashboard | Fone doctors Overview",
  description: "Store overview dashboard with sales, payments, stock alerts, and repair tickets",
};

export default function StoreDashboardRoutePage() {
  return <StoreDashboardPage />;
}
