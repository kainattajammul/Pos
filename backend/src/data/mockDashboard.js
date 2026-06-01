/**
 * Mock dashboard data only — no real analytics, sales, or inventory.
 * Matches shapes expected by the Next.js frontend (dashboard.service.ts).
 */

export const mockDashboardSummary = {
  salesTodayTotal: "2420",
  stockInToday: 1210,
  activeRepairs: 316,
  lowStockProducts: 18,
  lowStockThreshold: 5,
  totalRoles: 12,
  totalCommissionAgents: 5,
  commissionTodayTotal: "850",
};

export const mockMonthlySales = [
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

export const mockRepairReport = {
  completed: 184,
  pending: 42,
  inProgress: 58,
  cancelled: 12,
  averageRepairHours: 4.2,
};

export const mockActivities = [
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

/** Static mock revenue series (14 days). */
export function getMockRevenue() {
  const base = 800;
  return Array.from({ length: 14 }, (_, i) => ({
    day: new Date(Date.now() - (13 - i) * 86400000).toISOString(),
    total: String(base + ((i * 137) % 1200)),
  }));
}
