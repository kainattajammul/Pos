"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { useRepairsTheme } from "@/context/repairs-theme-context";
import { cn } from "@/lib/utils";

export function RepairsSideToolbar() {
  const colorInputRef = useRef<HTMLInputElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const {
    swatches,
    activeSwatchId,
    selectSwatch,
    addCustomColor,
    removeCustomSwatch,
  } = useRepairsTheme();

  // Native `change` fires when the user commits a color in the picker.
  // React `onChange` maps to `input` and fires on every hover/drag in the RGB UI.
  useEffect(() => {
    const input = colorInputRef.current;
    if (!input) return;

    const handleCommit = () => {
      addCustomColor(input.value);
    };

    input.addEventListener("change", handleCommit);
    return () => input.removeEventListener("change", handleCommit);
  }, [addCustomColor]);

  return (
    <aside
      className="hidden w-11 shrink-0 flex-col items-center gap-2 overflow-y-auto border-l border-[#E5E7EB] bg-white py-3 xl:flex"
      aria-label="Theme colors"
    >
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
              className="size-6 rounded-sm shadow-sm ring-1 ring-black/10 transition-transform hover:scale-110"
              style={{
                backgroundColor: swatch.color,
                boxShadow: isActive
                  ? `0 0 0 2px #fff, 0 0 0 4px ${swatch.color}`
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
        defaultValue="#F97316"
        aria-hidden
        tabIndex={-1}
      />

      <div className="mt-auto pt-1">
        <button
          type="button"
          onClick={() => colorInputRef.current?.click()}
          className="flex size-7 items-center justify-center rounded border border-[#E5E7EB] text-[#6B7280] transition-colors hover:border-[var(--repair-primary)] hover:text-[var(--repair-primary)]"
          aria-label="Add custom color"
          title="Add custom color"
        >
          <Plus className="size-4" />
        </button>
      </div>
    </aside>
  );
}
