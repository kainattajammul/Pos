import type { ActivityLogEntry } from "@/lib/activity-log-types";

const STORAGE_KEY = "repair-pos-activity-log-v1";
const MAX_ENTRIES = 200;

function readStore(): ActivityLogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ActivityLogEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStore(entries: ActivityLogEntry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
}

export function readStoredActivityLog(): ActivityLogEntry[] {
  return readStore().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function appendActivityLog(
  entry: Omit<ActivityLogEntry, "id" | "createdAt"> & { createdAt?: string },
) {
  const next: ActivityLogEntry = {
    ...entry,
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: entry.createdAt ?? new Date().toISOString(),
  };
  writeStore([next, ...readStore()]);
  return next;
}
