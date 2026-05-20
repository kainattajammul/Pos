export const queryKeys = {
  dashboard: {
    summary: ["dashboard", "summary"] as const,
    lowStock: ["dashboard", "low-stock"] as const,
    revenue: (days: number) => ["dashboard", "revenue", days] as const,
    monthlySales: (year: number) => ["dashboard", "monthly-sales", year] as const,
    repairReports: ["dashboard", "repair-reports"] as const,
    activities: (limit: number) => ["dashboard", "activities", limit] as const,
  },
  products: {
    all: ["products"] as const,
    list: (params: Record<string, unknown>) => ["products", "list", params] as const,
  },
  auth: {
    me: ["auth", "me"] as const,
  },
} as const;
