"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { getApiErrorMessage } from "@/lib/axios";
import {
  createRepairDeviceIssue,
  deleteRepairDeviceIssue,
  fetchRepairDeviceIssues,
  searchRepairDeviceIssueIcons,
  updateRepairDeviceIssue,
  uploadRepairDeviceIssueImage,
} from "@/services/repair-device-issues.service";
import type { ApiErrorResponse } from "@/types/api";
import type {
  CreateRepairDeviceIssuePayload,
  UpdateRepairDeviceIssuePayload,
} from "@/types/repair-device-issue";

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

export function useRepairDeviceIssues(
  shopId: number,
  repairCategoryId: number | null,
  repairManufacturerId: number | null,
  repairDeviceId: number | null,
) {
  return useQuery({
    queryKey: queryKeys.repairDeviceIssues.list(
      shopId,
      repairCategoryId ?? 0,
      repairManufacturerId ?? 0,
      repairDeviceId ?? 0,
    ),
    queryFn: () =>
      fetchRepairDeviceIssues(
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

export function useUploadRepairDeviceIssueImage(
  shopId: number,
  repairCategoryId: number,
  repairManufacturerId: number,
  repairDeviceId: number,
) {
  return useMutation({
    mutationFn: (file: File) =>
      uploadRepairDeviceIssueImage(
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

export function useRepairDeviceIssueIconSearch(query: string, enabled = true) {
  return useQuery({
    queryKey: [...queryKeys.repairDeviceIssues.all, "icons", query] as const,
    queryFn: () => searchRepairDeviceIssueIcons(query),
    enabled,
    staleTime: 60_000,
  });
}

export function useCreateRepairDeviceIssue(
  shopId: number,
  repairCategoryId: number,
  repairManufacturerId: number,
  repairDeviceId: number,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      payload: Omit<
        CreateRepairDeviceIssuePayload,
        "shopId" | "repairCategoryId" | "repairManufacturerId" | "repairDeviceId"
      >,
    ) =>
      createRepairDeviceIssue({
        ...payload,
        shopId,
        repairCategoryId,
        repairManufacturerId,
        repairDeviceId,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.repairDeviceIssues.list(
          shopId,
          repairCategoryId,
          repairManufacturerId,
          repairDeviceId,
        ),
      });
      toast.success(`Issue "${data.name}" created successfully`);
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, "Failed to create device issue"));
    },
  });
}

export function useUpdateRepairDeviceIssue(
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
      payload: UpdateRepairDeviceIssuePayload;
    }) => updateRepairDeviceIssue(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.repairDeviceIssues.list(
          shopId,
          repairCategoryId,
          repairManufacturerId,
          repairDeviceId,
        ),
      });
      toast.success(`Issue "${data.name}" updated successfully`);
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, "Failed to update device issue"));
    },
  });
}

export function useDeleteRepairDeviceIssue(
  shopId: number,
  repairCategoryId: number,
  repairManufacturerId: number,
  repairDeviceId: number,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteRepairDeviceIssue(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.repairDeviceIssues.list(
          shopId,
          repairCategoryId,
          repairManufacturerId,
          repairDeviceId,
        ),
      });
      toast.success("Device issue deleted successfully");
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, "Failed to delete device issue"));
    },
  });
}
