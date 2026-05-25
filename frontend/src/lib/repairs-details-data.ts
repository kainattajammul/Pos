import {
  DEFAULT_REPAIR_PROBLEMS,
  type RepairProblem,
} from "@/lib/repairs-problems-data";
import type { RepairPart } from "@/lib/repairs-parts-data";
import { DEFAULT_TASK_DUE_AT } from "@/lib/repair-datetime";

export type RepairDetailsSubTab = "checklist" | "condition-images";

export type ImeiSerialType = "IMEI" | "Serial";

export type LockType = "passcode" | "pattern";

export interface RepairDetailsFormValues {
  imeiSerialType: ImeiSerialType;
  imeiSerialValue: string;
  lockType: LockType;
  passcode: string;
  patternLock: string;
  warrantyValue: string;
  warrantyUnit: string;
  assignedTo: string;
  taskDueAt: Date;
  diagnosticNote: string;
  repairCharges: string;
  repairTaskStatus: string;
  devicePhysicalLocation: string;
  repairTaskType: string;
  deviceNetwork: string;
  additionalNote: string;
}

export const REPAIR_DETAILS_DEFAULTS: RepairDetailsFormValues = {
  imeiSerialType: "IMEI",
  imeiSerialValue: "",
  lockType: "passcode",
  passcode: "",
  patternLock: "",
  warrantyValue: "90",
  warrantyUnit: "Days",
  assignedTo: "John Doe",
  taskDueAt: DEFAULT_TASK_DUE_AT,
  diagnosticNote: "",
  repairCharges: "45",
  repairTaskStatus: "Waiting for inspection",
  devicePhysicalLocation: "",
  repairTaskType: "In-Store",
  deviceNetwork: "",
  additionalNote: "",
};

export const IMEI_SERIAL_OPTIONS: ImeiSerialType[] = ["IMEI", "Serial"];

export const WARRANTY_UNIT_OPTIONS = ["Days", "Weeks", "Months", "Years"];

export const ASSIGNED_TO_OPTIONS = ["John Doe", "Jane Smith", "Alex Rivera", "Unassigned"];

export const REPAIR_TASK_STATUS_OPTIONS = [
  "Waiting for inspection",
  "In progress",
  "Waiting for parts",
  "Ready for pickup",
  "Completed",
];

export const DEVICE_LOCATION_OPTIONS = [
  "Front counter",
  "Back office",
  "Repair bench A",
  "Repair bench B",
  "Storage shelf",
];

export const REPAIR_TASK_TYPE_OPTIONS = ["In-Store", "Mail-in", "On-site", "Warranty"];

export const DEVICE_NETWORK_OPTIONS = [
  "Unlocked",
  "AT&T",
  "Verizon",
  "T-Mobile",
  "Other",
];

function formatRepairChargeAmount(total: number): string {
  return Number.isInteger(total) ? String(total) : total.toFixed(2);
}

/** Sum selected issue and part prices; falls back to default when nothing is selected. */
export function getDefaultRepairCharges(
  problemIds: string[],
  partIds: string[],
  problems: RepairProblem[] = DEFAULT_REPAIR_PROBLEMS,
  parts: RepairPart[] = [],
): string {
  if (problemIds.length === 0 && partIds.length === 0) {
    return REPAIR_DETAILS_DEFAULTS.repairCharges;
  }

  const issuesTotal = problemIds.reduce((sum, id) => {
    const problem = problems.find((p) => p.id === id && !p.isAdd);
    return sum + (problem?.price ?? 0);
  }, 0);

  const partsTotal = partIds.reduce((sum, id) => {
    const part = parts.find((p) => p.id === id && !p.isAdd);
    return sum + (part?.price ?? 0);
  }, 0);

  const total = issuesTotal + partsTotal;
  return formatRepairChargeAmount(total);
}
