import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { APP_CONFIG } from "@/constants/config";
import type { ApiErrorResponse, ApiSuccessResponse } from "@/types/api";
import { clearSession, persistSession, readSession } from "./auth-session";

let refreshPromise: Promise<string | null> | null = null;

export const apiClient = axios.create({
  baseURL: APP_CONFIG.apiUrl,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const session = readSession();
  if (session?.accessToken && !session.accessToken.startsWith("mock-")) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    const session = readSession();
    if (!session?.accessToken || session.accessToken.startsWith("mock-")) {
      return Promise.reject(error);
    }

    original._retry = true;

    if (!refreshPromise) {
      refreshPromise = apiClient
        .post<ApiSuccessResponse<{ accessToken: string }>>(
          "/auth/refresh",
          session.refreshToken ? { refreshToken: session.refreshToken } : {},
        )
        .then((res) => {
          const accessToken = res.data.data.accessToken;
          persistSession({
            accessToken,
            user: session.user,
            refreshToken: session.refreshToken,
          });
          return accessToken;
        })
        .catch(() => {
          clearSession();
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          return null;
        })
        .finally(() => {
          refreshPromise = null;
        });
    }

    const token = await refreshPromise;
    if (!token) return Promise.reject(error);

    original.headers.Authorization = `Bearer ${token}`;
    return apiClient(original);
  },
);

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    if (data?.message) return data.message;
    if (data?.error?.message) return data.error.message;
    if (error.response?.status === 500) {
      return "Server error — ensure the POS backend is running on the correct port.";
    }
    if (error.code === "ERR_NETWORK") {
      return `Cannot reach API at ${APP_CONFIG.apiUrl} — start the backend (port 4000) or use mock login on /login.`;
    }
    return error.message || fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
