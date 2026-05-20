import { AUTH_STORAGE_KEY } from "@/constants/config";
import type { AuthUser } from "@/types/api";

export interface StoredSession {
  user: AuthUser;
  accessToken: string;
  /** Present for mock mode; production refresh uses httpOnly cookie. */
  refreshToken?: string;
}

export const mockSession: StoredSession = {
  user: {
    id: "mock-admin",
    email: "admin@repairshop.local",
    role: "ADMIN",
    name: "Admin User",
  },
  accessToken: "mock-access-token",
  refreshToken: "mock-refresh-token",
};

export function persistSession(session: StoredSession) {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function readSession(): StoredSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSession;
    if (parsed.user && parsed.accessToken) return parsed;
    return null;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_STORAGE_KEY);
}
