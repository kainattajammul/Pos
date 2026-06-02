import type { Metadata } from "next";
import { ManageEstimatesPage } from "@/components/repairs/manage-estimates/manage-estimates-page";

export const metadata: Metadata = {
  title: "Manage Estimates | Repair Management System",
  description: "Manage estimates page",
};

export default function ManageEstimatesRoutePage() {
  return <ManageEstimatesPage />;
}
