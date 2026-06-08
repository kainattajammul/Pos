"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useTheme } from "next-themes";
import {
  applyThemeCssVariables,
  buildThemeFromColor,
  DEFAULT_THEME_SWATCHES,
  findSwatch,
  getAllSwatches,
  loadStoredThemeState,
  parseHex,
  saveStoredThemeState,
  themeToCssVariables,
  type AppTheme,
  type ThemeSwatch,
} from "@/lib/app-theme";

interface AppThemeContextValue {
  theme: AppTheme;
  cssVariables: CSSProperties;
  swatches: ThemeSwatch[];
  activeSwatchId: string;
  selectSwatch: (id: string) => void;
  addCustomColor: (hex: string) => void;
  removeCustomSwatch: (id: string) => void;
}

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

const INITIAL_STORED = {
  activeId: DEFAULT_THEME_SWATCHES[0].id,
  customSwatches: [] as ThemeSwatch[],
};

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();
  const [stored, setStored] = useState(INITIAL_STORED);
  const [ready, setReady] = useState(false);
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    const loaded = loadStoredThemeState();
    setStored(loaded);
    setReady(true);
  }, []);

  const swatches = useMemo(
    () => getAllSwatches(stored.customSwatches),
    [stored.customSwatches],
  );

  const activeSwatch =
    findSwatch(stored.activeId, stored.customSwatches) ?? DEFAULT_THEME_SWATCHES[0];

  const theme = useMemo(
    () => buildThemeFromColor(activeSwatch.color, activeSwatch.id, activeSwatch.name),
    [activeSwatch],
  );

  const cssVariables = useMemo(
    () => themeToCssVariables(theme, { isDark }) as CSSProperties,
    [theme, isDark],
  );

  useEffect(() => {
    if (!ready) return;

    const root = document.documentElement;
    const apply = () => {
      applyThemeCssVariables(theme, root, {
        isDark: root.classList.contains("dark"),
      });
    };

    apply();

    const observer = new MutationObserver(apply);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, [theme, ready]);

  const persist = useCallback((next: typeof stored) => {
    setStored(next);
    saveStoredThemeState(next);
  }, []);

  const selectSwatch = useCallback(
    (id: string) => {
      if (!findSwatch(id, stored.customSwatches)) return;
      persist({ ...stored, activeId: id });
    },
    [persist, stored],
  );

  const addCustomColor = useCallback(
    (hex: string) => {
      const normalized = parseHex(hex) ? hex.toUpperCase() : null;
      if (!normalized) return;
      const id = `custom-${Date.now()}`;
      const swatch: ThemeSwatch = {
        id,
        color: normalized,
        name: "Custom",
        isCustom: true,
      };
      persist({
        activeId: id,
        customSwatches: [...stored.customSwatches, swatch],
      });
    },
    [persist, stored.customSwatches],
  );

  const removeCustomSwatch = useCallback(
    (id: string) => {
      const nextCustom = stored.customSwatches.filter((s) => s.id !== id);
      const nextActive =
        stored.activeId === id
          ? (nextCustom[0]?.id ?? DEFAULT_THEME_SWATCHES[0].id)
          : stored.activeId;
      persist({ activeId: nextActive, customSwatches: nextCustom });
    },
    [persist, stored.activeId, stored.customSwatches],
  );

  const value = useMemo(
    () => ({
      theme,
      cssVariables,
      swatches,
      activeSwatchId: stored.activeId,
      selectSwatch,
      addCustomColor,
      removeCustomSwatch,
    }),
    [
      theme,
      cssVariables,
      swatches,
      stored.activeId,
      selectSwatch,
      addCustomColor,
      removeCustomSwatch,
    ],
  );

  return (
    <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>
  );
}

export function useAppTheme() {
  const ctx = useContext(AppThemeContext);
  if (!ctx) {
    throw new Error("useAppTheme must be used within AppThemeProvider");
  }
  return ctx;
}
