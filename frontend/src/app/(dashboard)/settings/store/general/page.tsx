import type { Metadata } from "next";
import { GeneralSettingsPage } from "@/components/settings/store-general/general-settings-page";

export const metadata: Metadata = {
  title: "General Settings | Store Settings",
  description: "Manage store business information, logo, and contact details",
};

export default function StoreGeneralSettingsRoutePage() {
  return <GeneralSettingsPage />;
}
