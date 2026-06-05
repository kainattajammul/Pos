"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { fetchBillPayments } from "@/services/bill-payments.service";

export function useBillPayments(shopId: number) {
  return useQuery({
    queryKey: queryKeys.billPayments.list(shopId),
    queryFn: () => fetchBillPayments(shopId),
    staleTime: 5 * 60 * 1000,
  });
}
