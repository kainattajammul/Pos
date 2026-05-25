import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";

function toPascalCase(iconKey: string): string {
  return iconKey
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

/** Resolves a stored icon key to a Lucide component (falls back to Wrench). */
export function resolveRepairCategoryIcon(iconKey: string): LucideIcon {
  const pascal = toPascalCase(iconKey || "wrench");
  const icon = (LucideIcons as Record<string, LucideIcon | undefined>)[pascal];
  return icon ?? LucideIcons.Wrench;
}
