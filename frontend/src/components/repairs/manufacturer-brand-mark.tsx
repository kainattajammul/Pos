"use client";

import { cn } from "@/lib/utils";

interface ManufacturerBrandMarkProps {
  name: string;
  logoSlug?: string;
  className?: string;
}

/** Brand logo via simple-icons CDN; falls back to initials. */
export function ManufacturerBrandMark({
  name,
  logoSlug,
  className,
}: ManufacturerBrandMarkProps) {
  const initials = name
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 2)
    .toUpperCase();

  if (logoSlug) {
    return (
      <div
        className={cn(
          "flex h-12 w-full items-center justify-center px-2",
          className,
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://cdn.jsdelivr.net/npm/simple-icons@11/icons/${logoSlug}.svg`}
          alt=""
          className="max-h-10 max-w-[72px] object-contain opacity-90"
          style={{ filter: "brightness(0)" }}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex size-12 items-center justify-center rounded-lg bg-[#F3F4F6] text-sm font-bold text-[#374151]",
        className,
      )}
    >
      {initials}
    </div>
  );
}
