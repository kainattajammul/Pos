import { INITIAL_CUSTOMERS } from "@/lib/customers-demo-data";
import {
  formatCustomerDisplayName,
  NEW_CUSTOMER_DEFAULTS,
  type NewCustomerFormValues,
} from "@/lib/repairs-customer-data";
import type {
  CreateCustomerPayload,
  CustomerMutationResult,
  CustomerTableRow,
  UpdateCustomerPayload,
} from "@/types/customer-table";

const STORAGE_KEY = "repair-pos-customers-v1";

let memoryStore: CustomerTableRow[] | null = null;
let nextId = INITIAL_CUSTOMERS.length + 1;

function delay(ms = 280): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cloneStore(): CustomerTableRow[] {
  return JSON.parse(JSON.stringify(getStore())) as CustomerTableRow[];
}

function getStore(): CustomerTableRow[] {
  if (memoryStore) return memoryStore;

  if (typeof window !== "undefined") {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as CustomerTableRow[];
        memoryStore = parsed;
        const maxId = parsed.reduce((m, c) => Math.max(m, c.id), 0);
        nextId = maxId + 1;
        return memoryStore;
      } catch {
        /* fall through */
      }
    }
  }

  memoryStore = [...INITIAL_CUSTOMERS];
  return memoryStore;
}

function persistStore(rows: CustomerTableRow[]) {
  memoryStore = rows;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  }
}

function formatPhone(values: NewCustomerFormValues): string | null {
  const digits = values.phone.replace(/\D/g, "");
  if (!digits) return null;
  const code = values.phoneCountryCode.trim() || "+1";
  return `${code} ${values.phone.trim()}`;
}

function rowFromPayload(
  id: number,
  payload: CreateCustomerPayload | UpdateCustomerPayload,
  existing?: CustomerTableRow,
): CustomerTableRow {
  const now = new Date().toISOString();
  const displayName = formatCustomerDisplayName(
    payload.firstName,
    payload.lastName,
  );
  const city = payload.city.trim() || null;
  const state = payload.state.trim() || null;

  return {
    id,
    firstName: payload.firstName.trim(),
    lastName: payload.lastName.trim(),
    displayName,
    email: payload.email.trim(),
    phone: formatPhone(payload),
    customerGroup: payload.customerGroup,
    taxClass: payload.taxClass,
    city,
    state,
    country: payload.country.trim() || "United States",
    status: payload.status,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}

export function customerRowToFormValues(row: CustomerTableRow): CreateCustomerPayload {
  const phoneMatch = row.phone?.match(/^(\+\d+)\s*(.+)$/);
  return {
    ...NEW_CUSTOMER_DEFAULTS,
    customerGroup: row.customerGroup,
    taxClass: row.taxClass,
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    phoneCountryCode: phoneMatch?.[1] ?? "+1",
    phone: phoneMatch?.[2] ?? row.phone ?? "",
    city: row.city ?? "",
    state: row.state ?? "",
    country: row.country,
    status: row.status,
  };
}

export async function fetchCustomers(): Promise<CustomerTableRow[]> {
  await delay();
  return cloneStore().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function createCustomer(
  payload: CreateCustomerPayload,
): Promise<CustomerMutationResult> {
  await delay();
  const store = cloneStore();
  const row = rowFromPayload(nextId++, payload);
  persistStore([row, ...store]);
  return { id: row.id, displayName: row.displayName };
}

export async function updateCustomer(
  id: number,
  payload: UpdateCustomerPayload,
): Promise<CustomerMutationResult> {
  await delay();
  const store = cloneStore();
  const index = store.findIndex((c) => c.id === id);
  if (index < 0) throw new Error("Customer not found");
  const updated = rowFromPayload(id, payload, store[index]);
  store[index] = updated;
  persistStore(store);
  return { id: updated.id, displayName: updated.displayName };
}

export async function deleteCustomer(id: number): Promise<void> {
  await delay();
  const store = cloneStore().filter((c) => c.id !== id);
  persistStore(store);
}
