import type { Metadata } from "next";
import { BillingSettingsPage } from "@/components/settings/billing/billing-settings-page";

export const metadata: Metadata = {
  title: "Billing | Settings",
  description: "Manage subscription, billing details, and invoices",
};

export default function BillingSettingsRoutePage() {
  return <BillingSettingsPage />;
}
