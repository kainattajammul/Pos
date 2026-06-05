"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import {
  fetchPosRegisters,
  startPosRegisterShift,
} from "@/services/pos-registers.service";

export function usePosRegisters(shopId: number) {
  return useQuery({
    queryKey: queryKeys.posRegisters.list(shopId),
    queryFn: () => fetchPosRegisters(shopId),
    staleTime: 60 * 1000,
  });
}

export function useStartPosRegisterShift(shopId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (registerId: string) => startPosRegisterShift(shopId, registerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posRegisters.list(shopId) });
    },
  });
}
