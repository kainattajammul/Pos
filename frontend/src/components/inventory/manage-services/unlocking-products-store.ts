import {
  getNextUnlockingItemId,
  MOCK_UNLOCKING_PRODUCT_RECORDS,
  recordToUnlockingService,
  type UnlockingProductRecord,
} from "@/components/inventory/manage-services/unlocking-product-form-types";
import type { UnlockingService } from "@/components/inventory/manage-services/unlocking-services-types";

export const UNLOCKING_PRODUCTS_STORAGE_KEY = "unlocking-products";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function loadUnlockingProductRecords(): UnlockingProductRecord[] {
  if (!isBrowser()) return [...MOCK_UNLOCKING_PRODUCT_RECORDS];

  const raw = sessionStorage.getItem(UNLOCKING_PRODUCTS_STORAGE_KEY);
  if (!raw) {
    sessionStorage.setItem(
      UNLOCKING_PRODUCTS_STORAGE_KEY,
      JSON.stringify(MOCK_UNLOCKING_PRODUCT_RECORDS),
    );
    return [...MOCK_UNLOCKING_PRODUCT_RECORDS];
  }

  try {
    const parsed = JSON.parse(raw) as UnlockingProductRecord[];
    return Array.isArray(parsed) ? parsed : [...MOCK_UNLOCKING_PRODUCT_RECORDS];
  } catch {
    return [...MOCK_UNLOCKING_PRODUCT_RECORDS];
  }
}

export function saveUnlockingProductRecords(records: UnlockingProductRecord[]): void {
  if (!isBrowser()) return;
  sessionStorage.setItem(UNLOCKING_PRODUCTS_STORAGE_KEY, JSON.stringify(records));
}

export function getUnlockingProductById(id: string): UnlockingProductRecord | undefined {
  return loadUnlockingProductRecords().find((record) => record.id === id);
}

export function upsertUnlockingProduct(record: UnlockingProductRecord): void {
  const records = loadUnlockingProductRecords();
  const index = records.findIndex((item) => item.id === record.id);
  if (index >= 0) {
    records[index] = record;
  } else {
    records.unshift(record);
  }
  saveUnlockingProductRecords(records);
}

export function deleteUnlockingProductById(id: string): void {
  saveUnlockingProductRecords(
    loadUnlockingProductRecords().filter((record) => record.id !== id),
  );
}

export function loadUnlockingServices(): UnlockingService[] {
  return loadUnlockingProductRecords().map(recordToUnlockingService);
}

export function patchUnlockingServiceListFields(
  id: string,
  patch: Partial<Pick<UnlockingService, "price" | "cost" | "name">>,
): void {
  const records = loadUnlockingProductRecords();
  const index = records.findIndex((record) => record.id === id);
  if (index < 0) return;

  const record = records[index];
  if (patch.price !== undefined) record.retailPrice = patch.price.toFixed(2);
  if (patch.cost !== undefined) record.costPrice = patch.cost.toFixed(2);
  if (patch.name !== undefined) record.name = patch.name;
  saveUnlockingProductRecords(records);
}

export function cloneUnlockingProductById(id: string): UnlockingProductRecord | null {
  const source = getUnlockingProductById(id);
  if (!source) return null;

  const records = loadUnlockingProductRecords();
  const nextItemId = getNextUnlockingItemId(records);
  const clone: UnlockingProductRecord = {
    ...source,
    id: `unlock-${nextItemId}`,
    itemId: nextItemId,
    name: `${source.name} (Copy)`,
    closed: false,
  };

  records.unshift(clone);
  saveUnlockingProductRecords(records);
  return clone;
}
