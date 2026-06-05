export type StoreDashboardDateTab =
  | "TODAY"
  | "YESTERDAY"
  | "LAST 7 DAYS"
  | "THIS MONTH"
  | "LAST MONTH"
  | "THIS YEAR"
  | "ALL";

export const STORE_DASHBOARD_DATE_TABS: StoreDashboardDateTab[] = [
  "TODAY",
  "YESTERDAY",
  "LAST 7 DAYS",
  "THIS MONTH",
  "LAST MONTH",
  "THIS YEAR",
  "ALL",
];

export interface StoreDashboardFilters {
  date: string;
  store: string;
  employee: string;
}

export const DEFAULT_STORE_DASHBOARD_FILTERS: StoreDashboardFilters = {
  date: "",
  store: "Fone doctors",
  employee: "",
};

export interface DailySaleRow {
  id: string;
  date: Date;
  sale: number;
  cogs: number;
  netProfit: number;
  margin: number;
  tax: number;
}

export interface RepairTicketRow {
  id: string;
  task: string;
  dueAt: Date;
  assignedTo: string;
  customer: string;
  status: string;
}

export interface StoreDashboardKpi {
  totalSales: number;
  tax: number;
  discounts: number;
  cogs: number;
  netProfit: number;
  totalRefunds: number;
  totalExpenses: number;
  accountReceivables: number;
  totalAccountReceivables: number;
}

export interface PaymentMethodSummary {
  method: string;
  amount: number;
  paymentsIn: number;
  paymentsOut: number;
}

const JUL_24_2025 = new Date(2025, 6, 24);
const JUL_25_2025 = new Date(2025, 6, 25);

function dailySale(
  id: string,
  date: Date,
  sale: number,
  cogs: number,
  tax = 0,
): DailySaleRow {
  const netProfit = sale - cogs;
  const margin = sale > 0 ? (netProfit / sale) * 100 : 0;
  return { id, date, sale, cogs, netProfit, margin, tax };
}

export const MOCK_DAILY_SALES: DailySaleRow[] = [
  dailySale("ds-1", new Date(2025, 5, 28), 45, 12, 4.5),
  dailySale("ds-2", new Date(2025, 6, 2), 78, 22, 7.8),
  dailySale("ds-3", new Date(2025, 6, 8), 120, 45, 12),
  dailySale("ds-4", new Date(2025, 6, 12), 55, 18, 5.5),
  dailySale("ds-5", new Date(2025, 6, 15), 0, 0, 0),
  dailySale("ds-6", new Date(2025, 6, 18), 92, 31, 9.2),
  dailySale("ds-7", new Date(2025, 6, 21), 38, 8, 3.8),
  dailySale("ds-8", JUL_24_2025, 21, 0, 0),
  dailySale("ds-9", new Date(2025, 6, 23), 156, 62, 15.6),
];

export const MOCK_REPAIR_TICKETS: RepairTicketRow[] = [
  {
    id: "T-5",
    task: "Apple iPhone 15 Pro Max Screen (Digitizer + LCD) Replacement",
    dueAt: new Date(2025, 6, 25, 13, 49),
    assignedTo: "Faisal Sheikh",
    customer: "Walkin Customer",
    status: "IN PROGRESS",
  },
  {
    id: "T-6",
    task: "Apple iPhone 15 Back Camera Replacement, Battery Replacement",
    dueAt: new Date(2025, 6, 25, 20, 20),
    assignedTo: "Faisal Sheikh",
    customer: "Walkin Customer",
    status: "WAITING FOR INSPECTION",
  },
];

export const MOCK_PAYMENT_METHODS: PaymentMethodSummary[] = [
  { method: "Cash", amount: 245.5, paymentsIn: 312, paymentsOut: 66.5 },
  { method: "Card", amount: 892, paymentsIn: 945, paymentsOut: 53 },
  { method: "Bank Transfer", amount: 410, paymentsIn: 410, paymentsOut: 0 },
  { method: "Store Credit", amount: 78.5, paymentsIn: 120, paymentsOut: 41.5 },
];

export interface SalesByItemTypeRow {
  type: string;
  sales: number;
}

export const MOCK_SALES_BY_ITEM_TYPE: SalesByItemTypeRow[] = [
  { type: "Repairs", sales: 420 },
  { type: "Accessories", sales: 180 },
  { type: "Trade In", sales: 95 },
  { type: "Devices", sales: 310 },
  { type: "Parts", sales: 65 },
  { type: "Services", sales: 142 },
];

export const DEFAULT_PERIOD = {
  start: new Date(2025, 5, 25),
  end: JUL_25_2025,
};

export function formatDashboardDate(date: Date): string {
  const day = date.getDate();
  const month = date.toLocaleString("en-GB", { month: "short" });
  const year = date.getFullYear();
  return `${day} ${month}, ${year}`;
}

export function formatDashboardDateTime(date: Date): string {
  const datePart = formatDashboardDate(date);
  const time = date.toLocaleString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${datePart} (${time})`;
}

export function formatDateRangeLabel(start: Date, end: Date): string {
  return `${formatDashboardDate(start)} to ${formatDashboardDate(end)}`;
}

export function formatMoney(value: number): string {
  return `£${value.toFixed(2)}`;
}

export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

/** Screenshot-aligned reference date for demo date-tab ranges */
const REFERENCE_NOW = new Date(2025, 6, 25, 12, 0, 0);

export function getDateRangeForTab(tab: StoreDashboardDateTab): { start: Date; end: Date } {
  const now = REFERENCE_NOW;
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayEnd = new Date(dayStart);
  dayEnd.setHours(23, 59, 59, 999);

  const yesterdayStart = new Date(dayStart);
  yesterdayStart.setDate(dayStart.getDate() - 1);
  const yesterdayEnd = new Date(yesterdayStart);
  yesterdayEnd.setHours(23, 59, 59, 999);

  const last7Start = new Date(dayStart);
  last7Start.setDate(dayStart.getDate() - 6);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  const yearStart = new Date(now.getFullYear(), 0, 1);

  switch (tab) {
    case "TODAY":
      return { start: dayStart, end: dayEnd };
    case "YESTERDAY":
      return { start: yesterdayStart, end: yesterdayEnd };
    case "LAST 7 DAYS":
      return { start: last7Start, end: dayEnd };
    case "THIS MONTH":
      return { start: monthStart, end: dayEnd };
    case "LAST MONTH":
      return { start: lastMonthStart, end: lastMonthEnd };
    case "THIS YEAR":
      return { start: yearStart, end: dayEnd };
    case "ALL":
      return { start: new Date(2020, 0, 1), end: dayEnd };
  }
}

function isWithinRange(date: Date, start: Date, end: Date): boolean {
  const inclusiveEnd = new Date(end);
  inclusiveEnd.setHours(23, 59, 59, 999);
  const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return normalized >= start && normalized <= inclusiveEnd;
}

export function filterDailySales(
  rows: DailySaleRow[],
  filters: StoreDashboardFilters,
  period: { start: Date; end: Date },
): DailySaleRow[] {
  return rows.filter((row) => {
    if (!isWithinRange(row.date, period.start, period.end)) return false;

    if (filters.date) {
      const filterDate = new Date(filters.date);
      if (
        row.date.getFullYear() !== filterDate.getFullYear() ||
        row.date.getMonth() !== filterDate.getMonth() ||
        row.date.getDate() !== filterDate.getDate()
      ) {
        return false;
      }
    }

    return true;
  });
}

export function filterRepairTickets(
  rows: RepairTicketRow[],
  filters: StoreDashboardFilters,
): RepairTicketRow[] {
  return rows.filter((row) => {
    if (filters.employee && row.assignedTo !== filters.employee) return false;
    return true;
  });
}

export function computeKpiFromSales(
  sales: DailySaleRow[],
  staticReceivables = { kpi: 28, total: 69 },
): StoreDashboardKpi {
  const totals = sales.reduce(
    (acc, row) => ({
      totalSales: acc.totalSales + row.sale,
      tax: acc.tax + row.tax,
      cogs: acc.cogs + row.cogs,
      netProfit: acc.netProfit + row.netProfit,
    }),
    { totalSales: 0, tax: 0, cogs: 0, netProfit: 0 },
  );

  return {
    totalSales: totals.totalSales,
    tax: totals.tax,
    discounts: 0,
    cogs: totals.cogs,
    netProfit: totals.netProfit,
    totalRefunds: 0,
    totalExpenses: 0,
    accountReceivables: staticReceivables.kpi,
    totalAccountReceivables: staticReceivables.total,
  };
}

export function exportDailySalesCsv(rows: DailySaleRow[], filename: string) {
  const headers = ["Date", "Sale", "COGS", "Net Profit", "Margin", "Tax"];
  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      [
        formatDashboardDate(row.date),
        row.sale.toFixed(2),
        row.cogs.toFixed(2),
        row.netProfit.toFixed(2),
        `${row.margin.toFixed(2)}%`,
        row.tax.toFixed(2),
      ].join(","),
    ),
  ];

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
