"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { fetchInventoryCounts } from "@/services/inventory-count.service";

export function useInventoryCounts(shopId: number) {
  return useQuery({
    queryKey: queryKeys.inventoryCounts.list(shopId),
    queryFn: () => fetchInventoryCounts(shopId),
    staleTime: 5 * 60 * 1000,
  });
}
