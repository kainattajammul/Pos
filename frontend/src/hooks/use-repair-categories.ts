"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { getApiErrorMessage } from "@/lib/axios";
import {
  createRepairCategory,
  deleteRepairCategory,
  fetchRepairCategories,
  searchRepairCategoryIcons,
  updateRepairCategory,
  uploadRepairCategoryImage,
} from "@/services/repair-categories.service";
import type { ApiErrorResponse } from "@/types/api";
import type {
  CreateRepairCategoryPayload,
  UpdateRepairCategoryPayload,
} from "@/types/repair-category";

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

export function useRepairCategories(shopId: number) {
  return useQuery({
    queryKey: queryKeys.repairCategories.list(shopId),
    queryFn: () => fetchRepairCategories(shopId),
    staleTime: 10 * 60 * 1000,
  });
}

export function useRepairCategoryIconSearch(query: string, enabled = true) {
  return useQuery({
    queryKey: [...queryKeys.repairCategories.all, "icons", query] as const,
    queryFn: () => searchRepairCategoryIcons(query),
    enabled,
    staleTime: 60_000,
  });
}

export function useUploadRepairCategoryImage(shopId: number) {
  return useMutation({
    mutationFn: (file: File) => uploadRepairCategoryImage(shopId, file),
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, "Failed to upload image"));
    },
  });
}

export function useCreateRepairCategory(shopId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Omit<CreateRepairCategoryPayload, "shopId">) =>
      createRepairCategory({ ...payload, shopId }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.repairCategories.all });
      toast.success(`Category "${data.name}" created successfully`);
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, "Failed to create category"));
    },
  });
}

export function useUpdateRepairCategory(shopId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateRepairCategoryPayload;
    }) => updateRepairCategory(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.repairCategories.all });
      toast.success(`Category "${data.name}" updated successfully`);
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, "Failed to update category"));
    },
  });
}

export function useDeleteRepairCategory(_shopId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteRepairCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.repairCategories.all });
      toast.success("Category deleted successfully");
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, "Failed to delete category"));
    },
  });
}
