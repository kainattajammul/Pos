import type { Metadata } from "next";
import { ManageInvoicesPage } from "@/components/repairs/manage-invoices/manage-invoices-page";

export const metadata: Metadata = {
  title: "Manage Invoices | Repair Management System",
  description: "Manage invoices screen",
};

export default function ManageInvoicesRoutePage() {
  return <ManageInvoicesPage />;
}
