import { apiClient } from "@/lib/axios";
import {
  mapApiCommunicationSettings,
  mapApiFinanceSettings,
  mapApiInventorySettings,
  mapApiOperationsSettings,
  mapApiReportingSettings,
  mapApiSystemSettings,
  mapCommunicationSettingsToApi,
  mapFinanceSettingsToApi,
  mapInventorySettingsToApi,
  mapOperationsSettingsToApi,
  mapReportingSettingsToApi,
  mapSystemSettingsToApi,
} from "@/lib/branch-module-mapper";
import type {
  BranchCommunicationSettings,
  BranchFinanceSettings,
  BranchInventorySettings,
  BranchOperationsSettings,
  BranchReportingSettings,
  BranchSystemSettings,
} from "@/lib/branch-types";
import type {
  ApiBranchCommunicationSettings,
  ApiBranchFinanceSettings,
  ApiBranchInventorySettings,
  ApiBranchOperationsSettings,
  ApiBranchReportingSettings,
  ApiBranchSystemSettings,
  ApiUpdateBranchCommunicationSettings,
  ApiUpdateBranchFinanceSettings,
  ApiUpdateBranchInventorySettings,
  ApiUpdateBranchOperationsSettings,
  ApiUpdateBranchReportingSettings,
  ApiUpdateBranchSystemSettings,
} from "@/types/branch-module-api";
import type { ApiSuccessResponse } from "@/types/api";

function branchPath(shopId: number, branchUuid: string) {
  return `/shops/${shopId}/branches/${branchUuid}`;
}

export async function fetchBranchInventorySettings(
  shopId: number,
  branchUuid: string,
): Promise<BranchInventorySettings> {
  const { data } = await apiClient.get<ApiSuccessResponse<ApiBranchInventorySettings>>(
    `${branchPath(shopId, branchUuid)}/inventory-settings`,
  );
  return mapApiInventorySettings(data.data);
}

export async function updateBranchInventorySettings(
  shopId: number,
  branchUuid: string,
  settings: BranchInventorySettings,
): Promise<BranchInventorySettings> {
  const body: ApiUpdateBranchInventorySettings = mapInventorySettingsToApi(settings);
  const { data } = await apiClient.patch<ApiSuccessResponse<ApiBranchInventorySettings>>(
    `${branchPath(shopId, branchUuid)}/inventory-settings`,
    body,
  );
  return mapApiInventorySettings(data.data);
}

export async function fetchBranchOperationsSettings(
  shopId: number,
  branchUuid: string,
): Promise<BranchOperationsSettings> {
  const { data } = await apiClient.get<ApiSuccessResponse<ApiBranchOperationsSettings>>(
    `${branchPath(shopId, branchUuid)}/operations-settings`,
  );
  return mapApiOperationsSettings(data.data);
}

export async function updateBranchOperationsSettings(
  shopId: number,
  branchUuid: string,
  settings: BranchOperationsSettings,
): Promise<BranchOperationsSettings> {
  const body: ApiUpdateBranchOperationsSettings = mapOperationsSettingsToApi(settings);
  const { data } = await apiClient.patch<ApiSuccessResponse<ApiBranchOperationsSettings>>(
    `${branchPath(shopId, branchUuid)}/operations-settings`,
    body,
  );
  return mapApiOperationsSettings(data.data);
}

export async function fetchBranchFinanceSettings(
  shopId: number,
  branchUuid: string,
): Promise<BranchFinanceSettings> {
  const { data } = await apiClient.get<ApiSuccessResponse<ApiBranchFinanceSettings>>(
    `${branchPath(shopId, branchUuid)}/finance-settings`,
  );
  return mapApiFinanceSettings(data.data);
}

export async function updateBranchFinanceSettings(
  shopId: number,
  branchUuid: string,
  settings: BranchFinanceSettings,
): Promise<BranchFinanceSettings> {
  const body: ApiUpdateBranchFinanceSettings = mapFinanceSettingsToApi(settings);
  const { data } = await apiClient.patch<ApiSuccessResponse<ApiBranchFinanceSettings>>(
    `${branchPath(shopId, branchUuid)}/finance-settings`,
    body,
  );
  return mapApiFinanceSettings(data.data);
}

export async function fetchBranchCommunicationSettings(
  shopId: number,
  branchUuid: string,
): Promise<BranchCommunicationSettings> {
  const { data } = await apiClient.get<ApiSuccessResponse<ApiBranchCommunicationSettings>>(
    `${branchPath(shopId, branchUuid)}/communication-settings`,
  );
  return mapApiCommunicationSettings(data.data);
}

export async function updateBranchCommunicationSettings(
  shopId: number,
  branchUuid: string,
  settings: BranchCommunicationSettings,
): Promise<BranchCommunicationSettings> {
  const body: ApiUpdateBranchCommunicationSettings = mapCommunicationSettingsToApi(settings);
  const { data } = await apiClient.patch<ApiSuccessResponse<ApiBranchCommunicationSettings>>(
    `${branchPath(shopId, branchUuid)}/communication-settings`,
    body,
  );
  return mapApiCommunicationSettings(data.data);
}

export async function fetchBranchReportingSettings(
  shopId: number,
  branchUuid: string,
): Promise<BranchReportingSettings> {
  const { data } = await apiClient.get<ApiSuccessResponse<ApiBranchReportingSettings>>(
    `${branchPath(shopId, branchUuid)}/reporting-settings`,
  );
  return mapApiReportingSettings(data.data);
}

export async function updateBranchReportingSettings(
  shopId: number,
  branchUuid: string,
  settings: BranchReportingSettings,
): Promise<BranchReportingSettings> {
  const body: ApiUpdateBranchReportingSettings = mapReportingSettingsToApi(settings);
  const { data } = await apiClient.patch<ApiSuccessResponse<ApiBranchReportingSettings>>(
    `${branchPath(shopId, branchUuid)}/reporting-settings`,
    body,
  );
  return mapApiReportingSettings(data.data);
}

export async function fetchBranchSystemSettings(
  shopId: number,
  branchUuid: string,
): Promise<BranchSystemSettings> {
  const { data } = await apiClient.get<ApiSuccessResponse<ApiBranchSystemSettings>>(
    `${branchPath(shopId, branchUuid)}/system-settings`,
  );
  return mapApiSystemSettings(data.data);
}

export async function updateBranchSystemSettings(
  shopId: number,
  branchUuid: string,
  settings: BranchSystemSettings,
): Promise<BranchSystemSettings> {
  const body: ApiUpdateBranchSystemSettings = mapSystemSettingsToApi(settings);
  const { data } = await apiClient.patch<ApiSuccessResponse<ApiBranchSystemSettings>>(
    `${branchPath(shopId, branchUuid)}/system-settings`,
    body,
  );
  return mapApiSystemSettings(data.data);
}
