import type { LucideIcon } from "lucide-react";
import { Gem, Laptop, Plus, Radio, Smartphone, Tablet } from "lucide-react";
import type { RepairDevice } from "@/lib/repairs-devices-data";
import { REPAIR_DEVICES_FALLBACK } from "@/lib/repairs-devices-data";

export type { RepairDevice } from "@/lib/repairs-devices-data";

export interface PosNavItem {
  label: string;
  hasDropdown?: boolean;
  active?: boolean;
}

export const POS_NAV_ITEMS: PosNavItem[] = [
  { label: "Repairs", hasDropdown: true },
  { label: "Inventory", hasDropdown: true },
  { label: "Customer", hasDropdown: true },
  { label: "Point Of Sale", active: true },
  { label: "Reports", hasDropdown: true },
  { label: "Campaigner" },
  { label: "Expense", hasDropdown: true },
];

export const POS_TABS = [
  "Repairs",
  "Unlocking",
  "Products",
  "Trade In",
  "Miscellaneous",
] as const;

export type PosTab = (typeof POS_TABS)[number];

/** Workflow steps shown after a repair category is chosen (e.g. Mobile Repair). */
export const REPAIR_WORKFLOW_STEPS = [
  "Manufacturer",
  "Devices",
  "Problems",
  "Parts",
  "Details",
] as const;

export type RepairWorkflowStep = (typeof REPAIR_WORKFLOW_STEPS)[number];

/** Includes category picker before the workflow begins. */
export const REPAIR_STEPS = ["Category", ...REPAIR_WORKFLOW_STEPS] as const;

export type RepairStep = (typeof REPAIR_STEPS)[number];

export const REPAIR_STEP_ORDER = REPAIR_STEPS;

export function getRepairStepIndex(step: RepairStep): number {
  return REPAIR_STEP_ORDER.indexOf(step);
}

export function canNavigateToRepairStep(
  target: RepairStep,
  furthestStep: RepairStep,
): boolean {
  return getRepairStepIndex(target) <= getRepairStepIndex(furthestStep);
}

export function getNextRepairStep(step: RepairStep): RepairStep | null {
  const index = getRepairStepIndex(step);
  if (index < 0 || index >= REPAIR_STEP_ORDER.length - 1) return null;
  return REPAIR_STEP_ORDER[index + 1] ?? null;
}

export interface RepairManufacturer {
  id: string;
  name: string;
  isAdd?: boolean;
  /** simple-icons slug for CDN logo (https://simpleicons.org) */
  logoSlug?: string;
  iconKey?: string;
  imageUrl?: string;
  dbId?: number;
  isDefault?: boolean;
}

export const REPAIR_MANUFACTURERS: RepairManufacturer[] = [
  { id: "add", name: "Add Manufacturer", isAdd: true },
  { id: "apple", name: "Apple", logoSlug: "apple" },
  { id: "samsung", name: "Samsung", logoSlug: "samsung" },
  { id: "google", name: "Google", logoSlug: "google" },
  { id: "htc", name: "HTC", logoSlug: "htc" },
  { id: "blackberry", name: "BlackBerry", logoSlug: "blackberry" },
  { id: "oneplus", name: "ONEPLUS", logoSlug: "oneplus" },
  { id: "motorola", name: "Motorola", logoSlug: "motorola" },
  { id: "xiaomi", name: "Xiaomi", logoSlug: "xiaomi" },
  { id: "lg", name: "LG", logoSlug: "lg" },
  { id: "nokia", name: "Nokia", logoSlug: "nokia" },
  { id: "sony", name: "Sony", logoSlug: "sony" },
  { id: "vivo", name: "Vivo", logoSlug: "vivo" },
  { id: "asus", name: "Asus Zenfone", logoSlug: "asus" },
  { id: "alcatel", name: "Alcatel", logoSlug: "alcatel" },
  { id: "essential", name: "ESSENTIAL", logoSlug: "essential" },
  { id: "huawei", name: "Huawei", logoSlug: "huawei" },
  { id: "kyocera", name: "Kyocera", logoSlug: "kyocera" },
  { id: "zte", name: "ZTE", logoSlug: "zte" },
];

export interface RepairCategoryCard {
  /** Workflow id — slug from API for persisted categories */
  id: string;
  label: string;
  icon: LucideIcon;
  isAdd?: boolean;
  /** Database primary key when loaded from API */
  dbId?: number;
  isDefault?: boolean;
  /** Lucide icon key from API (used when re-opening edit flows) */
  iconKey?: string;
  /** Supabase public URL when category uses a custom image */
  imageUrl?: string;
}

/** Steps shown in breadcrumb after the manufacturer name. */
export const REPAIR_POST_MANUFACTURER_STEPS = [
  "Devices",
  "Problems",
  "Parts",
  "Details",
] as const;

export type RepairPostManufacturerStep = (typeof REPAIR_POST_MANUFACTURER_STEPS)[number];

export function getManufacturerById(
  id: string | null,
  manufacturers: RepairManufacturer[] = REPAIR_MANUFACTURERS,
): RepairManufacturer | undefined {
  if (!id) return undefined;
  return manufacturers.find((m) => m.id === id && !m.isAdd);
}

/** @deprecated Prefer API-backed device list from repairs workflow */
export function getDevicesForCategoryAndManufacturer(
  ..._args: [string | null, string | null]
): RepairDevice[] {
  void _args;
  return REPAIR_DEVICES_FALLBACK;
}

/** @deprecated Use getDevicesForCategoryAndManufacturer */
export function getDevicesForManufacturer(
  manufacturerId: string | null,
  categoryId: string | null = "mobile",
): RepairDevice[] {
  return getDevicesForCategoryAndManufacturer(categoryId, manufacturerId);
}

export function isAddDeviceId(
  deviceId: string,
  categoryId: string | null,
  manufacturerId: string | null,
): boolean {
  const list = getDevicesForCategoryAndManufacturer(categoryId, manufacturerId);
  const device = list.find((d) => d.id === deviceId);
  return Boolean(device?.isAdd);
}

export function getDeviceById(
  deviceId: string | null,
  categoryId: string | null,
  manufacturerId: string | null,
  devices: RepairDevice[] = getDevicesForCategoryAndManufacturer(
    categoryId,
    manufacturerId,
  ),
): RepairDevice | undefined {
  if (!deviceId) return undefined;
  return devices.find((d) => d.id === deviceId && !d.isAdd);
}

export function isAddDeviceInList(deviceId: string, devices: RepairDevice[]): boolean {
  const device = devices.find((d) => d.id === deviceId);
  return Boolean(device?.isAdd);
}

export function getCategoryIdFromLabel(
  label: string | null,
  categories: RepairCategoryCard[] = REPAIR_CATEGORIES,
): string | null {
  if (!label) return null;
  const match = categories.find((c) => c.label === label && !c.isAdd);
  return match?.id ?? null;
}

export const REPAIR_CATEGORIES: RepairCategoryCard[] = [
  { id: "add", label: "Add Category", icon: Plus, isAdd: true },
  { id: "mobile", label: "Mobile Repair", icon: Smartphone },
  { id: "tablet", label: "Tablet Repair", icon: Tablet },
  { id: "computer", label: "Computer Repair", icon: Laptop },
  { id: "drone", label: "Drone Repair", icon: Radio },
  { id: "jewelry", label: "Jewelry Repair", icon: Gem },
];
