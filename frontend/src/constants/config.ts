export const APP_CONFIG = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1",
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "Repair Store",
  /** Shop used by repair POS until auth provides shop context */
  defaultShopId: Number(process.env.NEXT_PUBLIC_DEFAULT_SHOP_ID ?? "1"),
  defaultPageSize: 10,
  sidebarWidth: 280,
  /** Collapsed strip — toggle only (logo hidden) */
  sidebarCollapsedWidth: 64,
} as const;

export const AUTH_STORAGE_KEY = "repair_pos_auth";
