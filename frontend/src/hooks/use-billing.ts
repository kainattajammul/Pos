"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { fetchBillingInvoices, fetchBillingSummary } from "@/services/billing.service";

export function useBillingSummary(companyName?: string) {
  return useQuery({
    queryKey: queryKeys.billing.summary(companyName ?? "default"),
    queryFn: () => fetchBillingSummary(companyName),
    staleTime: 60_000,
  });
}

export function useBillingInvoices() {
  return useQuery({
    queryKey: queryKeys.billing.invoices(),
    queryFn: fetchBillingInvoices,
    staleTime: 60_000,
  });
}
