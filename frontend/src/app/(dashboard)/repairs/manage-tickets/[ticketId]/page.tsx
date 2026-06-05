import type { Metadata } from "next";
import { TicketViewPage } from "@/components/repairs/manage-tickets/ticket-view-page";

export const metadata: Metadata = {
  title: "Ticket View | Repair Management System",
  description: "View repair ticket details",
};

interface TicketViewRoutePageProps {
  params: Promise<{ ticketId: string }>;
}

export default async function TicketViewRoutePage({ params }: TicketViewRoutePageProps) {
  const { ticketId } = await params;
  return <TicketViewPage ticketId={ticketId} />;
}
