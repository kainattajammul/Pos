import { DEFAULT_BRANCHES, createDefaultBranchRecord } from "@/lib/branch-mock-data";
import type {
  BranchRecord,
  BranchStatus,
  CreateBranchPayload,
  UpdateBranchPayload,
} from "@/lib/branch-types";

const STORAGE_KEY = "pos-branches-v1";

function readBranches(): BranchRecord[] {
  if (typeof window === "undefined") return DEFAULT_BRANCHES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_BRANCHES));
      return DEFAULT_BRANCHES;
    }
    return JSON.parse(raw) as BranchRecord[];
  } catch {
    return DEFAULT_BRANCHES;
  }
}

function writeBranches(branches: BranchRecord[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(branches));
}

function nextId(branches: BranchRecord[]): number {
  return branches.reduce((max, b) => Math.max(max, b.id), 0) + 1;
}

export function listStoredBranches(shopId: number): BranchRecord[] {
  return readBranches().filter((b) => b.shopId === shopId);
}

export function getStoredBranch(id: number): BranchRecord | undefined {
  return readBranches().find((b) => b.id === id);
}

export function createStoredBranch(payload: CreateBranchPayload): BranchRecord {
  const branches = readBranches();
  const branch = createDefaultBranchRecord(nextId(branches), payload);
  writeBranches([branch, ...branches]);
  return branch;
}

export function updateStoredBranch(id: number, payload: UpdateBranchPayload): BranchRecord {
  const branches = readBranches();
  const index = branches.findIndex((b) => b.id === id);
  if (index < 0) throw new Error("Branch not found");

  const current = branches[index];
  const updated: BranchRecord = {
    ...current,
    ...payload,
    address: { ...current.address, ...payload.address },
    contact: { ...current.contact, ...payload.contact },
    openingHours: { ...current.openingHours, ...payload.openingHours },
    holidays: payload.holidays ?? current.holidays,
    staff: { ...current.staff, ...payload.staff },
    inventory: { ...current.inventory, ...payload.inventory },
    operations: { ...current.operations, ...payload.operations },
    finance: { ...current.finance, ...payload.finance },
    online: { ...current.online, ...payload.online },
    communication: { ...current.communication, ...payload.communication },
    reporting: { ...current.reporting, ...payload.reporting },
    devices: { ...current.devices, ...payload.devices },
    system: { ...current.system, ...payload.system },
    updatedAt: new Date().toISOString(),
  };

  branches[index] = updated;
  writeBranches(branches);
  return updated;
}

export function setStoredBranchStatus(id: number, status: BranchStatus): BranchRecord {
  return updateStoredBranch(id, { status });
}

export function deleteStoredBranch(id: number): void {
  const branches = readBranches().filter((b) => b.id !== id);
  writeBranches(branches);
}
