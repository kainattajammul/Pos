import type { RepairManufacturer } from "@/lib/repairs-pos-data";

export const SERIES_MODE_BY_MANUFACTURER_KEY = "repairs-series-mode-by-manufacturer";

export type SeriesModeByManufacturer = Record<string, boolean>;

const LEGACY_SERIES_MODE_KEY = "repairs-series-mode-enabled";

export function getManufacturerSeriesModeKey(
  manufacturer: RepairManufacturer,
): string {
  if (manufacturer.dbId != null) return `db:${manufacturer.dbId}`;
  return `slug:${manufacturer.id}`;
}

export function readSeriesModeByManufacturer(): SeriesModeByManufacturer {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(SERIES_MODE_BY_MANUFACTURER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as SeriesModeByManufacturer;
      if (parsed && typeof parsed === "object") return parsed;
    }
  } catch {
    // ignore corrupt storage
  }

  return {};
}

export function writeSeriesModeByManufacturer(map: SeriesModeByManufacturer): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SERIES_MODE_BY_MANUFACTURER_KEY, JSON.stringify(map));
  window.localStorage.removeItem(LEGACY_SERIES_MODE_KEY);
}

export function isSeriesModeEnabledForManufacturer(
  map: SeriesModeByManufacturer,
  manufacturer: RepairManufacturer | null | undefined,
): boolean {
  if (!manufacturer || manufacturer.isAdd) return false;
  return map[getManufacturerSeriesModeKey(manufacturer)] === true;
}
