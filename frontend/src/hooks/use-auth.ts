"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { clearSession, persistSession } from "@/lib/auth-session";
import { getApiErrorMessage } from "@/lib/axios";
import { login as loginRequest, logout as logoutRequest } from "@/services/auth.service";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout as logoutAction, setUser } from "@/store/auth-slice";
import type { LoginPayload } from "@/types/api";

export function useAuth() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, hydrated } = useAppSelector((s) => s.auth);

  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => loginRequest(payload),
    onSuccess: (data) => {
      persistSession({
        user: data.user,
        accessToken: data.accessToken,
      });
      dispatch(setUser(data.user));
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      toast.success("Welcome back!");
      router.push("/dashboard");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Login failed"));
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logoutRequest,
    onSettled: () => {
      clearSession();
      dispatch(logoutAction());
      queryClient.clear();
      router.push("/login");
    },
  });

  return {
    user,
    isAuthenticated,
    hydrated,
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    logout: () => logoutMutation.mutate(),
    isLoggingOut: logoutMutation.isPending,
  };
}

export function useAuthGuard() {
  const { isAuthenticated, hydrated } = useAppSelector((s) => s.auth);

  useQuery({
    queryKey: queryKeys.auth.me,
    enabled: false,
  });

  return { isAuthenticated, hydrated };
}
