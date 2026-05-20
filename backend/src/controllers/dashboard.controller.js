import { ApiResponse } from "../utils/ApiResponse.js";
import {
  getMockRevenue,
  mockActivities,
  mockDashboardSummary,
  mockMonthlySales,
  mockRepairReport,
} from "../data/mockDashboard.js";

/**
 * Dashboard controller — MOCK DATA ONLY.
 * No database queries for analytics, sales, products, or inventory.
 */
export const DashboardController = {
  summary(_req, res) {
    return ApiResponse.success(res, {
      message: "Dashboard summary (mock)",
      data: mockDashboardSummary,
    });
  },

  revenue(_req, res) {
    return ApiResponse.success(res, {
      message: "Revenue analytics (mock)",
      data: getMockRevenue(),
    });
  },

  monthlySales(_req, res) {
    return ApiResponse.success(res, {
      message: "Monthly sales (mock)",
      data: mockMonthlySales,
    });
  },

  repairReports(_req, res) {
    return ApiResponse.success(res, {
      message: "Repair reports (mock)",
      data: mockRepairReport,
    });
  },

  recentActivities(req, res) {
    const limit = Math.min(Number(req.query.limit) || 10, mockActivities.length);
    return ApiResponse.success(res, {
      message: "Recent activities (mock)",
      data: mockActivities.slice(0, limit),
    });
  },
};
