"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { getApiErrorMessage } from "@/lib/axios";
import {
  createCustomer,
  deleteCustomer,
  fetchCustomers,
  updateCustomer,
} from "@/services/customers.service";
import type {
  CreateCustomerPayload,
  UpdateCustomerPayload,
} from "@/types/customer-table";

export function useCustomers(enabled = true) {
  return useQuery({
    queryKey: queryKeys.customers.list(),
    queryFn: fetchCustomers,
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCustomerPayload) => createCustomer(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      toast.success(`Customer "${data.displayName}" created successfully`);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to create customer"));
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateCustomerPayload }) =>
      updateCustomer(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      toast.success(`Customer "${data.displayName}" updated successfully`);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to update customer"));
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      toast.success("Customer deleted successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to delete customer"));
    },
  });
}
