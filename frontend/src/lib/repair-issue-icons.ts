/** Repair issue icon keys (keep in sync with backend REPAIR_DEVICE_ISSUE_ICON_CATALOG). */
export const REPAIR_ISSUE_ICON_KEYS = [
  "screen",
  "battery",
  "charging-port",
  "camera-front",
  "camera-rear",
  "speaker",
  "microphone",
  "volume",
  "power",
  "water-damage",
  "diagnostic",
  "wifi",
  "bluetooth",
  "fingerprint",
  "face-id",
  "sim-card",
  "headphone",
  "vibration",
  "motherboard",
  "back-glass",
  "frame",
  "software",
  "data-recovery",
  "general-repair",
] as const;

export type RepairProblemIcon = (typeof REPAIR_ISSUE_ICON_KEYS)[number];

export function isRepairProblemIcon(value: string): value is RepairProblemIcon {
  return (REPAIR_ISSUE_ICON_KEYS as readonly string[]).includes(value);
}

export function normalizeRepairProblemIcon(value: string | null | undefined): RepairProblemIcon {
  if (value && isRepairProblemIcon(value)) return value;
  return "diagnostic";
}
