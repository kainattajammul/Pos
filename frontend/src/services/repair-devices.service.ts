import { apiClient } from "@/lib/axios";
import { uploadImage } from "@/services/upload.service";
import type { RepairDevice } from "@/lib/repairs-devices-data";
import { sortRepairDevices } from "@/lib/repair-device-sort";
import type { ApiSuccessResponse } from "@/types/api";
import type {
  ApiRepairDevice,
  CreateRepairDevicePayload,
  UpdateRepairDevicePayload,
  UploadRepairDeviceImageResult,
} from "@/types/repair-device";

export function mapApiRepairDeviceToCard(device: ApiRepairDevice): RepairDevice {
  return {
    id: device.slug,
    name: device.name,
    imageUrl: device.imageUrl ?? undefined,
    iconVariant: device.iconVariant ?? undefined,
    dbId: device.id,
    repairDeviceSeriesId: device.repairDeviceSeriesId ?? null,
    isDefault: device.isDefault,
  };
}

export function withAddDeviceCard(devices: RepairDevice[]): RepairDevice[] {
  const withoutAdd = devices.filter((d) => !d.isAdd);
  const sorted = sortRepairDevices(withoutAdd);
  return [
    { id: "add-device", name: "Add Device", isAdd: true },
    ...sorted,
  ];
}

export async function fetchRepairDevices(
  shopId: number,
  repairCategoryId: number,
  repairManufacturerId: number,
): Promise<RepairDevice[]> {
  const { data } = await apiClient.get<ApiSuccessResponse<ApiRepairDevice[]>>(
    "/repair-devices",
    {
      params: { shopId, repairCategoryId, repairManufacturerId },
    },
  );
  return withAddDeviceCard(data.data.map(mapApiRepairDeviceToCard));
}

export async function uploadRepairDeviceImage(
  shopId: number,
  repairCategoryId: number,
  repairManufacturerId: number,
  file: File,
): Promise<UploadRepairDeviceImageResult> {
  const uploaded = await uploadImage(file, {
    prefix: `shop-${shopId}/category-${repairCategoryId}/manufacturer-${repairManufacturerId}/devices`,
  });
  return { url: uploaded.url, path: uploaded.path };
}

export async function createRepairDevice(
  payload: CreateRepairDevicePayload,
): Promise<ApiRepairDevice> {
  const { data } = await apiClient.post<ApiSuccessResponse<ApiRepairDevice>>(
    "/repair-devices",
    payload,
  );
  return data.data;
}

export async function updateRepairDevice(
  id: number,
  payload: UpdateRepairDevicePayload,
): Promise<ApiRepairDevice> {
  const { data } = await apiClient.put<ApiSuccessResponse<ApiRepairDevice>>(
    `/repair-devices/${id}`,
    payload,
  );
  return data.data;
}

export async function deleteRepairDevice(id: number): Promise<void> {
  await apiClient.delete<ApiSuccessResponse<undefined>>(`/repair-devices/${id}`);
}
