import type { Metadata } from "next";
import { SalesCommissionAgentsManagementView } from "@/components/sales-commission-agents/sales-commission-agents-management-view";

export const metadata: Metadata = {
  title: "Sales Commission Agents",
  description: "View and manage sales commission agents",
};

export default function SalesCommissionAgentsPage() {
  return <SalesCommissionAgentsManagementView />;
}
