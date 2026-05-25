"use client";

import type { LucideIcon } from "lucide-react";
import {
  Battery,
  Camera,
  ClipboardList,
  Droplets,
  Plug,
  Smartphone,
  Volume2,
  VolumeX,
} from "lucide-react";
import type { RepairProblemIcon } from "@/lib/repairs-problems-data";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<RepairProblemIcon, LucideIcon> = {
  "camera-rear": Camera,
  battery: Battery,
  "charging-port": Plug,
  diagnostic: ClipboardList,
  "camera-front": Camera,
  screen: Smartphone,
  speaker: Volume2,
  volume: VolumeX,
  "water-damage": Droplets,
};

interface RepairProblemIconProps {
  icon: RepairProblemIcon;
  className?: string;
}

export function RepairProblemIconMark({ icon, className }: RepairProblemIconProps) {
  const Icon = ICON_MAP[icon] ?? ClipboardList;

  return (
    <Icon
      className={cn("size-9 stroke-[1.5] text-[var(--repair-primary)]", className)}
      aria-hidden
    />
  );
}
