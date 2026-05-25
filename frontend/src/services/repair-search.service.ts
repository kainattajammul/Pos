import { apiClient } from "@/lib/axios";
import type { ApiSuccessResponse } from "@/types/api";
import type { RepairSearchResultGroup } from "@/types/repair-search";

export async function searchRepairs(
  shopId: number,
  query: string,
): Promise<RepairSearchResultGroup[]> {
  const { data } = await apiClient.get<ApiSuccessResponse<RepairSearchResultGroup[]>>(
    "/repairs/search",
    {
      params: { shopId, query },
    },
  );
  return data.data;
}

export interface RepairBookingContext {
  device_id: number;
  device_name: string;
  device_catalog_key: string | null;
  category_slug: string;
  manufacturer_slug: string;
  repair_type_id: number;
  repair_name: string;
  catalog_key: string | null;
  price: string;
}

export async function fetchRepairBookingContext(
  shopId: number,
  deviceId: number,
  repairTypeId: number,
): Promise<RepairBookingContext> {
  const { data } = await apiClient.get<ApiSuccessResponse<RepairBookingContext>>(
    "/repairs/booking-context",
    { params: { shopId, deviceId, repairTypeId } },
  );
  return data.data;
}
