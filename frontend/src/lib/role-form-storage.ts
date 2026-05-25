import { createEmptyPermissionState } from "@/lib/role-permissions";

const STORAGE_KEY = "repair-pos-role-profiles-v1";

export interface StoredRoleProfile {
  permissions: Record<string, boolean>;
}

type ProfileStore = Record<string, StoredRoleProfile>;

function readStore(): ProfileStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as ProfileStore;
  } catch {
    return {};
  }
}

function writeStore(store: ProfileStore) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function loadRoleProfile(roleId: number): StoredRoleProfile | null {
  const store = readStore();
  const entry = store[String(roleId)];
  if (!entry) return null;
  return {
    permissions: { ...createEmptyPermissionState(), ...entry.permissions },
  };
}

export function saveRoleProfile(roleId: number, permissions: Record<string, boolean>) {
  const store = readStore();
  store[String(roleId)] = { permissions };
  writeStore(store);
}
