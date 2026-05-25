"use client";

import { useState } from "react";
import { getManufacturerBrandLogoUrl } from "@/lib/repair-manufacturer-brands";
import { cn } from "@/lib/utils";

interface ManufacturerBrandMarkProps {
  name: string;
  logoSlug?: string;
  className?: string;
  /** Larger display for manufacturer cards */
  size?: "sm" | "md";
}

/** Brand logo via simple-icons CDN; falls back to initials. */
export function ManufacturerBrandMark({
  name,
  logoSlug,
  className,
  size = "md",
}: ManufacturerBrandMarkProps) {
  const [failed, setFailed] = useState(false);
  const initials = name
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 2)
    .toUpperCase();

  const boxClass =
    size === "sm"
      ? "flex size-8 items-center justify-center"
      : "flex h-12 w-full items-center justify-center px-2";

  const imgClass =
    size === "sm"
      ? "max-h-6 max-w-[28px] object-contain"
      : "max-h-10 max-w-[72px] object-contain";

  if (logoSlug && !failed) {
    return (
      <div className={cn(boxClass, className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getManufacturerBrandLogoUrl(logoSlug)}
          alt=""
          className={cn(imgClass, "opacity-90 dark:invert")}
          onError={() => setFailed(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-lg bg-[#F3F4F6] font-bold text-[#374151]",
        size === "sm" ? "size-8 text-xs" : "size-12 text-sm",
        className,
      )}
    >
      {initials}
    </div>
  );
}
