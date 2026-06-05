import { apiClient } from "@/lib/axios";
import {
  DEFAULT_STORE_GENERAL_SETTINGS,
  type StoreGeneralSettings,
} from "@/lib/store-settings-types";
import type { ApiSuccessResponse } from "@/types/api";

export async function fetchStoreGeneralSettings(
  shopId: number,
): Promise<StoreGeneralSettings> {
  try {
    const { data } = await apiClient.get<ApiSuccessResponse<StoreGeneralSettings>>(
      `/shops/${shopId}/settings/general`,
    );
    return data.data ?? DEFAULT_STORE_GENERAL_SETTINGS;
  } catch {
    return DEFAULT_STORE_GENERAL_SETTINGS;
  }
}

export async function updateStoreGeneralSettings(
  shopId: number,
  payload: StoreGeneralSettings,
): Promise<StoreGeneralSettings> {
  try {
    const { data } = await apiClient.put<ApiSuccessResponse<StoreGeneralSettings>>(
      `/shops/${shopId}/settings/general`,
      payload,
    );
    return data.data ?? payload;
  } catch {
    return payload;
  }
}
