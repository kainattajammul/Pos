"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { useAppTheme } from "@/context/app-theme-context";
import { DEFAULT_THEME_SWATCHES } from "@/lib/app-theme";
import { cn } from "@/lib/utils";

type ThemeColorPickerLayout = "vertical" | "horizontal" | "compact";

interface ThemeColorPickerProps {
  layout?: ThemeColorPickerLayout;
  className?: string;
  showLabel?: boolean;
}

export function ThemeColorPicker({
  layout = "vertical",
  className,
  showLabel = false,
}: ThemeColorPickerProps) {
  const colorInputRef = useRef<HTMLInputElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const {
    swatches,
    activeSwatchId,
    selectSwatch,
    addCustomColor,
    removeCustomSwatch,
  } = useAppTheme();

  useEffect(() => {
    const input = colorInputRef.current;
    if (!input) return;

    const handleCommit = () => {
      addCustomColor(input.value);
    };

    input.addEventListener("change", handleCommit);
    return () => input.removeEventListener("change", handleCommit);
  }, [addCustomColor]);

  const defaultColor =
    swatches.find((s) => s.id === activeSwatchId)?.color ??
    DEFAULT_THEME_SWATCHES[0].color;

  return (
    <div
      className={cn(
        layout === "vertical" && "flex flex-col items-center gap-2",
        layout === "horizontal" && "flex flex-wrap items-center gap-2",
        layout === "compact" && "grid grid-cols-5 gap-1.5",
        className,
      )}
      aria-label="Theme colors"
    >
      {showLabel ? (
        <p
          className={cn(
            "text-xs font-medium text-muted-foreground",
            layout === "vertical" ? "w-full text-center" : "w-full",
          )}
        >
          Theme
        </p>
      ) : null}

      {swatches.map((swatch) => {
        const isActive = swatch.id === activeSwatchId;
        const showRemove = swatch.isCustom && hoveredId === swatch.id;

        return (
          <div
            key={swatch.id}
            className="relative"
            onMouseEnter={() => setHoveredId(swatch.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <button
              type="button"
              title={swatch.name}
              onClick={() => selectSwatch(swatch.id)}
              className={cn(
                "rounded-sm shadow-sm ring-1 ring-black/10 transition-transform hover:scale-110",
                layout === "compact" ? "size-5" : "size-6",
              )}
              style={{
                backgroundColor: swatch.color,
                boxShadow: isActive
                  ? `0 0 0 2px #fff, 0 0 0 3px ${swatch.color}`
                  : undefined,
              }}
              aria-label={`Apply ${swatch.name} theme`}
              aria-pressed={isActive}
            />
            {showRemove ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeCustomSwatch(swatch.id);
                }}
                className="absolute -top-1 -right-1 flex size-3.5 items-center justify-center rounded-full bg-neutral-800 text-white shadow"
                aria-label={`Remove ${swatch.name}`}
              >
                <X className="size-2.5" />
              </button>
            ) : null}
          </div>
        );
      })}

      <input
        ref={colorInputRef}
        type="color"
        className="sr-only"
        defaultValue={defaultColor}
        aria-hidden
        tabIndex={-1}
      />

      <button
        type="button"
        onClick={() => colorInputRef.current?.click()}
        className={cn(
          "flex items-center justify-center rounded border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary",
          layout === "compact" ? "size-5" : "size-7",
          layout === "vertical" && "mt-auto",
        )}
        aria-label="Add custom color"
        title="Add custom color"
      >
        <Plus className={layout === "compact" ? "size-3" : "size-4"} />
      </button>
    </div>
  );
}
