export interface RepairsTheme {
  id: string;
  name: string;
  primary: string;
  primaryDark: string;
  primaryDarker: string;
  primaryLight: string;
  primaryLightText: string;
  accent: string;
  accentEnd: string;
  onPrimary: string;
}

export interface ThemeSwatch {
  id: string;
  color: string;
  name: string;
  isCustom?: boolean;
}

export const DEFAULT_THEME_SWATCHES: ThemeSwatch[] = [
  { id: "orange", color: "#F97316", name: "Orange" },
  { id: "purple", color: "#8B5CF6", name: "Purple" },
  { id: "red", color: "#EF4444", name: "Red" },
  { id: "teal", color: "#14B8A6", name: "Teal" },
  { id: "blue", color: "#3B82F6", name: "Blue" },
];

const STORAGE_KEY = "repairs-pos-theme-v1";

interface StoredThemeState {
  activeId: string;
  customSwatches: ThemeSwatch[];
}

function clamp(n: number) {
  return Math.max(0, Math.min(255, Math.round(n)));
}

export function parseHex(hex: string): { r: number; g: number; b: number } | null {
  const raw = hex.replace("#", "").trim();
  if (!/^[0-9A-Fa-f]{6}$/.test(raw)) return null;
  return {
    r: parseInt(raw.slice(0, 2), 16),
    g: parseInt(raw.slice(2, 4), 16),
    b: parseInt(raw.slice(4, 6), 16),
  };
}

export function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b].map((c) => clamp(c).toString(16).padStart(2, "0")).join("")}`;
}

export function mixHex(hex: string, amount: number, target: "white" | "black") {
  const rgb = parseHex(hex);
  if (!rgb) return hex;
  const t = target === "white" ? 255 : 0;
  return rgbToHex(
    rgb.r + (t - rgb.r) * amount,
    rgb.g + (t - rgb.g) * amount,
    rgb.b + (t - rgb.b) * amount,
  );
}

/** Builds a full theme palette from a single brand hex color. */
export function buildThemeFromColor(hex: string, id: string, name: string): RepairsTheme {
  const primary = parseHex(hex) ? hex.toUpperCase() : "#F97316";
  return {
    id,
    name,
    primary,
    primaryDark: mixHex(primary, 0.35, "black"),
    primaryDarker: mixHex(primary, 0.55, "black"),
    primaryLight: mixHex(primary, 0.88, "white"),
    primaryLightText: mixHex(primary, 0.45, "black"),
    accent: mixHex(primary, 0.15, "white"),
    accentEnd: mixHex(primary, 0.28, "black"),
    onPrimary: "#FFFFFF",
  };
}

export function themeToCssVariables(theme: RepairsTheme): Record<string, string> {
  return {
    "--repair-primary": theme.primary,
    "--repair-primary-dark": theme.primaryDark,
    "--repair-primary-darker": theme.primaryDarker,
    "--repair-primary-light": theme.primaryLight,
    "--repair-primary-light-text": theme.primaryLightText,
    "--repair-accent": theme.accent,
    "--repair-accent-end": theme.accentEnd,
    "--repair-on-primary": theme.onPrimary,
  };
}

export function loadStoredThemeState(): StoredThemeState {
  if (typeof window === "undefined") {
    return { activeId: DEFAULT_THEME_SWATCHES[0].id, customSwatches: [] };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { activeId: DEFAULT_THEME_SWATCHES[0].id, customSwatches: [] };
    const parsed = JSON.parse(raw) as StoredThemeState;
    return {
      activeId: parsed.activeId ?? DEFAULT_THEME_SWATCHES[0].id,
      customSwatches: Array.isArray(parsed.customSwatches) ? parsed.customSwatches : [],
    };
  } catch {
    return { activeId: DEFAULT_THEME_SWATCHES[0].id, customSwatches: [] };
  }
}

export function saveStoredThemeState(state: StoredThemeState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function getAllSwatches(customSwatches: ThemeSwatch[]): ThemeSwatch[] {
  return [...DEFAULT_THEME_SWATCHES, ...customSwatches];
}

export function findSwatch(
  id: string,
  customSwatches: ThemeSwatch[],
): ThemeSwatch | undefined {
  return getAllSwatches(customSwatches).find((s) => s.id === id);
}
