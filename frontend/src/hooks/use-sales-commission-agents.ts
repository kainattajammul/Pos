"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { getApiErrorMessage } from "@/lib/axios";
import {
  createSalesCommissionAgent,
  deleteSalesCommissionAgent,
  fetchSalesCommissionAgent,
  fetchSalesCommissionAgents,
  updateSalesCommissionAgent,
} from "@/services/sales-commission-agents.service";
import type {
  CreateSalesCommissionAgentPayload,
  SalesCommissionAgentTableRow,
  UpdateSalesCommissionAgentPayload,
} from "@/types/sales-commission-agent";
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

export function useSalesCommissionAgents() {
  return useQuery({
    queryKey: queryKeys.salesCommissionAgents.list(),
    queryFn: fetchSalesCommissionAgents,
  });
}

export function useSalesCommissionAgent(id: number) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.salesCommissionAgents.detail(id),
    queryFn: async () => {
      try {
        return await fetchSalesCommissionAgent(id);
      } catch {
        const cached = queryClient.getQueryData<SalesCommissionAgentTableRow[]>(
          queryKeys.salesCommissionAgents.list(),
        );
        const fromList = cached?.find((a) => a.id === id);
        if (fromList) return fromList;
        throw new Error("Sales commission agent not found");
      }
    },
    enabled: Number.isFinite(id) && id > 0,
    initialData: () => {
      const cached = queryClient.getQueryData<SalesCommissionAgentTableRow[]>(
        queryKeys.salesCommissionAgents.list(),
      );
      return cached?.find((a) => a.id === id);
    },
    staleTime: 30_000,
  });
}

export function useCreateSalesCommissionAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSalesCommissionAgentPayload) =>
      createSalesCommissionAgent(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.salesCommissionAgents.all });
      toast.success(`Sales commission agent "${data.fullName}" created successfully`);
    },
    onError: (error) => {
      toast.error(
        getMutationErrorMessage(error, "Failed to create sales commission agent"),
      );
    },
  });
}

export function useUpdateSalesCommissionAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateSalesCommissionAgentPayload;
    }) => updateSalesCommissionAgent(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.salesCommissionAgents.all });
      toast.success(`Sales commission agent "${data.fullName}" updated successfully`);
    },
    onError: (error) => {
      toast.error(
        getMutationErrorMessage(error, "Failed to update sales commission agent"),
      );
    },
  });
}

export function useDeleteSalesCommissionAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteSalesCommissionAgent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.salesCommissionAgents.all });
      toast.success("Sales commission agent deleted successfully");
    },
    onError: (error) => {
      toast.error(
        getMutationErrorMessage(error, "Failed to delete sales commission agent"),
      );
    },
  });
}
