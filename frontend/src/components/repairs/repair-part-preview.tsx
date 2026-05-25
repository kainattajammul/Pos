"use client";

import Image from "next/image";
import type { RepairPartImageVariant } from "@/lib/repairs-parts-data";
import { cn } from "@/lib/utils";

const PART_IMAGES: Record<RepairPartImageVariant, string> = {
  screen: "/images/parts/screen.svg",
  "oled-assembly": "/images/parts/oled-assembly.svg",
  "oled-frame": "/images/parts/oled-frame.svg",
  battery: "/images/parts/battery.svg",
  "home-button": "/images/parts/home-button.svg",
  "digitizer-white": "/images/parts/digitizer-white.svg",
  "digitizer-black": "/images/parts/digitizer-black.svg",
};

interface RepairPartPreviewProps {
  variant: RepairPartImageVariant;
  className?: string;
}

export function RepairPartPreview({ variant, className }: RepairPartPreviewProps) {
  const src = PART_IMAGES[variant] ?? PART_IMAGES.screen;

  return (
    <div
      className={cn(
        "flex h-[72px] w-full items-center justify-center bg-[#F9FAFB] px-2",
        className,
      )}
    >
      <Image
        src={src}
        alt=""
        width={64}
        height={72}
        className="max-h-[64px] w-auto object-contain"
        unoptimized
      />
    </div>
  );
}
