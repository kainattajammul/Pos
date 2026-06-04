export type PurchaseOrderStatus =
  | "Draft"
  | "Pending"
  | "Ordered"
  | "Received"
  | "Cancelled";

export type PurchasePaymentStatus = "Unpaid" | "Partial" | "Paid" | "Overdue";

export type PurchaseOrderDateTab =
  | "Today"
  | "Yesterday"
  | "Last 7 Days"
  | "This Month"
  | "Last Month"
  | "This Year"
  | "All";

export const PURCHASE_ORDER_DATE_TABS: PurchaseOrderDateTab[] = [
  "Today",
  "Yesterday",
  "Last 7 Days",
  "This Month",
  "Last Month",
  "This Year",
  "All",
];

export interface PurchaseOrderRecord {
  id: string;
  orderId: string;
  date: string;
  product: string;
  createdBy: string;
  specialOrder: string;
  paymentStatus: PurchasePaymentStatus;
  supplier: string;
  trackingId: string;
  totalValue: number;
  amountPayable: number;
  status: PurchaseOrderStatus;
}

export interface PurchaseOrderFiltersState {
  purchaseOrderId: string;
  purchaseOrderStatus: string;
  supplier: string;
  paymentStatus: string;
  dateFrom: string;
  dateTo: string;
  manufacturer: string;
  type: string;
  product: string;
}

export const DEFAULT_PURCHASE_ORDER_FILTERS: PurchaseOrderFiltersState = {
  purchaseOrderId: "",
  purchaseOrderStatus: "",
  supplier: "",
  paymentStatus: "",
  dateFrom: "2025-07-25",
  dateTo: "2025-07-25",
  manufacturer: "",
  type: "",
  product: "",
};

export const MOCK_PURCHASE_ORDERS: PurchaseOrderRecord[] = [];

export function formatPurchaseOrderDateRange(from: string, to: string): string {
  const fmt = (iso: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const month = d.toLocaleString("en-US", { month: "short" });
    const day = String(d.getDate()).padStart(2, "0");
    return `${month}-${day}-${d.getFullYear()}`;
  };
  return `${fmt(from)} To ${fmt(to)}`;
}

export function matchesPurchaseOrderDateTab(
  date: Date,
  tab: PurchaseOrderDateTab,
): boolean {
  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayEnd = new Date(dayStart);
  dayEnd.setHours(23, 59, 59, 999);

  const yesterdayStart = new Date(dayStart);
  yesterdayStart.setDate(dayStart.getDate() - 1);
  const yesterdayEnd = new Date(yesterdayStart);
  yesterdayEnd.setHours(23, 59, 59, 999);

  const sevenDaysAgo = new Date(dayStart);
  sevenDaysAgo.setDate(dayStart.getDate() - 7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  const yearStart = new Date(now.getFullYear(), 0, 1);

  switch (tab) {
    case "Today":
      return date >= dayStart && date <= dayEnd;
    case "Yesterday":
      return date >= yesterdayStart && date <= yesterdayEnd;
    case "Last 7 Days":
      return date >= sevenDaysAgo && date <= dayEnd;
    case "This Month":
      return date >= monthStart && date <= dayEnd;
    case "Last Month":
      return date >= lastMonthStart && date <= lastMonthEnd;
    case "This Year":
      return date >= yearStart && date <= dayEnd;
    case "All":
      return true;
  }
}

export function matchesPurchaseOrderFilters(
  row: PurchaseOrderRecord,
  filters: PurchaseOrderFiltersState,
): boolean {
  if (
    filters.purchaseOrderId &&
    !row.orderId.toLowerCase().includes(filters.purchaseOrderId.toLowerCase())
  ) {
    return false;
  }
  if (filters.purchaseOrderStatus && row.status !== filters.purchaseOrderStatus) {
    return false;
  }
  if (filters.supplier && row.supplier !== filters.supplier) {
    return false;
  }
  if (filters.paymentStatus && row.paymentStatus !== filters.paymentStatus) {
    return false;
  }
  if (
    filters.manufacturer &&
    !row.product.toLowerCase().includes(filters.manufacturer.toLowerCase())
  ) {
    return false;
  }
  if (filters.type && !row.product.toLowerCase().includes(filters.type.toLowerCase())) {
    return false;
  }
  if (
    filters.product &&
    !row.product.toLowerCase().includes(filters.product.toLowerCase())
  ) {
    return false;
  }
  if (filters.dateFrom) {
    const from = new Date(filters.dateFrom);
    const rowDate = new Date(row.date);
    if (!Number.isNaN(from.getTime()) && rowDate < from) return false;
  }
  if (filters.dateTo) {
    const to = new Date(filters.dateTo);
    to.setHours(23, 59, 59, 999);
    const rowDate = new Date(row.date);
    if (!Number.isNaN(to.getTime()) && rowDate > to) return false;
  }
  return true;
}

export function computePurchaseOrderSummary(rows: PurchaseOrderRecord[]) {
  return {
    totalValue: rows.reduce((sum, r) => sum + r.totalValue, 0),
    amountPayable: rows.reduce((sum, r) => sum + r.amountPayable, 0),
  };
}
