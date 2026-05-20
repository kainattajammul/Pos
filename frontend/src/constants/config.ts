export const APP_CONFIG = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1",
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "Fone Doctors POS",
  defaultPageSize: 10,
  sidebarWidth: 280,
  sidebarCollapsedWidth: 80,
} as const;

export const AUTH_STORAGE_KEY = "repair_pos_auth";
