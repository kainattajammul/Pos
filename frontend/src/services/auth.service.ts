import { apiClient } from "@/lib/axios";
import type {
  ApiSuccessResponse,
  AuthUser,
  BackendLoginData,
  LoginPayload,
  LoginResponse,
} from "@/types/api";

function normalizeUser(user: AuthUser & { firstName?: string; lastName?: string }): AuthUser {
  if (user.name) return user;
  const parts = [user.firstName, user.lastName].filter(Boolean);
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    name: parts.length > 0 ? parts.join(" ") : user.email.split("@")[0] ?? "User",
  };
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await apiClient.post<ApiSuccessResponse<BackendLoginData>>(
    "/auth/login",
    payload,
  );
  return {
    accessToken: data.data.accessToken,
    user: normalizeUser(data.data.user as AuthUser & { firstName?: string; lastName?: string }),
  };
}

export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout");
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  const { data } = await apiClient.get<ApiSuccessResponse<AuthUser>>("/auth/me");
  return normalizeUser(data.data as AuthUser & { firstName?: string; lastName?: string });
}
