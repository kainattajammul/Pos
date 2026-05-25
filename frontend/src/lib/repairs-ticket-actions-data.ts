export type TicketActionId =
  | "print-label"
  | "print-service-receipt"
  | "print-thermal-receipt"
  | "view-ticket"
  | "email-ticket"
  | "new-sale";

export interface TicketActionItem {
  id: TicketActionId;
  label: string;
  variant: "default" | "primary";
}

export const TICKET_ACTION_ITEMS: TicketActionItem[] = [
  { id: "print-label", label: "Print Label", variant: "default" },
  { id: "print-service-receipt", label: "Print Service Receipt", variant: "default" },
  { id: "print-thermal-receipt", label: "Print Thermal Receipt", variant: "default" },
  { id: "view-ticket", label: "View Ticket", variant: "default" },
  { id: "email-ticket", label: "Email Ticket", variant: "default" },
  { id: "new-sale", label: "New Sale", variant: "primary" },
];
