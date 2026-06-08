export type BillingInvoiceStatus = "OPEN" | "PAID" | "OVERDUE" | "DRAFT";

export interface BillingInvoice {
  id: string;
  invoiceNumber: string;
  description: string;
  amount: number;
  currency: string;
  issuedAt: string;
  dueAt: string;
  status: BillingInvoiceStatus;
}

export interface BillingSummary {
  packageName: string;
  companyName: string;
  billingCycle: string;
  freeDaysLeft: string;
  freeDaysExpired: boolean;
  storeLocationsUsed: number;
  storeLocationsLimit: number;
  usersUsed: number;
  usersLimit: number;
  openInvoices: BillingInvoice[];
}

export const MOCK_BILLING_SUMMARY: BillingSummary = {
  packageName: "Trial",
  companyName: "Fone doctors",
  billingCycle: "18, Jul 2025 - 20, Jul 2025",
  freeDaysLeft: "Expired",
  freeDaysExpired: true,
  storeLocationsUsed: 1,
  storeLocationsLimit: 1,
  usersUsed: 1,
  usersLimit: 3,
  openInvoices: [
    {
      id: "inv-001",
      invoiceNumber: "INV-2025-0042",
      description: "Trial plan — monthly subscription",
      amount: 49.0,
      currency: "GBP",
      issuedAt: "2025-07-18T09:00:00.000Z",
      dueAt: "2025-07-20T23:59:59.000Z",
      status: "OPEN",
    },
    {
      id: "inv-002",
      invoiceNumber: "INV-2025-0038",
      description: "Additional user seat (1)",
      amount: 12.0,
      currency: "GBP",
      issuedAt: "2025-06-18T09:00:00.000Z",
      dueAt: "2025-06-25T23:59:59.000Z",
      status: "OVERDUE",
    },
    {
      id: "inv-003",
      invoiceNumber: "INV-2025-0031",
      description: "SMS campaign add-on",
      amount: 8.5,
      currency: "GBP",
      issuedAt: "2025-05-10T09:00:00.000Z",
      dueAt: "2025-05-17T23:59:59.000Z",
      status: "OPEN",
    },
  ],
};

export function formatBillingMoney(amount: number, currency = "GBP"): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatBillingDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export const INVOICE_STATUS_STYLES: Record<BillingInvoiceStatus, string> = {
  OPEN: "bg-amber-100 text-amber-800",
  PAID: "bg-emerald-100 text-emerald-800",
  OVERDUE: "bg-red-100 text-red-800",
  DRAFT: "bg-[#F3F4F6] text-[#6B7280]",
};

export type BillingPaymentStatus = "Paid" | "Unpaid" | "Overdue" | "Pending";

/** Row shape for the Billing Invoices list page (screenshot table). */
export interface BillingInvoiceRow {
  id: string;
  date: string;
  amount: number;
  currency: string;
  cycle: string;
  productName: string;
  type: string;
  paymentStatus: BillingPaymentStatus;
}

export const MOCK_BILLING_INVOICE_ROWS: BillingInvoiceRow[] = [
  {
    id: "row-001",
    date: "18, Jul 2025",
    amount: 49.0,
    currency: "GBP",
    cycle: "18, Jul 2025 - 20, Jul 2025",
    productName: "Repair Management System",
    type: "Subscription",
    paymentStatus: "Unpaid",
  },
  {
    id: "row-002",
    date: "18, Jun 2025",
    amount: 12.0,
    currency: "GBP",
    cycle: "18, Jun 2025 - 20, Jun 2025",
    productName: "Additional User Seat",
    type: "Add-on",
    paymentStatus: "Overdue",
  },
  {
    id: "row-003",
    date: "10, May 2025",
    amount: 8.5,
    currency: "GBP",
    cycle: "10, May 2025 - 17, May 2025",
    productName: "SMS Campaign Module",
    type: "Add-on",
    paymentStatus: "Unpaid",
  },
  {
    id: "row-004",
    date: "18, Apr 2025",
    amount: 49.0,
    currency: "GBP",
    cycle: "18, Apr 2025 - 20, Apr 2025",
    productName: "Repair Management System",
    type: "Subscription",
    paymentStatus: "Paid",
  },
];

export const PAYMENT_STATUS_STYLES: Record<BillingPaymentStatus, string> = {
  Paid: "text-[#16A34A]",
  Unpaid: "text-[#DC2626]",
  Overdue: "text-[#DC2626] font-semibold",
  Pending: "text-[#D97706]",
};
