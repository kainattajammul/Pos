import {
  createStoredBranch,
  deleteStoredBranch,
  getStoredBranch,
  listStoredBranches,
  setStoredBranchStatus,
  updateStoredBranch,
} from "@/lib/branch-storage";
import type {
  BranchRecord,
  BranchStatus,
  CreateBranchPayload,
  UpdateBranchPayload,
} from "@/lib/branch-types";

const delay = (ms = 280) => new Promise((r) => setTimeout(r, ms));

export async function fetchBranches(shopId: number): Promise<BranchRecord[]> {
  await delay();
  return listStoredBranches(shopId);
}

export async function fetchBranch(id: number): Promise<BranchRecord> {
  await delay();
  const branch = getStoredBranch(id);
  if (!branch) throw new Error("Branch not found");
  return branch;
}

export async function createBranch(payload: CreateBranchPayload): Promise<BranchRecord> {
  await delay();
  return createStoredBranch(payload);
}

export async function updateBranch(
  id: number,
  payload: UpdateBranchPayload,
): Promise<BranchRecord> {
  await delay();
  return updateStoredBranch(id, payload);
}

export async function updateBranchStatus(
  id: number,
  status: BranchStatus,
): Promise<BranchRecord> {
  await delay();
  return setStoredBranchStatus(id, status);
}

export async function removeBranch(id: number): Promise<void> {
  await delay();
  deleteStoredBranch(id);
}
