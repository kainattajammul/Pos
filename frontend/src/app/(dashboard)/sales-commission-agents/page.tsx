import type { Metadata } from "next";
import dynamic from "next/dynamic";

const SalesCommissionAgentsManagementView = dynamic(
  () =>
    import("@/components/sales-commission-agents/sales-commission-agents-management-view").then(
      (m) => m.SalesCommissionAgentsManagementView,
    ),
  {
    loading: () => (
      <div className="flex min-h-[320px] items-center justify-center text-sm text-muted-foreground">
        Loading agents…
      </div>
    ),
  },
);

export const metadata: Metadata = {
  title: "Sales Commission Agents",
  description: "View and manage sales commission agents",
};

export default function SalesCommissionAgentsPage() {
  return <SalesCommissionAgentsManagementView />;
}
