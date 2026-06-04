import type { Metadata } from "next";
import dynamic from "next/dynamic";

const RolesManagementView = dynamic(
  () =>
    import("@/components/roles/roles-management-view").then(
      (m) => m.RolesManagementView,
    ),
  {
    loading: () => (
      <div className="flex min-h-[320px] items-center justify-center text-sm text-muted-foreground">
        Loading roles…
      </div>
    ),
  },
);

export const metadata: Metadata = {
  title: "Roles | User Management",
  description: "View and manage roles by shop",
};

export default function RolesPage() {
  return <RolesManagementView />;
}
