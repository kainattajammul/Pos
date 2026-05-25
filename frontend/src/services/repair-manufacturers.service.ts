import { apiClient } from "@/lib/axios";
import { Plus } from "lucide-react";
import type { RepairManufacturer } from "@/lib/repairs-pos-data";
import type { ApiSuccessResponse } from "@/types/api";
import type {
  ApiRepairManufacturer,
  CreateRepairManufacturerPayload,
  ManufacturerBrandOption,
  UpdateRepairManufacturerPayload,
  UploadRepairManufacturerImageResult,
} from "@/types/repair-manufacturer";

export function mapApiRepairManufacturerToCard(
  manufacturer: ApiRepairManufacturer,
): RepairManufacturer {
  return {
    id: manufacturer.slug,
    name: manufacturer.name,
    iconKey: manufacturer.iconKey,
    logoSlug: manufacturer.logoSlug ?? manufacturer.slug,
    imageUrl: manufacturer.imageUrl ?? undefined,
    dbId: manufacturer.id,
    isDefault: manufacturer.isDefault,
  };
}

export function withAddManufacturerCard(
  manufacturers: RepairManufacturer[],
): RepairManufacturer[] {
  const withoutAdd = manufacturers.filter((m) => !m.isAdd);
  return [
    { id: "add", name: "Add Manufacturer", isAdd: true },
    ...withoutAdd,
  ];
}

export async function fetchRepairManufacturers(
  shopId: number,
  repairCategoryId: number,
): Promise<RepairManufacturer[]> {
  const { data } = await apiClient.get<ApiSuccessResponse<ApiRepairManufacturer[]>>(
    "/repair-manufacturers",
    { params: { shopId, repairCategoryId } },
  );
  return withAddManufacturerCard(data.data.map(mapApiRepairManufacturerToCard));
}

export async function searchRepairManufacturerIcons(
  query: string,
  limit = 40,
): Promise<ManufacturerBrandOption[]> {
  const { data } = await apiClient.get<
    ApiSuccessResponse<ManufacturerBrandOption[]>
  >("/repair-manufacturers/icons/search", { params: { q: query, limit } });
  return data.data;
}

export async function uploadRepairManufacturerImage(
  shopId: number,
  repairCategoryId: number,
  file: File,
): Promise<UploadRepairManufacturerImageResult> {
  const form = new FormData();
  form.append("shopId", String(shopId));
  form.append("repairCategoryId", String(repairCategoryId));
  form.append("image", file);

  const { data } = await apiClient.post<
    ApiSuccessResponse<UploadRepairManufacturerImageResult>
  >("/repair-manufacturers/upload-image", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
}

export async function createRepairManufacturer(
  payload: CreateRepairManufacturerPayload,
): Promise<ApiRepairManufacturer> {
  const { data } = await apiClient.post<ApiSuccessResponse<ApiRepairManufacturer>>(
    "/repair-manufacturers",
    payload,
  );
  return data.data;
}

export async function updateRepairManufacturer(
  id: number,
  payload: UpdateRepairManufacturerPayload,
): Promise<ApiRepairManufacturer> {
  const { data } = await apiClient.put<ApiSuccessResponse<ApiRepairManufacturer>>(
    `/repair-manufacturers/${id}`,
    payload,
  );
  return data.data;
}

export async function deleteRepairManufacturer(id: number): Promise<void> {
  await apiClient.delete<ApiSuccessResponse<undefined>>(`/repair-manufacturers/${id}`);
}
