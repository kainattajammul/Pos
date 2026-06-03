import type {
  ActivityItem,
  ChartLegendItem,
  DashboardSummary,
  MonthlySalesPoint,
  ProductTableRow,
  RepairReport,
  RevenuePoint,
  StatCardData,
  StockHealthSegment,
} from "@/types/dashboard";

export const mockDashboardSummary: DashboardSummary = {
  salesTodayTotal: "2420",
  stockInToday: 1210,
  activeRepairs: 316,
  lowStockProducts: 18,
  lowStockThreshold: 5,
  totalRoles: 12,
  totalCommissionAgents: 5,
  commissionTodayTotal: "850",
};

/** Stat cards for the dashboard home page (values filled from API summary). */
export function buildDashboardStatCards(summary: DashboardSummary): StatCardData[] {
  const salesToday = Number(summary.salesTodayTotal) || 0;
  const totalRoles = summary.totalRoles ?? 0;

  return [
    {
      title: "Total Sales Today",
      value: salesToday,
      change: 40,
      trend: "up",
      sparkline: [12, 18, 14, 22, 28, 24, 32, 30, 38, 42],
      accent: "red",
    },
    {
      title: "Total Today Commission",
      value: Number(summary.commissionTodayTotal) || 0,
      change: 18,
      trend: "up",
      sparkline: [10, 14, 12, 18, 16, 22, 20, 26, 28, 32],
      accent: "green",
    },
    {
      title: "Stock In Today",
      value: summary.stockInToday,
      change: 10,
      trend: "down",
      sparkline: [30, 28, 26, 24, 22, 20, 18, 16, 14, 12],
      accent: "yellow",
    },
    {
      title: "Active Repairs",
      value: summary.activeRepairs,
      change: 20,
      trend: "up",
      sparkline: [8, 12, 10, 14, 18, 16, 22, 26, 24, 30],
      accent: "green",
    },
    {
      title: "Total Roles",
      value: totalRoles,
      change: 8,
      trend: "up",
      sparkline: [6, 8, 7, 10, 9, 11, 12, 11, 13, 14],
      accent: "blue",
    },
    {
      title: "Revenue Overview",
      value: 18450,
      change: 12,
      trend: "up",
      sparkline: [20, 22, 25, 24, 28, 30, 32, 35, 38, 40],
      accent: "blue",
    },
  ];
}

export const mockStatCards: StatCardData[] = [
  {
    title: "Total Sales Today",
    value: 2420,
    change: 40,
    trend: "up",
    sparkline: [12, 18, 14, 22, 28, 24, 32, 30, 38, 42],
    accent: "red",
  },
  {
    title: "Stock In Today",
    value: 1210,
    change: 10,
    trend: "down",
    sparkline: [30, 28, 26, 24, 22, 20, 18, 16, 14, 12],
    accent: "yellow",
  },
  {
    title: "Active Repairs",
    value: 316,
    change: 20,
    trend: "up",
    sparkline: [8, 12, 10, 14, 18, 16, 22, 26, 24, 30],
    accent: "green",
  },
  {
    title: "Revenue Overview",
    value: 18450,
    change: 12,
    trend: "up",
    sparkline: [20, 22, 25, 24, 28, 30, 32, 35, 38, 40],
    accent: "blue",
  },
];

export const mockInventoryHealth: StockHealthSegment[] = [
  { label: "81–100", value: 28, color: "#22c55e" },
  { label: "61–80", value: 22, color: "#84cc16" },
  { label: "41–60", value: 18, color: "#eab308" },
  { label: "21–40", value: 16, color: "#f97316" },
  { label: "0–20", value: 16, color: "#ef4444" },
];

export const mockSalesChannels: ChartLegendItem[] = [
  { label: "Total Sales", value: 4200, color: "#ef4444" },
  { label: "Online Orders", value: 1800, color: "#f59e0b" },
  { label: "In-Store Sales", value: 2400, color: "#eab308" },
  { label: "Top 5 Items", value: 960, color: "#fbbf24" },
];

export const mockRepairReport: RepairReport = {
  completed: 184,
  pending: 42,
  inProgress: 58,
  cancelled: 12,
  averageRepairHours: 4.2,
};

export const mockRepairLegend: ChartLegendItem[] = [
  { label: "Completed Repairs", value: 184, color: "#22c55e" },
  { label: "Pending Repairs", value: 42, color: "#86efac" },
  { label: "In-Progress Jobs", value: 58, color: "#ef4444" },
  { label: "Canceled Jobs", value: 12, color: "#a855f7" },
  { label: "Avg. Repair Time (hrs)", value: 4, color: "#ec4899" },
];

export const mockMonthlySales: MonthlySalesPoint[] = [
  { month: 1, total: "1200" },
  { month: 2, total: "980" },
  { month: 3, total: "1450" },
  { month: 4, total: "1320" },
  { month: 5, total: "1680" },
  { month: 6, total: "1540" },
  { month: 7, total: "1890" },
  { month: 8, total: "1760" },
  { month: 9, total: "2100" },
  { month: 10, total: "1980" },
  { month: 11, total: "2250" },
  { month: 12, total: "2420" },
];

export const mockRevenue: RevenuePoint[] = Array.from({ length: 14 }, (_, i) => ({
  day: new Date(Date.now() - (13 - i) * 86400000).toISOString(),
  total: String(800 + Math.round(Math.random() * 1200)),
}));

export const mockActivities: ActivityItem[] = [
  {
    id: "1",
    type: "ORDER",
    message: "New sale #1042 — iPhone 16 Pro Max screen repair",
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    id: "2",
    type: "STOCK",
    message: "Stock received: 24× tempered glass (Samsung S24)",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: "3",
    type: "REPAIR",
    message: "Repair #892 marked in progress — battery replacement",
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    id: "4",
    type: "PRODUCT",
    message: "Product updated: MacBook Air M2 logic board",
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
  {
    id: "5",
    type: "ORDER",
    message: "Online order #1038 fulfilled",
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
  },
];

export const mockProducts: ProductTableRow[] = Array.from({ length: 12 }, (_, i) => ({
  id: `prod-${i + 1}`,
  serialNo: i + 1,
  name: "iPhone 16 Pro Max",
  imageUrl: undefined,
  revenueDate: "28. 03. 2024",
  sell: 55 + i * 2,
  stock: 7985 + i * 100,
  profit: 15 + (i % 3),
  totalSales: 8000 + i * 150,
  status: i % 4 === 0 ? "low_stock" : i % 7 === 0 ? "out_of_stock" : "in_stock",
}));
