import type { UserFormValues } from "@/lib/add-user-form";

const STORAGE_KEY = "repair-pos-user-profiles-v1";

type ProfileStore = Record<string, Partial<UserFormValues>>;

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

/** Persists UI-only profile fields until the API supports them. */
export function loadUserProfileExtras(userId: number): Partial<UserFormValues> | null {
  const store = readStore();
  const entry = store[String(userId)];
  return entry ?? null;
}

export function saveUserProfileExtras(userId: number, values: UserFormValues) {
  const store = readStore();
  const safe = { ...values, password: "", confirmPassword: "", accessPin: "" };
  store[String(userId)] = safe;
  writeStore(store);
}
