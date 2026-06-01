import { apiClient } from "@/lib/axios";
import type { RepairDeviceSeries } from "@/lib/repairs-series-data";
import type { ApiSuccessResponse } from "@/types/api";
import type {
  ApiRepairDeviceSeries,
  CreateRepairDeviceSeriesPayload,
  UpdateRepairDeviceSeriesPayload,
} from "@/types/repair-device-series";

export function mapApiRepairDeviceSeriesToCard(
  series: ApiRepairDeviceSeries,
): RepairDeviceSeries {
  return {
    id: series.slug,
    name: series.name,
    dbId: series.id,
  };
}

export async function fetchRepairDeviceSeries(
  shopId: number,
  repairCategoryId: number,
  repairManufacturerId: number,
): Promise<RepairDeviceSeries[]> {
  const { data } = await apiClient.get<ApiSuccessResponse<ApiRepairDeviceSeries[]>>(
    "/repair-device-series",
    {
      params: { shopId, repairCategoryId, repairManufacturerId },
    },
  );
  return data.data
    .map(mapApiRepairDeviceSeriesToCard)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function createRepairDeviceSeries(
  payload: CreateRepairDeviceSeriesPayload,
): Promise<ApiRepairDeviceSeries> {
  const { data } = await apiClient.post<ApiSuccessResponse<ApiRepairDeviceSeries>>(
    "/repair-device-series",
    payload,
  );
  return data.data;
}

export async function updateRepairDeviceSeries(
  id: number,
  payload: UpdateRepairDeviceSeriesPayload,
): Promise<ApiRepairDeviceSeries> {
  const { data } = await apiClient.put<ApiSuccessResponse<ApiRepairDeviceSeries>>(
    `/repair-device-series/${id}`,
    payload,
  );
  return data.data;
}

export async function deleteRepairDeviceSeries(id: number): Promise<void> {
  await apiClient.delete<ApiSuccessResponse<undefined>>(
    `/repair-device-series/${id}`,
  );
}
