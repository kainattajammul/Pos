"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { getApiErrorMessage } from "@/lib/axios";
import {
  createRepairDeviceSeries,
  deleteRepairDeviceSeries,
  fetchRepairDeviceSeries,
  updateRepairDeviceSeries,
} from "@/services/repair-device-series.service";
import type { ApiErrorResponse } from "@/types/api";
import type {
  CreateRepairDeviceSeriesPayload,
  UpdateRepairDeviceSeriesPayload,
} from "@/types/repair-device-series";

function getMutationErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    if (data?.errors?.length) {
      return data.errors.map((e) => e.message).join(". ");
    }
    return getApiErrorMessage(error, fallback);
  }
  return getApiErrorMessage(error, fallback);
}

export function useRepairDeviceSeries(
  shopId: number,
  repairCategoryId: number | null,
  repairManufacturerId: number | null,
) {
  return useQuery({
    queryKey: queryKeys.repairDeviceSeries.list(
      shopId,
      repairCategoryId ?? 0,
      repairManufacturerId ?? 0,
    ),
    queryFn: () =>
      fetchRepairDeviceSeries(shopId, repairCategoryId!, repairManufacturerId!),
    enabled:
      repairCategoryId != null &&
      repairCategoryId > 0 &&
      repairManufacturerId != null &&
      repairManufacturerId > 0,
    staleTime: 10 * 60 * 1000,
  });
}

export function useCreateRepairDeviceSeries(
  shopId: number,
  repairCategoryId: number,
  repairManufacturerId: number,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      payload: Omit<
        CreateRepairDeviceSeriesPayload,
        "shopId" | "repairCategoryId" | "repairManufacturerId"
      > & { repairManufacturerId?: number },
    ) =>
      createRepairDeviceSeries({
        name: payload.name,
        sortOrder: payload.sortOrder,
        shopId,
        repairCategoryId,
        repairManufacturerId: payload.repairManufacturerId ?? repairManufacturerId,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.repairDeviceSeries.all });
      toast.success(`Series "${data.name}" created successfully`);
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, "Failed to create series"));
    },
  });
}

export function useUpdateRepairDeviceSeries(
  shopId: number,
  repairCategoryId: number,
  repairManufacturerId: number,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateRepairDeviceSeriesPayload;
    }) => updateRepairDeviceSeries(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.repairDeviceSeries.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.repairDevices.list(
          shopId,
          repairCategoryId,
          repairManufacturerId,
        ),
      });
      toast.success(`Series "${data.name}" updated successfully`);
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, "Failed to update series"));
    },
  });
}

export function useDeleteRepairDeviceSeries(
  shopId: number,
  repairCategoryId: number,
  repairManufacturerId: number,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteRepairDeviceSeries(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.repairDeviceSeries.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.repairDevices.list(
          shopId,
          repairCategoryId,
          repairManufacturerId,
        ),
      });
      toast.success("Series deleted successfully");
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, "Failed to delete series"));
    },
  });
}
