export interface AppTheme {
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

/** @deprecated Use AppTheme */
export type RepairsTheme = AppTheme;

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

const STORAGE_KEY = "app-theme-v1";
const LEGACY_STORAGE_KEY = "repairs-pos-theme-v1";

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

export function buildThemeFromColor(hex: string, id: string, name: string): AppTheme {
  const primary = parseHex(hex) ? hex.toUpperCase() : DEFAULT_THEME_SWATCHES[0].color;
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

/** CSS variables for repairs POS + global shadcn/Tailwind tokens. */
export function themeToCssVariables(
  theme: AppTheme,
  options?: { isDark?: boolean },
): Record<string, string> {
  const isDark = options?.isDark ?? false;
  const accentMuted = isDark
    ? "rgba(255, 255, 255, 0.08)"
    : mixHex(theme.primary, 0.92, "white");

  return {
    "--repair-primary": theme.primary,
    "--repair-primary-dark": theme.primaryDark,
    "--repair-primary-darker": theme.primaryDarker,
    "--repair-primary-light": theme.primaryLight,
    "--repair-primary-light-text": theme.primaryLightText,
    "--repair-accent": theme.accent,
    "--repair-accent-end": theme.accentEnd,
    "--repair-on-primary": theme.onPrimary,
    "--primary": theme.primary,
    "--primary-foreground": theme.onPrimary,
    "--ring": theme.primary,
    "--sidebar-primary": theme.primary,
    "--sidebar-primary-foreground": theme.onPrimary,
    "--accent": accentMuted,
    "--chart-1": theme.primary,
    "--chart-2": theme.accent,
    "--chart-3": theme.primaryDark,
    "--chart-4": theme.accentEnd,
    "--chart-5": theme.primaryDarker,
  };
}

export function applyThemeCssVariables(
  theme: AppTheme,
  target: HTMLElement = document.documentElement,
  options?: { isDark?: boolean },
) {
  const isDark = options?.isDark ?? target.classList.contains("dark");
  const vars = themeToCssVariables(theme, { isDark });
  for (const [key, value] of Object.entries(vars)) {
    target.style.setProperty(key, value);
  }
}

export function loadStoredThemeState(): StoredThemeState {
  if (typeof window === "undefined") {
    return { activeId: DEFAULT_THEME_SWATCHES[0].id, customSwatches: [] };
  }
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      raw = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (raw) {
        localStorage.setItem(STORAGE_KEY, raw);
        localStorage.removeItem(LEGACY_STORAGE_KEY);
      }
    }
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
