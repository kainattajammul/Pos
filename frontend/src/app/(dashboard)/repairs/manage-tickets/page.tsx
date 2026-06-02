import type { Metadata } from "next";
import { ManageTicketsPage } from "@/components/repairs/manage-tickets/manage-tickets-page";

export const metadata: Metadata = {
  title: "Manage Tickets | Repair Management System",
  description: "Manage repair tickets",
};

export default function ManageTicketsRoutePage() {
  return <ManageTicketsPage />;
}
