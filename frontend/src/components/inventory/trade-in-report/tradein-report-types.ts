import { formatCompactCurrency, formatCurrency } from "@/utils/format";

export interface TradeinRecord {
  itemId: string;
  transactionId: string;
  storeName: string;
  imeiSerial: string;
  additionalDetails: string;
  sku: string;
  conditionOnPurchase: string;
  purchasedDate: string;
  purchaseLocation: string;
  status: string;
  seller: string;
  invoiceId: string;
  invoiceDate: string;
  buyer: string;
  sellerCustomerGroup: string;
  conditionOnSale: string;
  purchaseAmount: number;
  saleAmount: number;
  taxCollected: number;
  profit: number;
}

export interface TradeinFiltersState {
  date: string;
  type: string;
  criteria: string;
}

export interface TradeinSummary {
  totalPurchase: number;
  totalSales: number;
  taxCollected: number;
  totalProfit: number;
}

export type TradeinDateTab =
  | "All"
  | "This Year"
  | "Last Month"
  | "This Month"
  | "Yesterday"
  | "Today";

export const TRADEIN_DATE_TABS: TradeinDateTab[] = [
  "All",
  "This Year",
  "Last Month",
  "This Month",
  "Yesterday",
  "Today",
];

export const DEFAULT_TRADEIN_FILTERS: TradeinFiltersState = {
  date: "",
  type: "",
  criteria: "",
};

/** Screenshot default summary values when no records match */
export const EMPTY_SUMMARY_DISPLAY: TradeinSummary = {
  totalPurchase: 8800,
  totalSales: 8800,
  taxCollected: 8800,
  totalProfit: 8800,
};

export const MOCK_TRADEIN_RECORDS: TradeinRecord[] = [];

export function formatTradeinDate(date: Date): string {
  const day = date.getDate();
  const month = date.toLocaleString("en-GB", { month: "short" });
  const year = date.getFullYear();
  return `${day} ${month}, ${year}`;
}

export function formatDateRangeLabel(start: Date, end: Date): string {
  return `${formatTradeinDate(start)} to ${formatTradeinDate(end)}`;
}

export function parsePurchasedDate(value: string): Date | null {
  if (!value.trim()) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

export function matchesTradeinDateTab(date: Date, tab: TradeinDateTab): boolean {
  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayEnd = new Date(dayStart);
  dayEnd.setHours(23, 59, 59, 999);

  const yesterdayStart = new Date(dayStart);
  yesterdayStart.setDate(dayStart.getDate() - 1);
  const yesterdayEnd = new Date(yesterdayStart);
  yesterdayEnd.setHours(23, 59, 59, 999);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  const yearStart = new Date(now.getFullYear(), 0, 1);

  switch (tab) {
    case "Today":
      return date >= dayStart && date <= dayEnd;
    case "Yesterday":
      return date >= yesterdayStart && date <= yesterdayEnd;
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

export function getDateRangeForTab(tab: TradeinDateTab): { start: Date; end: Date } {
  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayEnd = new Date(dayStart);
  dayEnd.setHours(23, 59, 59, 999);

  switch (tab) {
    case "Today":
      return { start: dayStart, end: dayEnd };
    case "Yesterday": {
      const start = new Date(dayStart);
      start.setDate(start.getDate() - 1);
      const end = new Date(start);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }
    case "This Month":
      return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: dayEnd };
    case "Last Month": {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return { start, end };
    }
    case "This Year":
      return { start: new Date(now.getFullYear(), 0, 1), end: dayEnd };
    case "All":
      return { start: new Date(2020, 0, 1), end: dayEnd };
  }
}

export function computeTradeinSummary(rows: TradeinRecord[]): TradeinSummary {
  return rows.reduce(
    (acc, row) => ({
      totalPurchase: acc.totalPurchase + row.purchaseAmount,
      totalSales: acc.totalSales + row.saleAmount,
      taxCollected: acc.taxCollected + row.taxCollected,
      totalProfit: acc.totalProfit + row.profit,
    }),
    { totalPurchase: 0, totalSales: 0, taxCollected: 0, totalProfit: 0 },
  );
}

export function formatCompactMoney(amount: number): string {
  return formatCompactCurrency(amount);
}

export function formatTableMoney(amount: number): string {
  return formatCurrency(amount);
}
