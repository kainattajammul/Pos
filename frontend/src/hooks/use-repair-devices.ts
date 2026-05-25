"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { getApiErrorMessage } from "@/lib/axios";
import {
  createRepairDevice,
  deleteRepairDevice,
  fetchRepairDevices,
  updateRepairDevice,
  uploadRepairDeviceImage,
} from "@/services/repair-devices.service";
import type { ApiErrorResponse } from "@/types/api";
import type {
  CreateRepairDevicePayload,
  UpdateRepairDevicePayload,
} from "@/types/repair-device";

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

export function useRepairDevices(
  shopId: number,
  repairCategoryId: number | null,
  repairManufacturerId: number | null,
) {
  return useQuery({
    queryKey: queryKeys.repairDevices.list(
      shopId,
      repairCategoryId ?? 0,
      repairManufacturerId ?? 0,
    ),
    queryFn: () =>
      fetchRepairDevices(shopId, repairCategoryId!, repairManufacturerId!),
    enabled:
      repairCategoryId != null &&
      repairCategoryId > 0 &&
      repairManufacturerId != null &&
      repairManufacturerId > 0,
    staleTime: 10 * 60 * 1000,
  });
}

export function useUploadRepairDeviceImage(
  shopId: number,
  repairCategoryId: number,
  repairManufacturerId: number,
) {
  return useMutation({
    mutationFn: (file: File) =>
      uploadRepairDeviceImage(shopId, repairCategoryId, repairManufacturerId, file),
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, "Failed to upload image"));
    },
  });
}

export function useCreateRepairDevice(
  shopId: number,
  repairCategoryId: number,
  repairManufacturerId: number,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      payload: Omit<
        CreateRepairDevicePayload,
        "shopId" | "repairCategoryId" | "repairManufacturerId"
      >,
    ) =>
      createRepairDevice({
        ...payload,
        shopId,
        repairCategoryId,
        repairManufacturerId,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.repairDevices.list(
          shopId,
          repairCategoryId,
          repairManufacturerId,
        ),
      });
      toast.success(`Device "${data.name}" created successfully`);
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, "Failed to create device"));
    },
  });
}

export function useUpdateRepairDevice(
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
      payload: UpdateRepairDevicePayload;
    }) => updateRepairDevice(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.repairDevices.list(
          shopId,
          repairCategoryId,
          repairManufacturerId,
        ),
      });
      toast.success(`Device "${data.name}" updated successfully`);
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, "Failed to update device"));
    },
  });
}

export function useDeleteRepairDevice(
  _shopId: number,
  _repairCategoryId: number,
  _repairManufacturerId: number,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteRepairDevice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.repairDevices.list(
          _shopId,
          _repairCategoryId,
          _repairManufacturerId,
        ),
      });
      toast.success("Device deleted successfully");
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, "Failed to delete device"));
    },
  });
}
