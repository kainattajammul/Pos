import type { Metadata } from "next";
import { BranchesListPage } from "@/components/branches/branches-list-page";

export const metadata: Metadata = {
  title: "Branch Management | Settings",
  description: "Manage store branches from system settings",
};

export default function SettingsBranchesPage() {
  return <BranchesListPage />;
}
