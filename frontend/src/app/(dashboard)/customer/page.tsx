import type { Metadata } from "next";
import { CustomersManagementView } from "@/components/customers/customers-management-view";

export const metadata: Metadata = {
  title: "Customers | Customer",
  description: "View and manage repair shop customers",
};

export default function CustomerPage() {
  return <CustomersManagementView />;
}
