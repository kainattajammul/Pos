export interface RefurbishmentBatchLineItem {
  id: string;
  imeiSerial: string;
  variantsInfo: string;
  warranty: string;
  supplierVendor: string;
  deviceProblem: string;
  diagnosticNotes: string;
}

export interface RefurbishmentBatchFormState {
  batchName: string;
  store: string;
  dateDisplay: string;
  employee: string;
}

export const DEFAULT_STORE_NAME = "Fone doctors";

export const EMPLOYEE_OPTIONS = [
  "Faisal Sheikh",
  "Admin User",
  "Repair Staff",
] as const;

export const DEVICE_PROBLEM_OPTIONS = [
  "",
  "Screen Damage",
  "Battery Issue",
  "Charging Port",
  "Camera",
  "Speaker",
  "Water Damage",
  "Software",
  "Other",
] as const;

export function formatRefurbishmentDateTime(date: Date = new Date()): string {
  const day = date.getDate();
  const month = date.toLocaleString("en-GB", { month: "short" });
  const year = date.getFullYear();
  const time = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${day} ${month}, ${year} (${time})`;
}

export function buildBatchName(store: string, date: Date = new Date()): string {
  return `${store} - ${formatRefurbishmentDateTime(date)}`;
}

export function createEmptyLineItem(imeiSerial: string): RefurbishmentBatchLineItem {
  return {
    id: `line-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    imeiSerial,
    variantsInfo: "",
    warranty: "",
    supplierVendor: "",
    deviceProblem: "",
    diagnosticNotes: "",
  };
}
