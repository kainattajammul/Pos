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
  users: {
    all: ["users"] as const,
    list: () => ["users", "list"] as const,
    detail: (id: number) => ["users", "detail", id] as const,
  },
  roles: {
    all: ["roles"] as const,
    list: () => ["roles", "list"] as const,
    detail: (id: number) => ["roles", "detail", id] as const,
  },
  customers: {
    all: ["customers"] as const,
    list: () => ["customers", "list"] as const,
    detail: (id: number) => ["customers", "detail", id] as const,
  },
  repairCategories: {
    all: ["repair-categories"] as const,
    list: (shopId: number) => ["repair-categories", "list", shopId] as const,
  },
  repairManufacturers: {
    all: ["repair-manufacturers"] as const,
    list: (shopId: number, repairCategoryId: number) =>
      ["repair-manufacturers", "list", shopId, repairCategoryId] as const,
  },
  repairDevices: {
    all: ["repair-devices"] as const,
    list: (shopId: number, repairCategoryId: number, repairManufacturerId: number) =>
      ["repair-devices", "list", shopId, repairCategoryId, repairManufacturerId] as const,
  },
} as const;
