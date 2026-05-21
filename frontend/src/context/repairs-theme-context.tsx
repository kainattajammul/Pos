"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  buildThemeFromColor,
  DEFAULT_THEME_SWATCHES,
  findSwatch,
  getAllSwatches,
  loadStoredThemeState,
  parseHex,
  saveStoredThemeState,
  themeToCssVariables,
  type RepairsTheme,
  type ThemeSwatch,
} from "@/lib/repairs-theme";

interface RepairsThemeContextValue {
  theme: RepairsTheme;
  cssVariables: React.CSSProperties;
  swatches: ThemeSwatch[];
  activeSwatchId: string;
  selectSwatch: (id: string) => void;
  addCustomColor: (hex: string) => void;
  removeCustomSwatch: (id: string) => void;
}

const RepairsThemeContext = createContext<RepairsThemeContextValue | null>(null);

const INITIAL_STORED = {
  activeId: DEFAULT_THEME_SWATCHES[0].id,
  customSwatches: [] as ThemeSwatch[],
};

export function RepairsThemeProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useState(INITIAL_STORED);

  useEffect(() => {
    setStored(loadStoredThemeState());
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

  const cssVariables = useMemo(() => themeToCssVariables(theme), [theme]);

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
    <RepairsThemeContext.Provider value={value}>{children}</RepairsThemeContext.Provider>
  );
}

export function useRepairsTheme() {
  const ctx = useContext(RepairsThemeContext);
  if (!ctx) {
    throw new Error("useRepairsTheme must be used within RepairsThemeProvider");
  }
  return ctx;
}
