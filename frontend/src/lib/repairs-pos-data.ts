import type { LucideIcon } from "lucide-react";
import { Gem, Laptop, Plus, Radio, Smartphone, Tablet } from "lucide-react";

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
  { label: "Reports" },
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

export const REPAIR_STEPS = [
  "Category",
  "Manufacturer",
  "Devices",
  "Problems",
  "Parts",
  "Details",
] as const;

export type RepairStep = (typeof REPAIR_STEPS)[number];

export interface RepairCategoryCard {
  id: string;
  label: string;
  icon: LucideIcon;
  isAdd?: boolean;
}

export const REPAIR_CATEGORIES: RepairCategoryCard[] = [
  { id: "add", label: "Add Category", icon: Plus, isAdd: true },
  { id: "mobile", label: "Mobile Repair", icon: Smartphone },
  { id: "tablet", label: "Tablet Repair", icon: Tablet },
  { id: "computer", label: "Computer Repair", icon: Laptop },
  { id: "drone", label: "Drone Repair", icon: Radio },
  { id: "jewelry", label: "Jewelry Repair", icon: Gem },
];
