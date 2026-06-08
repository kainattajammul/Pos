"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { useAuth } from "@/hooks/use-auth";
import { fetchActivityLog } from "@/services/transaction-log.service";

export function useTransactionLog(scope: "mine" | "all" = "all") {
  const { user, hydrated, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.transactionLog.list(scope, user?.id ?? "anonymous"),
    queryFn: () => {
      if (!user) return Promise.resolve([]);
      return fetchActivityLog({ user, scope });
    },
    enabled: hydrated && isAuthenticated && Boolean(user),
  });
}
