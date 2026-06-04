import { apiClient } from "@/lib/axios";
import {
  MOCK_INVENTORY_COUNTS as FALLBACK_COUNTS,
  type InventoryCountRecord,
} from "@/components/inventory/inventory-count/inventory-count-types";
import type { ApiSuccessResponse } from "@/types/api";

/** API shape when backend is ready */
export interface ApiInventoryCount {
  id: number;
  countId: string;
  date: string;
  store: string;
  countName: string;
  employee: string;
  items: string | null;
  status: InventoryCountRecord["status"];
  inStock: string | null;
  counted: string | null;
  itemVariance: number;
  costVariance: number;
  adjustmentReport: string | null;
}

function mapApiToRecord(row: ApiInventoryCount): InventoryCountRecord {
  return {
    id: String(row.id),
    countId: row.countId,
    date: row.date,
    store: row.store,
    countName: row.countName,
    employee: row.employee,
    items: row.items ?? "",
    status: row.status,
    inStock: row.inStock ?? "",
    counted: row.counted ?? "",
    itemVariance: row.itemVariance,
    costVariance: row.costVariance,
    adjustmentReport: row.adjustmentReport ?? "",
  };
}

export async function fetchInventoryCounts(
  shopId: number,
): Promise<InventoryCountRecord[]> {
  try {
    const { data } = await apiClient.get<ApiSuccessResponse<ApiInventoryCount[]>>(
      "/inventory-counts",
      { params: { shopId } },
    );
    const rows = data.data?.map(mapApiToRecord) ?? [];
    return rows.length > 0 ? rows : FALLBACK_COUNTS;
  } catch {
    return FALLBACK_COUNTS;
  }
}
