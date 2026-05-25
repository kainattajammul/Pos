import type { Metadata } from "next";
import { AddRolePageView } from "@/components/roles/add-role-page-view";

export const metadata: Metadata = {
  title: "Add Role | User Management",
  description: "Create a new role with permissions",
};

export default function AddRolePage() {
  return <AddRolePageView />;
}
