import type { DeviceIconVariant } from "@/components/repairs/device-preview-icon";

export interface RepairDevice {
  id: string;
  name: string;
  imageUrl?: string;
  iconVariant?: DeviceIconVariant;
  dbId?: number;
  repairDeviceSeriesId?: number | null;
  isDefault?: boolean;
  isAdd?: boolean;
}

export type RepairCategoryId = "mobile" | "tablet" | "computer" | "drone" | "jewelry";

/** Minimal fallback when API data is unavailable. */
export const REPAIR_DEVICES_FALLBACK: RepairDevice[] = [
  { id: "generic-add-device", name: "Add Device", isAdd: true },
];
