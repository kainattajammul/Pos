import { apiClient } from "@/lib/axios";
import type { RepairDevice } from "@/lib/repairs-devices-data";
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
    isDefault: device.isDefault,
  };
}

export function withAddDeviceCard(devices: RepairDevice[]): RepairDevice[] {
  const withoutAdd = devices.filter((d) => !d.isAdd);
  return [
    { id: "add-device", name: "Add Device", isAdd: true },
    ...withoutAdd,
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
  const form = new FormData();
  form.append("shopId", String(shopId));
  form.append("repairCategoryId", String(repairCategoryId));
  form.append("repairManufacturerId", String(repairManufacturerId));
  form.append("image", file);

  const { data } = await apiClient.post<
    ApiSuccessResponse<UploadRepairDeviceImageResult>
  >("/repair-devices/upload-image", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
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
