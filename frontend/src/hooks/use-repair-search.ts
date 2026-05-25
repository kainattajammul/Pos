"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { searchRepairs } from "@/services/repair-search.service";

export function useRepairSearch(shopId: number, query: string, enabled = true) {
  const trimmed = query.trim().replace(/\s+/g, " ");
  const shouldSearch = enabled && trimmed.length > 0;

  return useQuery({
    queryKey: queryKeys.repairSearch.query(shopId, trimmed),
    queryFn: () => searchRepairs(shopId, trimmed),
    enabled: shouldSearch,
    staleTime: 30_000,
  });
}
