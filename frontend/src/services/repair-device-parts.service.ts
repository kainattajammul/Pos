import { apiClient } from "@/lib/axios";
import { uploadImage } from "@/services/upload.service";
import { normalizeRepairPartImageVariant } from "@/lib/repairs-parts-data";
import type { RepairPart } from "@/lib/repairs-parts-data";
import { REPAIR_PARTS_FALLBACK } from "@/lib/repairs-parts-data";
import type { ApiSuccessResponse } from "@/types/api";
import type {
  ApiRepairDevicePart,
  CreateRepairDevicePartPayload,
  UpdateRepairDevicePartPayload,
  UploadRepairDevicePartImageResult,
} from "@/types/repair-device-part";

export function mapApiRepairDevicePartToCard(part: ApiRepairDevicePart): RepairPart {
  return {
    id: part.slug,
    name: part.name,
    price: part.price,
    onHand: part.onHand,
    image: normalizeRepairPartImageVariant(part.imageVariant),
    imageUrl: part.imageUrl ?? null,
    dbId: part.id,
    isDefault: part.isDefault,
  };
}

export function withAddPartCard(parts: RepairPart[]): RepairPart[] {
  const withoutAdd = parts.filter((p) => !p.isAdd);
  return [
    {
      id: "add-part",
      name: "Add Part",
      price: 0,
      onHand: 0,
      image: "screen",
      isAdd: true,
    },
    ...withoutAdd,
  ];
}

export async function fetchRepairDeviceParts(
  shopId: number,
  repairCategoryId: number,
  repairManufacturerId: number,
  repairDeviceId: number,
): Promise<RepairPart[]> {
  const { data } = await apiClient.get<ApiSuccessResponse<ApiRepairDevicePart[]>>(
    "/repair-device-parts",
    {
      params: {
        shopId,
        repairCategoryId,
        repairManufacturerId,
        repairDeviceId,
      },
    },
  );
  return withAddPartCard(data.data.map(mapApiRepairDevicePartToCard));
}

export async function uploadRepairDevicePartImage(
  shopId: number,
  repairCategoryId: number,
  repairManufacturerId: number,
  repairDeviceId: number,
  file: File,
): Promise<UploadRepairDevicePartImageResult> {
  const uploaded = await uploadImage(file, {
    prefix: `shop-${shopId}/category-${repairCategoryId}/manufacturer-${repairManufacturerId}/device-${repairDeviceId}/parts`,
  });
  return { url: uploaded.url, path: uploaded.path };
}

export async function createRepairDevicePart(
  payload: CreateRepairDevicePartPayload,
): Promise<ApiRepairDevicePart> {
  const { data } = await apiClient.post<ApiSuccessResponse<ApiRepairDevicePart>>(
    "/repair-device-parts",
    payload,
  );
  return data.data;
}

export async function updateRepairDevicePart(
  id: number,
  payload: UpdateRepairDevicePartPayload,
): Promise<ApiRepairDevicePart> {
  const { data } = await apiClient.put<ApiSuccessResponse<ApiRepairDevicePart>>(
    `/repair-device-parts/${id}`,
    payload,
  );
  return data.data;
}

export async function deleteRepairDevicePart(id: number): Promise<void> {
  await apiClient.delete<ApiSuccessResponse<undefined>>(`/repair-device-parts/${id}`);
}

export { REPAIR_PARTS_FALLBACK };
