import type { Metadata } from "next";
import { BillingInvoicesPage } from "@/components/settings/billing/billing-invoices-page";

export const metadata: Metadata = {
  title: "Billing Invoices | Settings",
  description: "View billing invoices, payment status, and subscription history",
};

export default function BillingInvoicesRoutePage() {
  return <BillingInvoicesPage />;
}
