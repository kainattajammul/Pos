"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import {
  createBranch,
  fetchBranch,
  fetchBranches,
  removeBranch,
  updateBranch,
  updateBranchStatus,
} from "@/services/branch.service";
import type {
  BranchStatus,
  CreateBranchPayload,
  UpdateBranchPayload,
} from "@/lib/branch-types";

export function useBranches(shopId: number) {
  return useQuery({
    queryKey: queryKeys.branches.list(shopId),
    queryFn: () => fetchBranches(shopId),
    staleTime: 30_000,
  });
}

export function useBranch(id: number) {
  return useQuery({
    queryKey: queryKeys.branches.detail(id),
    queryFn: () => fetchBranch(id),
    enabled: Number.isFinite(id) && id > 0,
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
    onError: () => toast.error("Failed to create branch"),
  });
}

export function useUpdateBranch(shopId: number) {
  void shopId;
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateBranchPayload }) =>
      updateBranch(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.branches.all });
      toast.success(`Branch "${data.name}" updated`);
    },
    onError: () => toast.error("Failed to update branch"),
  });
}

export function useUpdateBranchStatus(shopId: number) {
  void shopId;
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: BranchStatus }) =>
      updateBranchStatus(id, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.branches.all });
      toast.success(`Branch status set to ${data.status}`);
    },
    onError: () => toast.error("Failed to update branch status"),
  });
}

export function useDeleteBranch(shopId: number) {
  void shopId;
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => removeBranch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.branches.all });
      toast.success("Branch removed");
    },
    onError: () => toast.error("Failed to remove branch"),
  });
}
