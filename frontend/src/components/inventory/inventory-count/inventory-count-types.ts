import { formatCurrency } from "@/utils/format";

export type InventoryCountStatus = "PAUSED" | "IN_PROGRESS" | "COMPLETED" | "DRAFT";

export interface InventoryCountRecord {
  id: string;
  countId: string;
  date: string;
  store: string;
  countName: string;
  employee: string;
  items: string;
  status: InventoryCountStatus;
  inStock: string;
  counted: string;
  itemVariance: number;
  costVariance: number;
  adjustmentReport: string;
}

export interface InventoryCountFiltersState {
  countId: string;
  store: string;
  status: string;
  employee: string;
  dateFrom: string;
  dateTo: string;
}

export const DEFAULT_INVENTORY_COUNT_FILTERS: InventoryCountFiltersState = {
  countId: "",
  store: "",
  status: "",
  employee: "",
  dateFrom: "",
  dateTo: "",
};

/** Design preview row — kept when API returns empty */
export const SAMPLE_INVENTORY_COUNT: InventoryCountRecord = {
  id: "ic-001",
  countId: "IC-001",
  date: "25 Jul, 2025 (06:24 pm)",
  store: "Fone doctors",
  countName: "Fone doctors - 25 Jul, 2025 (06:24 PM)",
  employee: "Faisal Sheikh",
  items: "",
  status: "PAUSED",
  inStock: "",
  counted: "",
  itemVariance: 0,
  costVariance: 0,
  adjustmentReport: "",
};

export const MOCK_INVENTORY_COUNTS: InventoryCountRecord[] = [SAMPLE_INVENTORY_COUNT];

export function formatCostVariance(amount: number): string {
  return formatCurrency(amount);
}

export function matchesInventoryCountFilters(
  row: InventoryCountRecord,
  filters: InventoryCountFiltersState,
): boolean {
  if (
    filters.countId &&
    !row.countId.toLowerCase().includes(filters.countId.toLowerCase())
  ) {
    return false;
  }
  if (filters.store && !row.store.toLowerCase().includes(filters.store.toLowerCase())) {
    return false;
  }
  if (filters.status && row.status !== filters.status) {
    return false;
  }
  if (
    filters.employee &&
    !row.employee.toLowerCase().includes(filters.employee.toLowerCase())
  ) {
    return false;
  }
  return true;
}
