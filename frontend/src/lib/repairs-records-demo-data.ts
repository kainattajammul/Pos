import type { RepairTicketSnapshot } from "@/lib/repair-ticket-snapshot";
import { formatCurrency } from "@/utils/format";

export type RepairRecordStatus =
  | "Open"
  | "In Progress"
  | "Ready"
  | "Closed"
  | "Paid"
  | "Unpaid";

export interface RepairTicketRecord {
  id: string;
  ticketNumber: string;
  customerName: string;
  deviceTitle: string;
  serviceName: string;
  status: RepairRecordStatus;
  total: number;
  createdAt: Date;
}

export interface RepairInvoiceRecord {
  id: string;
  invoiceNumber: string;
  ticketNumber: string;
  customerName: string;
  deviceTitle: string;
  status: RepairRecordStatus;
  total: number;
  createdAt: Date;
}

const DEMO_TICKETS: RepairTicketRecord[] = [
  {
    id: "t-1024",
    ticketNumber: "T-1024",
    customerName: "Sarah Johnson",
    deviceTitle: "Apple iPhone 14 Pro",
    serviceName: "Screen Replacement",
    status: "In Progress",
    total: 189.99,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
  },
  {
    id: "t-1023",
    ticketNumber: "T-1023",
    customerName: "Mike Chen",
    deviceTitle: "Samsung Galaxy S23",
    serviceName: "Battery Replacement",
    status: "Ready",
    total: 79.5,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28),
  },
  {
    id: "t-1022",
    ticketNumber: "T-1022",
    customerName: "Walkin Customer",
    deviceTitle: "Apple iPad Air",
    serviceName: "Charging Port Repair",
    status: "Closed",
    total: 120,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 52),
  },
];

const DEMO_INVOICES: RepairInvoiceRecord[] = [
  {
    id: "inv-8842",
    invoiceNumber: "INV-8842",
    ticketNumber: "T-1021",
    customerName: "Emily Davis",
    deviceTitle: "Google Pixel 8",
    status: "Paid",
    total: 145,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
  },
  {
    id: "inv-8841",
    invoiceNumber: "INV-8841",
    ticketNumber: "T-1020",
    customerName: "James Wilson",
    deviceTitle: "Apple MacBook Pro",
    status: "Paid",
    total: 320,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30),
  },
  {
    id: "inv-8840",
    invoiceNumber: "INV-8840",
    ticketNumber: "T-1019",
    customerName: "Walkin Customer",
    deviceTitle: "Apple iPhone 13",
    status: "Unpaid",
    total: 95.5,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
  },
];

export function getRepairTicketsList(
  currentSnapshot?: RepairTicketSnapshot | null,
): RepairTicketRecord[] {
  const rows = [...DEMO_TICKETS];
  if (!currentSnapshot?.ticketId) return rows;

  const existingIndex = rows.findIndex(
    (row) => row.ticketNumber === currentSnapshot.ticketId,
  );
  const currentRow: RepairTicketRecord = {
    id: `current-${currentSnapshot.ticketId}`,
    ticketNumber: currentSnapshot.ticketId,
    customerName: currentSnapshot.customerName,
    deviceTitle: currentSnapshot.deviceTitle,
    serviceName: currentSnapshot.serviceName,
    status: "Open",
    total: Number.parseFloat(currentSnapshot.repairCharges) || 0,
    createdAt: currentSnapshot.createdAt,
  };

  if (existingIndex >= 0) {
    rows[existingIndex] = currentRow;
    return rows;
  }

  return [currentRow, ...rows];
}

export function getRepairInvoicesList(
  currentSnapshot?: RepairTicketSnapshot | null,
): RepairInvoiceRecord[] {
  const rows = [...DEMO_INVOICES];
  if (!currentSnapshot?.ticketId) return rows;

  const draft: RepairInvoiceRecord = {
    id: `draft-${currentSnapshot.ticketId}`,
    invoiceNumber: `INV-${currentSnapshot.ticketId.replace(/^T-/, "")}`,
    ticketNumber: currentSnapshot.ticketId,
    customerName: currentSnapshot.customerName,
    deviceTitle: currentSnapshot.deviceTitle,
    status: "Unpaid",
    total: Number.parseFloat(currentSnapshot.repairCharges) || 0,
    createdAt: currentSnapshot.createdAt,
  };

  return [draft, ...rows];
}

export function ticketRecordToSnapshot(
  record: RepairTicketRecord,
  base: RepairTicketSnapshot,
): RepairTicketSnapshot {
  return {
    ...base,
    ticketId: record.ticketNumber,
    customerName: record.customerName,
    deviceTitle: record.deviceTitle,
    serviceName: record.serviceName,
    repairCharges: record.total.toFixed(2),
    createdAt: record.createdAt,
  };
}

export function invoiceRecordToSnapshot(
  record: RepairInvoiceRecord,
  base: RepairTicketSnapshot,
): RepairTicketSnapshot {
  return {
    ...base,
    ticketId: record.ticketNumber,
    customerName: record.customerName,
    deviceTitle: record.deviceTitle,
    serviceName: `Invoice ${record.invoiceNumber}`,
    repairCharges: record.total.toFixed(2),
    createdAt: record.createdAt,
  };
}

export function formatRecordMoney(amount: number): string {
  return formatCurrency(amount);
}

export function formatRecordDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
