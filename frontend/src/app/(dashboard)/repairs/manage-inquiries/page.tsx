import type { Metadata } from "next";
import { ManageInquiriesPage } from "@/components/repairs/manage-inquiries/manage-inquiries-page";

export const metadata: Metadata = {
  title: "Manage Inquiries | Repair Management System",
  description: "Manage inquiries screen",
};

export default function ManageInquiriesRoutePage() {
  return <ManageInquiriesPage />;
}
