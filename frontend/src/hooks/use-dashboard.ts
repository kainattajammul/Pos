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
import { hasRealApiSession } from "@/lib/auth-session";
import {
  fetchDashboardSummary,
  fetchMonthlySales,
  fetchRecentActivities,
  fetchRepairReports,
  fetchRevenueAnalytics,
} from "@/services/dashboard.service";

const useMockFallback = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

async function resolveDashboardData<T>(
  fetcher: () => Promise<T>,
  fallback: T,
): Promise<T> {
  if (useMockFallback && !hasRealApiSession()) {
    return fallback;
  }
  try {
    return await fetcher();
  } catch {
    if (useMockFallback) return fallback;
    throw new Error("Failed to load dashboard data");
  }
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: queryKeys.dashboard.summary,
    queryFn: () =>
      resolveDashboardData(fetchDashboardSummary, mockDashboardSummary),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRevenueAnalytics(days = 30) {
  return useQuery({
    queryKey: queryKeys.dashboard.revenue(days),
    queryFn: () =>
      resolveDashboardData(() => fetchRevenueAnalytics(days), mockRevenue),
    staleTime: 5 * 60 * 1000,
  });
}

export function useMonthlySales(year = new Date().getFullYear()) {
  return useQuery({
    queryKey: queryKeys.dashboard.monthlySales(year),
    queryFn: () =>
      resolveDashboardData(() => fetchMonthlySales(year), mockMonthlySales),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRepairReports() {
  return useQuery({
    queryKey: queryKeys.dashboard.repairReports,
    queryFn: () =>
      resolveDashboardData(fetchRepairReports, mockRepairReport),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRecentActivities(limit = 8) {
  return useQuery({
    queryKey: queryKeys.dashboard.activities(limit),
    queryFn: () =>
      resolveDashboardData(() => fetchRecentActivities(limit), mockActivities),
    staleTime: 5 * 60 * 1000,
  });
}
