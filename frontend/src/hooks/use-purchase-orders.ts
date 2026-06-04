"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { fetchPurchaseOrders } from "@/services/purchase-order.service";

export function usePurchaseOrders(shopId: number) {
  return useQuery({
    queryKey: queryKeys.purchaseOrders.list(shopId),
    queryFn: () => fetchPurchaseOrders(shopId),
    staleTime: 5 * 60 * 1000,
  });
}
