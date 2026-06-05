"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import type { StoreGeneralSettings } from "@/lib/store-settings-types";
import {
  fetchStoreGeneralSettings,
  updateStoreGeneralSettings,
} from "@/services/store-settings.service";

export function useStoreGeneralSettings(shopId: number) {
  return useQuery({
    queryKey: queryKeys.storeSettings.general(shopId),
    queryFn: () => fetchStoreGeneralSettings(shopId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateStoreGeneralSettings(shopId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: StoreGeneralSettings) =>
      updateStoreGeneralSettings(shopId, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.storeSettings.general(shopId), data);
      toast.success("Store settings saved");
    },
    onError: () => {
      toast.error("Failed to save store settings");
    },
  });
}
