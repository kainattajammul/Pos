"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { getApiErrorMessage } from "@/lib/axios";
import {
  createRepairManufacturer,
  deleteRepairManufacturer,
  fetchRepairManufacturers,
  searchRepairManufacturerIcons,
  updateRepairManufacturer,
  uploadRepairManufacturerImage,
} from "@/services/repair-manufacturers.service";
import type { ApiErrorResponse } from "@/types/api";
import type {
  CreateRepairManufacturerPayload,
  UpdateRepairManufacturerPayload,
} from "@/types/repair-manufacturer";

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

export function useRepairManufacturers(shopId: number, repairCategoryId: number | null) {
  return useQuery({
    queryKey: queryKeys.repairManufacturers.list(shopId, repairCategoryId ?? 0),
    queryFn: () => fetchRepairManufacturers(shopId, repairCategoryId!),
    enabled: repairCategoryId != null && repairCategoryId > 0,
    staleTime: 10 * 60 * 1000,
  });
}

export function useRepairManufacturerIconSearch(query: string, enabled = true) {
  return useQuery({
    queryKey: [...queryKeys.repairManufacturers.all, "icons", query] as const,
    queryFn: () => searchRepairManufacturerIcons(query),
    enabled,
    staleTime: 60_000,
  });
}

export function useUploadRepairManufacturerImage(
  shopId: number,
  repairCategoryId: number,
) {
  return useMutation({
    mutationFn: (file: File) =>
      uploadRepairManufacturerImage(shopId, repairCategoryId, file),
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, "Failed to upload image"));
    },
  });
}

export function useCreateRepairManufacturer(shopId: number, repairCategoryId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Omit<CreateRepairManufacturerPayload, "shopId" | "repairCategoryId">) =>
      createRepairManufacturer({ ...payload, shopId, repairCategoryId }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.repairManufacturers.all });
      toast.success(`Manufacturer "${data.name}" created successfully`);
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, "Failed to create manufacturer"));
    },
  });
}

export function useUpdateRepairManufacturer(
  _shopId: number,
  _repairCategoryId: number,
) {
  void _shopId;
  void _repairCategoryId;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateRepairManufacturerPayload;
    }) => updateRepairManufacturer(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.repairManufacturers.all });
      toast.success(`Manufacturer "${data.name}" updated successfully`);
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, "Failed to update manufacturer"));
    },
  });
}

export function useDeleteRepairManufacturer(
  _shopId: number,
  _repairCategoryId: number,
) {
  void _shopId;
  void _repairCategoryId;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteRepairManufacturer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.repairManufacturers.all });
      toast.success("Manufacturer deleted successfully");
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, "Failed to delete manufacturer"));
    },
  });
}
