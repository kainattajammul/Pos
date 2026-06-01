import { ApiResponse } from "../utils/ApiResponse.js";
import { getDashboardSummary } from "../services/dashboard.service.js";
import {
  getMockRevenue,
  mockActivities,
  mockMonthlySales,
  mockRepairReport,
} from "../data/mockDashboard.js";

export const DashboardController = {
  async summary(_req, res) {
    const data = await getDashboardSummary();
    return ApiResponse.success(res, {
      message: "Dashboard summary fetched successfully",
      data,
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
