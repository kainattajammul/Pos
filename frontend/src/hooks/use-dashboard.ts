"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import {
  mockActivities,
  mockDashboardSummary,
  mockMonthlySales,
  mockRepairReport,
  mockRevenue,
} from "@/lib/mock-data";
import {
  fetchDashboardSummary,
  fetchMonthlySales,
  fetchRecentActivities,
  fetchRepairReports,
  fetchRevenueAnalytics,
} from "@/services/dashboard.service";

const useMockFallback = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

async function withMockFallback<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    if (useMockFallback) return fallback;
    throw new Error("Failed to load dashboard data");
  }
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: queryKeys.dashboard.summary,
    queryFn: () =>
      withMockFallback(fetchDashboardSummary, mockDashboardSummary),
  });
}

export function useRevenueAnalytics(days = 30) {
  return useQuery({
    queryKey: queryKeys.dashboard.revenue(days),
    queryFn: () => withMockFallback(() => fetchRevenueAnalytics(days), mockRevenue),
  });
}

export function useMonthlySales(year = new Date().getFullYear()) {
  return useQuery({
    queryKey: queryKeys.dashboard.monthlySales(year),
    queryFn: () =>
      withMockFallback(() => fetchMonthlySales(year), mockMonthlySales),
  });
}

export function useRepairReports() {
  return useQuery({
    queryKey: queryKeys.dashboard.repairReports,
    queryFn: () => withMockFallback(fetchRepairReports, mockRepairReport),
  });
}

export function useRecentActivities(limit = 8) {
  return useQuery({
    queryKey: queryKeys.dashboard.activities(limit),
    queryFn: () =>
      withMockFallback(() => fetchRecentActivities(limit), mockActivities),
  });
}
