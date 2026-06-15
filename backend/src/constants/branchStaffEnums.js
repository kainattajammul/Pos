/** Branch staff module enums — mirrors Prisma (API uses snake_case). */

export const BRANCH_STAFF_STATUSES = [
  "invited",
  "active",
  "inactive",
  "suspended",
  "archived",
];

export const PERMISSION_EFFECTS = ["allow", "deny"];

export const STAFF_SHIFT_STATUSES = [
  "draft",
  "published",
  "confirmed",
  "completed",
  "cancelled",
  "absent",
];

export const PERFORMANCE_PERIOD_TYPES = [
  "daily",
  "weekly",
  "monthly",
  "quarterly",
  "yearly",
  "custom",
];

export const SYSTEM_BRANCH_ROLE_CODES = {
  MANAGER: "branch_manager",
  CASHIER: "branch_cashier",
  TECHNICIAN: "branch_technician",
};

export function staffStatusToDb(value) {
  return String(value).trim().toUpperCase();
}

export function staffStatusFromDb(value) {
  return String(value).toLowerCase();
}

export function shiftStatusToDb(value) {
  return String(value).trim().toUpperCase();
}

export function shiftStatusFromDb(value) {
  return String(value).toLowerCase();
}

export function permissionEffectToDb(value) {
  return String(value).trim().toUpperCase();
}

export function permissionEffectFromDb(value) {
  return String(value).toLowerCase();
}

export function periodTypeToDb(value) {
  return String(value).trim().toUpperCase();
}

export function periodTypeFromDb(value) {
  return String(value).toLowerCase();
}

export const ACTIVE_STAFF_STATUSES = ["ACTIVE", "INVITED"];
