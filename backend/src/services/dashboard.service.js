import { prisma } from "../config/database.js";
import { mockDashboardSummary } from "../data/mockDashboard.js";

/**
 * Dashboard summary — mixes live DB counts with mock analytics until sales/inventory APIs exist.
 */
export async function getDashboardSummary() {
  const [totalRoles, totalCommissionAgents] = await Promise.all([
    prisma.role.count(),
    prisma.salesCommissionAgent.count(),
  ]);

  return {
    salesTodayTotal: mockDashboardSummary.salesTodayTotal,
    stockInToday: mockDashboardSummary.stockInToday,
    activeRepairs: mockDashboardSummary.activeRepairs,
    lowStockProducts: mockDashboardSummary.lowStockProducts,
    lowStockThreshold: mockDashboardSummary.lowStockThreshold,
    totalRoles,
    totalCommissionAgents,
    commissionTodayTotal: mockDashboardSummary.commissionTodayTotal,
  };
}
