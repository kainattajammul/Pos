import type { Metadata } from "next";
import { ManageLeadsPage } from "@/components/repairs/manage-leads/manage-leads-page";

export const metadata: Metadata = {
  title: "Manage Leads | Repair Management System",
  description: "Manage leads screen",
};

export default function ManageLeadsRoutePage() {
  return <ManageLeadsPage />;
}
