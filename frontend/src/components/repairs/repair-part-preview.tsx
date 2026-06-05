"use client";

import Image from "next/image";
import type { RepairPartImageVariant } from "@/lib/repairs-parts-data";
import { cn } from "@/lib/utils";

const PART_IMAGES: Record<RepairPartImageVariant, string> = {
  screen: "/images/parts/screen.svg",
  "lcd-panel": "/images/parts/lcd-panel.svg",
  "oled-assembly": "/images/parts/oled-assembly.svg",
  "oled-frame": "/images/parts/oled-frame.svg",
  "touch-panel": "/images/parts/touch-panel.svg",
  "digitizer-white": "/images/parts/digitizer-white.svg",
  "digitizer-black": "/images/parts/digitizer-black.svg",
  battery: "/images/parts/battery.svg",
  "charging-port": "/images/parts/charging-port.svg",
  "charging-flex": "/images/parts/charging-flex.svg",
  "home-button": "/images/parts/home-button.svg",
  "power-button": "/images/parts/power-button.svg",
  "volume-button": "/images/parts/volume-button.svg",
  speaker: "/images/parts/speaker.svg",
  earpiece: "/images/parts/earpiece.svg",
  microphone: "/images/parts/microphone.svg",
  vibrator: "/images/parts/vibrator.svg",
  "camera-front": "/images/parts/camera-front.svg",
  "camera-rear": "/images/parts/camera-rear.svg",
  "proximity-sensor": "/images/parts/proximity-sensor.svg",
  "sim-tray": "/images/parts/sim-tray.svg",
  "back-glass": "/images/parts/back-glass.svg",
  midframe: "/images/parts/midframe.svg",
  "flex-cable": "/images/parts/flex-cable.svg",
  antenna: "/images/parts/antenna.svg",
  "wifi-module": "/images/parts/wifi-module.svg",
  "logic-board": "/images/parts/logic-board.svg",
  "screw-kit": "/images/parts/screw-kit.svg",
  adhesive: "/images/parts/adhesive.svg",
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
        "flex h-[72px] w-full items-center justify-center bg-pos-page px-2",
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
