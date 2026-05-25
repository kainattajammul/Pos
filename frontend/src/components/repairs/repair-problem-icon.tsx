"use client";

import type { LucideIcon } from "lucide-react";
import {
  Antenna,
  Battery,
  Bluetooth,
  Camera,
  ClipboardList,
  Cpu,
  Droplets,
  Fingerprint,
  HardDrive,
  Headphones,
  Mic,
  Plug,
  Power,
  ScanFace,
  Smartphone,
  Square,
  Vibrate,
  Volume2,
  VolumeX,
  Wifi,
  Wrench,
} from "lucide-react";
import {
  normalizeRepairProblemIcon,
  type RepairProblemIcon,
} from "@/lib/repair-issue-icons";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  screen: Smartphone,
  battery: Battery,
  "charging-port": Plug,
  diagnostic: ClipboardList,
  "camera-front": Camera,
  "camera-rear": Camera,
  speaker: Volume2,
  volume: VolumeX,
  microphone: Mic,
  power: Power,
  "water-damage": Droplets,
  wifi: Wifi,
  bluetooth: Bluetooth,
  fingerprint: Fingerprint,
  "face-id": ScanFace,
  "sim-card": HardDrive,
  headphone: Headphones,
  vibration: Vibrate,
  motherboard: Cpu,
  "back-glass": Square,
  frame: Square,
  software: ClipboardList,
  "data-recovery": HardDrive,
  "general-repair": Wrench,
  antenna: Antenna,
};

interface RepairProblemIconProps {
  icon: RepairProblemIcon | string;
  className?: string;
}

export function RepairProblemIconMark({ icon, className }: RepairProblemIconProps) {
  const key = normalizeRepairProblemIcon(String(icon));
  const Icon = ICON_MAP[key] ?? ClipboardList;

  return (
    <Icon
      className={cn("size-9 stroke-[1.5] text-[var(--repair-primary)]", className)}
      aria-hidden
    />
  );
}
