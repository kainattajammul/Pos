import { apiClient } from "@/lib/axios";
import { resolveRepairCategoryIcon } from "@/lib/repair-category-icons";
import { Plus } from "lucide-react";
import type { RepairCategoryCard } from "@/lib/repairs-pos-data";
import type { ApiSuccessResponse } from "@/types/api";
import type {
  ApiRepairCategory,
  CreateRepairCategoryPayload,
  RepairCategoryIconOption,
  UpdateRepairCategoryPayload,
  UploadRepairCategoryImageResult,
} from "@/types/repair-category";

export function mapApiRepairCategoryToCard(
  category: ApiRepairCategory,
): RepairCategoryCard {
  return {
    id: category.slug,
    label: category.name,
    icon: resolveRepairCategoryIcon(category.iconKey),
    iconKey: category.iconKey,
    imageUrl: category.imageUrl ?? undefined,
    dbId: category.id,
    isDefault: category.isDefault,
  };
}

export function withAddCategoryCard(
  categories: RepairCategoryCard[],
): RepairCategoryCard[] {
  const withoutAdd = categories.filter((c) => !c.isAdd);
  return [
    { id: "add", label: "Add Category", icon: Plus, isAdd: true },
    ...withoutAdd,
  ];
}

export async function fetchRepairCategories(
  shopId: number,
): Promise<RepairCategoryCard[]> {
  const { data } = await apiClient.get<ApiSuccessResponse<ApiRepairCategory[]>>(
    "/repair-categories",
    { params: { shopId } },
  );
  return withAddCategoryCard(data.data.map(mapApiRepairCategoryToCard));
}

export async function searchRepairCategoryIcons(
  query: string,
  limit = 32,
): Promise<RepairCategoryIconOption[]> {
  const { data } = await apiClient.get<
    ApiSuccessResponse<RepairCategoryIconOption[]>
  >("/repair-categories/icons/search", { params: { q: query, limit } });
  return data.data;
}

export async function uploadRepairCategoryImage(
  shopId: number,
  file: File,
): Promise<UploadRepairCategoryImageResult> {
  const form = new FormData();
  form.append("shopId", String(shopId));
  form.append("image", file);

  const { data } = await apiClient.post<
    ApiSuccessResponse<UploadRepairCategoryImageResult>
  >("/repair-categories/upload-image", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
}

export async function createRepairCategory(
  payload: CreateRepairCategoryPayload,
): Promise<ApiRepairCategory> {
  const { data } = await apiClient.post<ApiSuccessResponse<ApiRepairCategory>>(
    "/repair-categories",
    payload,
  );
  return data.data;
}

export async function updateRepairCategory(
  id: number,
  payload: UpdateRepairCategoryPayload,
): Promise<ApiRepairCategory> {
  const { data } = await apiClient.put<ApiSuccessResponse<ApiRepairCategory>>(
    `/repair-categories/${id}`,
    payload,
  );
  return data.data;
}

export async function deleteRepairCategory(id: number): Promise<void> {
  await apiClient.delete<ApiSuccessResponse<undefined>>(`/repair-categories/${id}`);
}
