import { apiClient } from "@/lib/axios";
import {
  hasOpeningHours,
  hasProfileFields,
  mapCreatePayloadToApi,
  mapListItemToBranchRecord,
  mapOpeningHoursToApi,
  mapProfileToBranchRecord,
  mapUpdatePayloadToApi,
} from "@/lib/branch-api-mapper";
import type {
  BranchListFilters,
  BranchRecord,
  BranchStatus,
  CreateBranchPayload,
  UpdateBranchPayload,
} from "@/lib/branch-types";
import type {
  ApiBranchListItem,
  ApiBranchListParams,
  ApiBranchProfile,
} from "@/types/branch-api";
import type { ApiSuccessResponse } from "@/types/api";

function branchesPath(shopId: number) {
  return `/shops/${shopId}/branches`;
}

async function fetchProfile(shopId: number, uuid: string): Promise<BranchRecord> {
  const { data } = await apiClient.get<ApiSuccessResponse<ApiBranchProfile>>(
    `${branchesPath(shopId)}/${uuid}`,
  );
  return mapProfileToBranchRecord(data.data, shopId);
}

export async function fetchBranches(
  shopId: number,
  filters: Partial<BranchListFilters> = {},
): Promise<BranchRecord[]> {
  const params: ApiBranchListParams = {
    limit: 100,
    sort: "name",
    direction: "asc",
  };

  if (filters.search?.trim()) params.search = filters.search.trim();
  if (filters.status && filters.status !== "all") params.status = filters.status;
  if (filters.type && filters.type !== "all") params.type = filters.type;
  if (filters.status === "archived") params.archived = "true";
  if (filters.status === "all") params.include_archived = "true";

  const { data } = await apiClient.get<ApiSuccessResponse<ApiBranchListItem[]>>(
    branchesPath(shopId),
    { params },
  );

  return data.data.map((item) => mapListItemToBranchRecord(item, shopId));
}

export async function fetchBranch(shopId: number, uuid: string): Promise<BranchRecord> {
  return fetchProfile(shopId, uuid);
}

export async function createBranch(payload: CreateBranchPayload): Promise<BranchRecord> {
  const { data } = await apiClient.post<ApiSuccessResponse<ApiBranchProfile>>(
    branchesPath(payload.shopId),
    mapCreatePayloadToApi(payload),
  );
  return mapProfileToBranchRecord(data.data, payload.shopId);
}

export async function updateBranch(
  shopId: number,
  uuid: string,
  payload: UpdateBranchPayload,
): Promise<BranchRecord> {
  if (hasProfileFields(payload)) {
    const body = mapUpdatePayloadToApi(payload);
    if (Object.keys(body).length > 0) {
      await apiClient.put(`${branchesPath(shopId)}/${uuid}`, body);
    }
  }

  if (hasOpeningHours(payload) && payload.openingHours) {
    await apiClient.put(`${branchesPath(shopId)}/${uuid}/opening-hours`, {
      opening_hours: mapOpeningHoursToApi(payload.openingHours as BranchRecord["openingHours"]),
    });
  }

  return fetchProfile(shopId, uuid);
}

export async function updateBranchStatus(
  shopId: number,
  uuid: string,
  status: BranchStatus,
  currentStatus?: BranchStatus,
): Promise<BranchRecord> {
  if (status === "active") {
    if (currentStatus === "archived") {
      await apiClient.post(`${branchesPath(shopId)}/${uuid}/restore`);
    }
    await apiClient.post(`${branchesPath(shopId)}/${uuid}/activate`);
  } else if (status === "inactive") {
    if (currentStatus === "archived") {
      await apiClient.post(`${branchesPath(shopId)}/${uuid}/restore`);
    } else {
      await apiClient.post(`${branchesPath(shopId)}/${uuid}/deactivate`);
    }
  } else if (status === "archived") {
    await apiClient.post(`${branchesPath(shopId)}/${uuid}/archive`);
  } else if (status === "draft" || status === "temporarily_closed") {
    await apiClient.patch(`${branchesPath(shopId)}/${uuid}/status`, { status });
  }

  return fetchProfile(shopId, uuid);
}

export async function archiveBranch(shopId: number, uuid: string): Promise<BranchRecord> {
  const { data } = await apiClient.post<ApiSuccessResponse<ApiBranchProfile>>(
    `${branchesPath(shopId)}/${uuid}/archive`,
  );
  return mapProfileToBranchRecord(data.data, shopId);
}

export async function restoreBranch(shopId: number, uuid: string): Promise<BranchRecord> {
  const { data } = await apiClient.post<ApiSuccessResponse<ApiBranchProfile>>(
    `${branchesPath(shopId)}/${uuid}/restore`,
  );
  return mapProfileToBranchRecord(data.data, shopId);
}

export async function updateBranchOpeningHours(
  shopId: number,
  uuid: string,
  openingHours: BranchRecord["openingHours"],
): Promise<BranchRecord> {
  await apiClient.put(`${branchesPath(shopId)}/${uuid}/opening-hours`, {
    opening_hours: mapOpeningHoursToApi(openingHours),
  });
  return fetchProfile(shopId, uuid);
}
