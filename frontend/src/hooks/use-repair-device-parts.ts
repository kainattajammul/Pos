"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { getApiErrorMessage } from "@/lib/axios";
import {
  createRepairDevicePart,
  deleteRepairDevicePart,
  fetchRepairDeviceParts,
  updateRepairDevicePart,
  uploadRepairDevicePartImage,
} from "@/services/repair-device-parts.service";
import type { ApiErrorResponse } from "@/types/api";
import type {
  CreateRepairDevicePartPayload,
  UpdateRepairDevicePartPayload,
} from "@/types/repair-device-part";

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

export function useRepairDeviceParts(
  shopId: number,
  repairCategoryId: number | null,
  repairManufacturerId: number | null,
  repairDeviceId: number | null,
) {
  return useQuery({
    queryKey: queryKeys.repairDeviceParts.list(
      shopId,
      repairCategoryId ?? 0,
      repairManufacturerId ?? 0,
      repairDeviceId ?? 0,
    ),
    queryFn: () =>
      fetchRepairDeviceParts(
        shopId,
        repairCategoryId!,
        repairManufacturerId!,
        repairDeviceId!,
      ),
    enabled:
      repairCategoryId != null &&
      repairCategoryId > 0 &&
      repairManufacturerId != null &&
      repairManufacturerId > 0 &&
      repairDeviceId != null &&
      repairDeviceId > 0,
    staleTime: 10 * 60 * 1000,
  });
}

export function useUploadRepairDevicePartImage(
  shopId: number,
  repairCategoryId: number,
  repairManufacturerId: number,
  repairDeviceId: number,
) {
  return useMutation({
    mutationFn: (file: File) =>
      uploadRepairDevicePartImage(
        shopId,
        repairCategoryId,
        repairManufacturerId,
        repairDeviceId,
        file,
      ),
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, "Failed to upload image"));
    },
  });
}

export function useCreateRepairDevicePart(
  shopId: number,
  repairCategoryId: number,
  repairManufacturerId: number,
  repairDeviceId: number,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      payload: Omit<
        CreateRepairDevicePartPayload,
        "shopId" | "repairCategoryId" | "repairManufacturerId" | "repairDeviceId"
      >,
    ) =>
      createRepairDevicePart({
        ...payload,
        shopId,
        repairCategoryId,
        repairManufacturerId,
        repairDeviceId,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.repairDeviceParts.list(
          shopId,
          repairCategoryId,
          repairManufacturerId,
          repairDeviceId,
        ),
      });
      toast.success(`Part "${data.name}" created successfully`);
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, "Failed to create part"));
    },
  });
}

export function useUpdateRepairDevicePart(
  shopId: number,
  repairCategoryId: number,
  repairManufacturerId: number,
  repairDeviceId: number,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateRepairDevicePartPayload;
    }) => updateRepairDevicePart(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.repairDeviceParts.list(
          shopId,
          repairCategoryId,
          repairManufacturerId,
          repairDeviceId,
        ),
      });
      toast.success(`Part "${data.name}" updated successfully`);
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, "Failed to update part"));
    },
  });
}

export function useDeleteRepairDevicePart(
  shopId: number,
  repairCategoryId: number,
  repairManufacturerId: number,
  repairDeviceId: number,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteRepairDevicePart(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.repairDeviceParts.list(
          shopId,
          repairCategoryId,
          repairManufacturerId,
          repairDeviceId,
        ),
      });
      toast.success("Part deleted successfully");
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, "Failed to delete part"));
    },
  });
}
