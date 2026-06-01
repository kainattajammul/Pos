export interface DashboardSummary {
  salesTodayTotal: string;
  stockInToday: number;
  activeRepairs: number;
  lowStockProducts: number;
  lowStockThreshold: number;
  totalRoles: number;
  totalCommissionAgents: number;
  commissionTodayTotal: string;
}

export interface RevenuePoint {
  day: string;
  total: string;
}

export interface MonthlySalesPoint {
  month: number;
  total: string;
}

export interface RepairReport {
  completed: number;
  pending: number;
  inProgress: number;
  cancelled: number;
  averageRepairHours: number;
}

export interface ActivityItem {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface StatCardData {
  title: string;
  value: number;
  change: number;
  trend: "up" | "down";
  sparkline: number[];
  accent: "red" | "yellow" | "green" | "blue";
}

export interface ProductTableRow {
  id: string;
  serialNo: number;
  name: string;
  imageUrl?: string;
  revenueDate: string;
  sell: number;
  stock: number;
  profit: number;
  totalSales: number;
  status: "in_stock" | "low_stock" | "out_of_stock";
}

export interface StockHealthSegment {
  label: string;
  value: number;
  color: string;
}

export interface ChartLegendItem {
  label: string;
  value: number;
  color: string;
}
