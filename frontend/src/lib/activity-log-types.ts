export type ActivityLogCategory =
  | "AUTH"
  | "PROFILE"
  | "SALE"
  | "SHIFT"
  | "PAYMENT"
  | "SYSTEM";

export interface ActivityLogEntry {
  id: string;
  userId: string;
  userName: string;
  email: string;
  category: ActivityLogCategory;
  action: string;
  description: string;
  reference?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface ActivityLogFilters {
  search: string;
  category: ActivityLogCategory | "ALL";
  dateFrom: string;
  dateTo: string;
  employee: string;
}

export const DEFAULT_ACTIVITY_LOG_FILTERS: ActivityLogFilters = {
  search: "",
  category: "ALL",
  dateFrom: "",
  dateTo: "",
  employee: "",
};

export function formatActivityDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function matchesActivityLogFilters(
  entry: ActivityLogEntry,
  filters: ActivityLogFilters,
): boolean {
  if (filters.category !== "ALL" && entry.category !== filters.category) {
    return false;
  }

  if (filters.employee.trim()) {
    const q = filters.employee.trim().toLowerCase();
    const haystack = `${entry.userName} ${entry.email} ${entry.userId}`.toLowerCase();
    if (!haystack.includes(q)) return false;
  }

  if (filters.search.trim()) {
    const q = filters.search.trim().toLowerCase();
    const haystack =
      `${entry.action} ${entry.description} ${entry.reference ?? ""}`.toLowerCase();
    if (!haystack.includes(q)) return false;
  }

  if (filters.dateFrom) {
    const from = new Date(`${filters.dateFrom}T00:00:00`);
    if (new Date(entry.createdAt) < from) return false;
  }

  if (filters.dateTo) {
    const to = new Date(`${filters.dateTo}T23:59:59.999`);
    if (new Date(entry.createdAt) > to) return false;
  }

  return true;
}
