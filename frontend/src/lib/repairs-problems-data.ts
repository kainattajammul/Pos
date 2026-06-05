import type { RepairProblemIcon } from "@/lib/repair-issue-icons";
import { formatCurrency } from "@/utils/format";

export type { RepairProblemIcon } from "@/lib/repair-issue-icons";

export interface RepairProblem {
  id: string;
  name: string;
  price: number;
  icon: RepairProblemIcon;
  imageUrl?: string;
  dbId?: number;
  isDefault?: boolean;
  isAdd?: boolean;
}

export const REPAIR_PROBLEMS_FALLBACK: RepairProblem[] = [
  {
    id: "add-device-issue",
    name: "Add Device Issue",
    price: 0,
    icon: "diagnostic",
    isAdd: true,
  },
];

export const DEFAULT_REPAIR_PROBLEMS: RepairProblem[] = [
  {
    id: "add-device-issue",
    name: "Add Device Issue",
    price: 0,
    icon: "diagnostic",
    isAdd: true,
  },
  {
    id: "back-camera",
    name: "Back Camera Replacement",
    price: 35,
    icon: "camera-rear",
  },
  {
    id: "battery",
    name: "Battery Replacement",
    price: 45,
    icon: "battery",
  },
  {
    id: "charging-port",
    name: "Charging Port Replacement",
    price: 30,
    icon: "charging-port",
  },
  {
    id: "diagnostic",
    name: "Diagnostic",
    price: 45,
    icon: "diagnostic",
  },
  {
    id: "front-camera",
    name: "Front Camera Replacement",
    price: 80,
    icon: "camera-front",
  },
  {
    id: "screen",
    name: "Screen (Digitizer + LCD) Replacement",
    price: 45,
    icon: "screen",
  },
  {
    id: "speaker",
    name: "Speaker Replacement",
    price: 66,
    icon: "speaker",
  },
  {
    id: "volume-button",
    name: "Volume Button Replacement",
    price: 30,
    icon: "volume",
  },
  {
    id: "water-damage",
    name: "Water Damage",
    price: 45,
    icon: "water-damage",
  },
];

export function formatRepairProblemPrice(price: number): string {
  return formatCurrency(price);
}

export function isAddProblemId(problemId: string): boolean {
  const problem = DEFAULT_REPAIR_PROBLEMS.find((p) => p.id === problemId);
  return Boolean(problem?.isAdd);
}
