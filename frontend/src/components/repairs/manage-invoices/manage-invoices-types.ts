export type InvoiceStatus = "Paid" | "Unpaid" | "Partial" | "Refunded" | "Draft";

export type InvoiceDateTab = "Today" | "30 days" | "7 days" | "12 month";

export interface InvoiceRecord {
  id: string;
  reference: string;
  createdDate: string;
  customer: string;
  organization: string;
  invoiceStatus: InvoiceStatus;
  paid: number;
  due: number;
  total: number;
  employee?: string;
  paymentDate?: string;
}

export interface InvoiceFiltersState {
  customerName: string;
  invoiceId: string;
  invoiceStatus: string;
  employee: string;
  createdDate: string;
  paymentDate: string;
  selectCriteria: string;
  criteriaValue: string;
}

export interface InvoiceStats {
  totalSales: number;
  totalInvoices: number;
  totalTax: number;
  totalRefunds: number;
  accountReceivable: number;
  totalAccountReceivable: number;
}
