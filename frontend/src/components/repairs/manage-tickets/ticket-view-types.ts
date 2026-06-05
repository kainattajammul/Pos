import type { TicketRow } from "@/components/repairs/manage-tickets/ticket-table";
import type { TicketHistoryEntry } from "@/components/repairs/manage-tickets/ticket-history-modal";

export interface TicketBillingItem {
  label: string;
  price: number;
}

export interface TicketBillingSummary {
  items: TicketBillingItem[];
  total: number;
  paid: number;
  due: number;
  estimatedProfit: number;
}

export interface TicketEstimateInfo {
  id: string;
  date: string;
  status: string;
}

export interface TicketSummaryInfo {
  createdAt: string;
  lastModified: string;
  location: string;
  generatedBy: string;
  source: string;
}

export interface TicketDetail {
  row: TicketRow;
  status: string;
  price: number;
  categoryPath: string;
  serialImei: string;
  warranty: string;
  pinPattern: string;
  network: string;
  physicalLocation: string;
  assetIssues: string[];
  attachedParts: string[];
  inventoryItems: string[];
  diagnosticNotes: string;
  additionalNote: string;
  additionalDetails: string;
  suppliedItems: string[];
  billing: TicketBillingSummary;
  estimate?: TicketEstimateInfo;
  ticketSummary: TicketSummaryInfo;
  conditions: string[];
  systemMessages: TicketHistoryEntry[];
}
