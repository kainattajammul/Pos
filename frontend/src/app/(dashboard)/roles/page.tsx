import type { Metadata } from "next";
import { RolesManagementView } from "@/components/roles/roles-management-view";

export const metadata: Metadata = {
  title: "Roles | User Management",
  description: "View and manage roles by shop",
};

export default function RolesPage() {
  return <RolesManagementView />;
}
