"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { fetchRefurbishmentBatches } from "@/services/refurbishment-batch.service";

export function useRefurbishmentBatches(shopId: number) {
  return useQuery({
    queryKey: queryKeys.refurbishmentBatches.list(shopId),
    queryFn: () => fetchRefurbishmentBatches(shopId),
    staleTime: 5 * 60 * 1000,
  });
}
