import { apiClient } from "@/lib/axios";
import type { ApiSuccessResponse } from "@/types/api";
import type {
  ActivityItem,
  DashboardSummary,
  MonthlySalesPoint,
  RepairReport,
  RevenuePoint,
} from "@/types/dashboard";

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const { data } = await apiClient.get<ApiSuccessResponse<DashboardSummary>>(
    "/dashboard/summary",
  );
  return data.data;
}

export async function fetchRevenueAnalytics(days = 30): Promise<RevenuePoint[]> {
  const { data } = await apiClient.get<ApiSuccessResponse<RevenuePoint[]>>(
    "/dashboard/revenue",
    { params: { days } },
  );
  return data.data;
}

export async function fetchMonthlySales(year: number): Promise<MonthlySalesPoint[]> {
  const { data } = await apiClient.get<ApiSuccessResponse<MonthlySalesPoint[]>>(
    "/dashboard/monthly-sales",
    { params: { year } },
  );
  return data.data;
}

export async function fetchRepairReports(): Promise<RepairReport> {
  const { data } = await apiClient.get<ApiSuccessResponse<RepairReport>>(
    "/dashboard/repair-reports",
  );
  return data.data;
}

export async function fetchRecentActivities(limit = 10): Promise<ActivityItem[]> {
  const { data } = await apiClient.get<ApiSuccessResponse<ActivityItem[]>>(
    "/dashboard/recent-activities",
    { params: { limit } },
  );
  return data.data;
}
