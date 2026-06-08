"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { useAuth } from "@/hooks/use-auth";
import { fetchMyProfile } from "@/services/user-profile.service";

export function useMyProfile() {
  const { user, hydrated, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.profile.me(user?.id ?? "anonymous"),
    queryFn: () => fetchMyProfile(user),
    enabled: hydrated && isAuthenticated && Boolean(user),
  });
}
