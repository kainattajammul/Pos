export type SalesSummaryDateTab =
  | "Today"
  | "Yesterday"
  | "This Month"
  | "Last Month"
  | "This Year"
  | "All";

export const SALES_SUMMARY_DATE_TABS: SalesSummaryDateTab[] = [
  "Today",
  "Yesterday",
  "This Month",
  "Last Month",
  "This Year",
  "All",
];

export interface SalesSummaryFilters {
  date: string;
  store: string;
  employee: string;
}

export const DEFAULT_SALES_SUMMARY_FILTERS: SalesSummaryFilters = {
  date: "",
  store: "",
  employee: "",
};

export interface SalesSummaryRow {
  storeName: string;
  employee: string;
  repairs: number;
  unlocking: number;
  products: number;
  tradeIn: number;
  miscellaneous: number;
  totalSales: number;
  refund: number;
  cogs: number;
  discounts: number;
  netProfit: number;
  netProfitMargin: number;
  avgSales: number;
  totalTax: number;
  paymentReceived: number;
  accountReceivables: number;
}

export interface SalesSummaryTotals {
  repairs: number;
  unlocking: number;
  products: number;
  tradeIn: number;
  miscellaneous: number;
  totalSales: number;
  refund: number;
  cogs: number;
  discounts: number;
  netProfit: number;
  netProfitMargin: number;
  avgSales: number;
  totalTax: number;
  paymentReceived: number;
  accountReceivables: number;
}

export const EMPTY_SALES_SUMMARY_TOTALS: SalesSummaryTotals = {
  repairs: 0,
  unlocking: 0,
  products: 0,
  tradeIn: 0,
  miscellaneous: 0,
  totalSales: 0,
  refund: 0,
  cogs: 0,
  discounts: 0,
  netProfit: 0,
  netProfitMargin: 0,
  avgSales: 0,
  totalTax: 0,
  paymentReceived: 0,
  accountReceivables: 0,
};

export const MOCK_SALES_SUMMARY_ROWS: SalesSummaryRow[] = [
  {
    storeName: "Fone doctors",
    employee: "Faisal Sheikh",
    repairs: 1250.0,
    unlocking: 320.0,
    products: 2840.5,
    tradeIn: 450.0,
    miscellaneous: 85.0,
    totalSales: 42,
    refund: 120.0,
    cogs: 1820.0,
    discounts: 95.5,
    netProfit: 2930.0,
    netProfitMargin: 58.2,
    avgSales: 116.9,
    totalTax: 982.5,
    paymentReceived: 4820.5,
    accountReceivables: 28.0,
  },
  {
    storeName: "Fone doctors - Branch 2",
    employee: "Faisal Sheikh",
    repairs: 890.0,
    unlocking: 150.0,
    products: 1620.0,
    tradeIn: 280.0,
    miscellaneous: 45.0,
    totalSales: 28,
    refund: 65.0,
    cogs: 1100.0,
    discounts: 42.0,
    netProfit: 1778.0,
    netProfitMargin: 52.4,
    avgSales: 109.2,
    totalTax: 598.0,
    paymentReceived: 2920.0,
    accountReceivables: 41.0,
  },
];

/** Screenshot-aligned reference date for demo date-tab ranges */
const REFERENCE_NOW = new Date(2025, 5, 24, 12, 0, 0);

export const DEFAULT_PERIOD = {
  start: new Date(2025, 5, 24),
  end: new Date(2025, 5, 24),
};

export function formatReportDate(date: Date): string {
  const day = date.getDate();
  const month = date.toLocaleString("en-GB", { month: "short" });
  const year = date.getFullYear();
  return `${day} ${month}, ${year}`;
}

export function formatDateRangeLabel(start: Date, end: Date): string {
  return `${formatReportDate(start)} to ${formatReportDate(end)}`;
}

export function getDateRangeForTab(tab: SalesSummaryDateTab): { start: Date; end: Date } {
  const now = REFERENCE_NOW;
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
      return { start: dayStart, end: dayEnd };
    case "Yesterday":
      return { start: yesterdayStart, end: yesterdayEnd };
    case "This Month":
      return { start: monthStart, end: dayEnd };
    case "Last Month":
      return { start: lastMonthStart, end: lastMonthEnd };
    case "This Year":
      return { start: yearStart, end: dayEnd };
    case "All":
      return { start: new Date(2020, 0, 1), end: dayEnd };
  }
}

export function filterSalesSummaryRows(
  rows: SalesSummaryRow[],
  filters: SalesSummaryFilters,
): SalesSummaryRow[] {
  return rows.filter((row) => {
    if (filters.store && filters.store !== "Select Store" && row.storeName !== filters.store) {
      return false;
    }
    if (filters.employee && row.employee !== filters.employee) return false;
    return true;
  });
}

export function computeSalesSummaryTotals(rows: SalesSummaryRow[]): SalesSummaryTotals {
  if (rows.length === 0) return EMPTY_SALES_SUMMARY_TOTALS;

  const totals = rows.reduce(
    (acc, row) => ({
      repairs: acc.repairs + row.repairs,
      unlocking: acc.unlocking + row.unlocking,
      products: acc.products + row.products,
      tradeIn: acc.tradeIn + row.tradeIn,
      miscellaneous: acc.miscellaneous + row.miscellaneous,
      totalSales: acc.totalSales + row.totalSales,
      refund: acc.refund + row.refund,
      cogs: acc.cogs + row.cogs,
      discounts: acc.discounts + row.discounts,
      netProfit: acc.netProfit + row.netProfit,
      avgSales: acc.avgSales + row.avgSales,
      totalTax: acc.totalTax + row.totalTax,
      paymentReceived: acc.paymentReceived + row.paymentReceived,
      accountReceivables: acc.accountReceivables + row.accountReceivables,
    }),
    {
      repairs: 0,
      unlocking: 0,
      products: 0,
      tradeIn: 0,
      miscellaneous: 0,
      totalSales: 0,
      refund: 0,
      cogs: 0,
      discounts: 0,
      netProfit: 0,
      avgSales: 0,
      totalTax: 0,
      paymentReceived: 0,
      accountReceivables: 0,
    },
  );

  const totalRevenue =
    totals.repairs +
    totals.unlocking +
    totals.products +
    totals.tradeIn +
    totals.miscellaneous;
  const netProfitMargin =
    totalRevenue > 0 ? (totals.netProfit / totalRevenue) * 100 : 0;

  return {
    ...totals,
    netProfitMargin,
    avgSales: totals.avgSales / rows.length,
  };
}
