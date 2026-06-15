"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { APP_CONFIG } from "@/constants/config";
import { queryKeys } from "@/constants/query-keys";
import { getApiErrorMessage } from "@/lib/axios";
import {
  archiveBranch,
  createBranch,
  fetchBranch,
  fetchBranches,
  restoreBranch,
  updateBranch,
  updateBranchStatus,
} from "@/services/branch.service";
import type {
  BranchListFilters,
  BranchStatus,
  CreateBranchPayload,
  UpdateBranchPayload,
} from "@/lib/branch-types";

export function useBranches(shopId: number, filters?: Partial<BranchListFilters>) {
  return useQuery({
    queryKey: [...queryKeys.branches.list(shopId), filters ?? {}],
    queryFn: () => fetchBranches(shopId, filters),
    staleTime: 30_000,
  });
}

export function useBranch(uuid: string) {
  const shopId = APP_CONFIG.defaultShopId;
  return useQuery({
    queryKey: queryKeys.branches.detail(uuid),
    queryFn: () => fetchBranch(shopId, uuid),
    enabled: Boolean(uuid),
    staleTime: 15_000,
  });
}

export function useCreateBranch(shopId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<CreateBranchPayload, "shopId">) =>
      createBranch({ ...payload, shopId }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.branches.all });
      toast.success(`Branch "${data.name}" created`);
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Failed to create branch")),
  });
}

export function useUpdateBranch(shopId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ uuid, payload }: { uuid: string; payload: UpdateBranchPayload }) =>
      updateBranch(shopId, uuid, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.branches.all });
      toast.success(`Branch "${data.name}" updated`);
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Failed to update branch")),
  });
}

export function useUpdateBranchStatus(shopId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      uuid,
      status,
      currentStatus,
    }: {
      uuid: string;
      status: BranchStatus;
      currentStatus?: BranchStatus;
    }) => updateBranchStatus(shopId, uuid, status, currentStatus),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.branches.all });
      toast.success(`Branch status set to ${data.status}`);
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Failed to update branch status")),
  });
}

export function useArchiveBranch(shopId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) => archiveBranch(shopId, uuid),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.branches.all });
      toast.success(`Branch "${data.name}" archived`);
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Failed to archive branch")),
  });
}

export function useRestoreBranch(shopId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) => restoreBranch(shopId, uuid),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.branches.all });
      toast.success(`Branch "${data.name}" restored`);
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Failed to restore branch")),
  });
}
