import { WALKIN_CUSTOMER_NAME } from "@/lib/repairs-customer-data";
import type { RepairProblem } from "@/lib/repairs-problems-data";
import type { RepairDetailsFormValues } from "@/lib/repairs-details-data";
import type { RepairDevice, RepairManufacturer } from "@/lib/repairs-pos-data";
import { getDeviceById, getManufacturerById } from "@/lib/repairs-pos-data";
import { MONTH_NAMES } from "@/lib/repair-datetime";

export const REPAIR_STORE_NAME = "Repair Store";
export const REPAIR_STORE_ADDRESS =
  "Tufts International Center, 20 Sawyer Avenue";

export interface RepairTicketSnapshot {
  ticketId: string;
  customerName: string;
  storeName: string;
  storeAddress: string;
  deviceTitle: string;
  serviceName: string;
  imeiSerialLabel: string;
  imeiSerialValue: string;
  diagnosticNote: string;
  repairCharges: string;
  createdAt: Date;
}

/** Receipt header date: `15 May, 2024 (01:11 pm)` */
export function formatReceiptDateTime(date: Date): string {
  const day = date.getDate();
  const month = MONTH_NAMES[date.getMonth()] ?? "";
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const period = hours >= 12 ? "pm" : "am";
  hours = hours % 12 || 12;
  return `${day} ${month}, ${year} (${hours}:${minutes} ${period})`;
}

/** Label date: `25 May, 2024` */
export function formatLabelDate(date: Date): string {
  const day = date.getDate();
  const month = MONTH_NAMES[date.getMonth()] ?? "";
  const year = date.getFullYear();
  return `${day} ${month}, ${year}`;
}

function getOrCreateTicketId(): string {
  if (typeof window === "undefined") return "T-5";
  const currentKey = "repair-pos-current-ticket";
  const existing = window.sessionStorage.getItem(currentKey);
  if (existing) return existing;

  const seqKey = "repair-pos-ticket-seq";
  const current = Number.parseInt(window.sessionStorage.getItem(seqKey) ?? "4", 10);
  const next = Number.isNaN(current) ? 5 : current + 1;
  window.sessionStorage.setItem(seqKey, String(next));
  const id = `T-${next}`;
  window.sessionStorage.setItem(currentKey, id);
  return id;
}

export interface BuildRepairTicketSnapshotInput {
  customerName: string;
  selectedCategoryId: string | null;
  selectedManufacturerId: string | null;
  selectedDeviceId: string | null;
  selectedProblemIds: string[];
  detailsForm: RepairDetailsFormValues;
  ticketId?: string;
  devices?: RepairDevice[];
  manufacturers?: RepairManufacturer[];
  problems?: RepairProblem[];
}

export function buildRepairTicketSnapshot(
  input: BuildRepairTicketSnapshotInput,
): RepairTicketSnapshot {
  const manufacturer = getManufacturerById(
    input.selectedManufacturerId,
    input.manufacturers,
  );
  const device = getDeviceById(
    input.selectedDeviceId,
    input.selectedCategoryId,
    input.selectedManufacturerId,
    input.devices ?? [],
  );

  const deviceTitle =
    manufacturer && device
      ? `${manufacturer.name} ${device.name}`
      : device?.name ?? "Device";

  const problemList = input.problems ?? [];
  const problems = input.selectedProblemIds
    .map((id) => problemList.find((p) => p.id === id && !p.isAdd))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const serviceName =
    problems.map((p) => p.name).join(", ") ||
    problemList.find((p) => p.id === "screen")?.name ||
    "Repair Service";

  const imeiSerialValue =
    input.detailsForm.imeiSerialValue.trim() || "353931117232603";
  const imeiSerialLabel = `${input.detailsForm.imeiSerialType} / SN`;

  const customerName =
    input.customerName === WALKIN_CUSTOMER_NAME && input.detailsForm.assignedTo
      ? input.detailsForm.assignedTo
      : input.customerName;

  return {
    ticketId: input.ticketId ?? getOrCreateTicketId(),
    customerName,
    storeName: REPAIR_STORE_NAME,
    storeAddress: REPAIR_STORE_ADDRESS,
    deviceTitle,
    serviceName,
    imeiSerialLabel,
    imeiSerialValue,
    diagnosticNote:
      input.detailsForm.diagnosticNote.trim() ||
      "Screen needs to be replaced. Handle with care.",
    repairCharges: input.detailsForm.repairCharges,
    createdAt: input.detailsForm.taskDueAt ?? new Date(),
  };
}
