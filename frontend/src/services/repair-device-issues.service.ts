import { apiClient } from "@/lib/axios";
import { uploadImage } from "@/services/upload.service";
import { normalizeRepairProblemIcon } from "@/lib/repair-issue-icons";
import type { RepairProblem } from "@/lib/repairs-problems-data";
import { REPAIR_PROBLEMS_FALLBACK } from "@/lib/repairs-problems-data";
import type { ApiSuccessResponse } from "@/types/api";
import type {
  ApiRepairDeviceIssue,
  CreateRepairDeviceIssuePayload,
  IssueIconOption,
  UpdateRepairDeviceIssuePayload,
  UploadRepairDeviceIssueImageResult,
} from "@/types/repair-device-issue";

export function mapApiRepairDeviceIssueToCard(
  issue: ApiRepairDeviceIssue,
): RepairProblem {
  return {
    id: issue.slug,
    name: issue.name,
    price: issue.price,
    icon: normalizeRepairProblemIcon(issue.iconKey),
    imageUrl: issue.imageUrl ?? undefined,
    dbId: issue.id,
    isDefault: issue.isDefault,
  };
}

export function withAddDeviceIssueCard(problems: RepairProblem[]): RepairProblem[] {
  const withoutAdd = problems.filter((p) => !p.isAdd);
  return [
    {
      id: "add-device-issue",
      name: "Add Device Issue",
      price: 0,
      icon: "diagnostic",
      isAdd: true,
    },
    ...withoutAdd,
  ];
}

export async function fetchRepairDeviceIssues(
  shopId: number,
  repairCategoryId: number,
  repairManufacturerId: number,
  repairDeviceId: number,
): Promise<RepairProblem[]> {
  const { data } = await apiClient.get<ApiSuccessResponse<ApiRepairDeviceIssue[]>>(
    "/repair-device-issues",
    {
      params: {
        shopId,
        repairCategoryId,
        repairManufacturerId,
        repairDeviceId,
      },
    },
  );
  return withAddDeviceIssueCard(data.data.map(mapApiRepairDeviceIssueToCard));
}

export async function searchRepairDeviceIssueIcons(
  query: string,
  limit = 32,
): Promise<IssueIconOption[]> {
  const { data } = await apiClient.get<ApiSuccessResponse<IssueIconOption[]>>(
    "/repair-device-issues/icons/search",
    { params: { q: query, limit } },
  );
  return data.data;
}

export async function uploadRepairDeviceIssueImage(
  shopId: number,
  repairCategoryId: number,
  repairManufacturerId: number,
  repairDeviceId: number,
  file: File,
): Promise<UploadRepairDeviceIssueImageResult> {
  const uploaded = await uploadImage(file, {
    prefix: `shop-${shopId}/category-${repairCategoryId}/manufacturer-${repairManufacturerId}/device-${repairDeviceId}/issues`,
  });
  return { url: uploaded.url, path: uploaded.path };
}

export async function createRepairDeviceIssue(
  payload: CreateRepairDeviceIssuePayload,
): Promise<ApiRepairDeviceIssue> {
  const { data } = await apiClient.post<ApiSuccessResponse<ApiRepairDeviceIssue>>(
    "/repair-device-issues",
    payload,
  );
  return data.data;
}

export async function updateRepairDeviceIssue(
  id: number,
  payload: UpdateRepairDeviceIssuePayload,
): Promise<ApiRepairDeviceIssue> {
  const { data } = await apiClient.put<ApiSuccessResponse<ApiRepairDeviceIssue>>(
    `/repair-device-issues/${id}`,
    payload,
  );
  return data.data;
}

export async function deleteRepairDeviceIssue(id: number): Promise<void> {
  await apiClient.delete<ApiSuccessResponse<undefined>>(
    `/repair-device-issues/${id}`,
  );
}

export { REPAIR_PROBLEMS_FALLBACK };
