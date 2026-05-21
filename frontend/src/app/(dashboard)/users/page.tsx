import type { Metadata } from "next";
import { UsersManagementView } from "@/components/users/users-management-view";

export const metadata: Metadata = {
  title: "Users | User Management",
  description: "View and manage system users",
};

export default function UsersPage() {
  return <UsersManagementView />;
}
