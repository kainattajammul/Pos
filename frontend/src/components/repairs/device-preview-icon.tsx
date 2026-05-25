"use client";

import { cn } from "@/lib/utils";

export type DeviceIconVariant =
  | "mobile"
  | "tablet"
  | "laptop"
  | "desktop"
  | "drone"
  | "jewelry";

const DEVICE_IMAGES: Record<DeviceIconVariant, { src: string; className: string }> = {
  mobile: { src: "/images/devices/mobile.svg", className: "max-h-[68px] max-w-[42px]" },
  tablet: { src: "/images/devices/tablet.svg", className: "max-h-[52px] max-w-[56px]" },
  laptop: { src: "/images/devices/laptop.svg", className: "max-h-[48px] max-w-[64px]" },
  desktop: { src: "/images/devices/desktop.svg", className: "max-h-[50px] max-w-[52px]" },
  drone: { src: "/images/devices/drone.svg", className: "max-h-[44px] max-w-[64px]" },
  jewelry: { src: "/images/devices/jewelry.svg", className: "max-h-[48px] max-w-[44px]" },
};

interface DevicePreviewIconProps {
  deviceName: string;
  categoryId?: string | null;
  className?: string;
}

function isDesktopComputer(name: string) {
  return /iMac|Mac mini|Mac Studio|Mac Pro|Desktop|AIO|All-in-One|Chromebox|Tower|ThinkCentre/i.test(
    name,
  );
}

function isLaptopComputer(name: string) {
  return /MacBook|Laptop|Book|gram|Zenbook|ThinkPad|XPS|Spectre|Envy|OMEN|EliteBook|Swift|Predator|Aspire|Blade|Stealth|Raider|Creator|VAIO|MateBook|Chromebook/i.test(
    name,
  );
}

/** Pick device picture from repair category (laptop vs desktop for computer repair). */
export function resolveDeviceIconVariant(
  categoryId: string | null | undefined,
  deviceName: string,
): DeviceIconVariant {
  const id = (categoryId ?? "").toLowerCase();

  if (id === "tablet") return "tablet";
  if (id === "drone") return "drone";
  if (id === "jewelry") return "jewelry";
  if (id === "computer") {
    if (isDesktopComputer(deviceName)) return "desktop";
    if (isLaptopComputer(deviceName)) return "laptop";
    return /mini|Studio|Mac Pro|Tower/i.test(deviceName) ? "desktop" : "laptop";
  }

  return "mobile";
}

export function DevicePreviewIcon({
  deviceName,
  categoryId,
  className,
}: DevicePreviewIconProps) {
  const variant = resolveDeviceIconVariant(categoryId, deviceName);
  const asset = DEVICE_IMAGES[variant];

  return (
    <div
      className={cn(
        "flex h-[88px] w-full items-center justify-center bg-[#F3F4F6] px-2 py-3",
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={asset.src}
        alt=""
        role="presentation"
        className={cn("h-auto w-auto object-contain", asset.className)}
      />
    </div>
  );
}

export { DevicePreviewIcon as DevicePhonePreview };
