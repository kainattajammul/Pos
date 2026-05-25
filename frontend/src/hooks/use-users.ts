"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { getApiErrorMessage } from "@/lib/axios";
import {
  createUser,
  deleteUser,
  fetchUser,
  fetchUsers,
  updateUser,
} from "@/services/users.service";
import type {
  CreateUserPayload,
  UpdateUserPayload,
  UserTableRow,
} from "@/types/user-table";
import type { ApiErrorResponse } from "@/types/api";
import { isAxiosError } from "axios";

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

export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users.list(),
    queryFn: fetchUsers,
  });
}

export function useUser(id: number) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: async () => {
      try {
        return await fetchUser(id);
      } catch {
        const cached = queryClient.getQueryData<UserTableRow[]>(queryKeys.users.list());
        const fromList = cached?.find((u) => u.id === id);
        if (fromList) return fromList;
        throw new Error("User not found");
      }
    },
    enabled: Number.isFinite(id) && id > 0,
    initialData: () => {
      const cached = queryClient.getQueryData<UserTableRow[]>(queryKeys.users.list());
      return cached?.find((u) => u.id === id);
    },
    staleTime: 30_000,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserPayload) => createUser(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success(`User "${data.fullName}" created successfully`);
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, "Failed to create user"));
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateUserPayload }) =>
      updateUser(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success(`User "${data.fullName}" updated successfully`);
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, "Failed to update user"));
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success("User deleted successfully");
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, "Failed to delete user"));
    },
  });
}
