/** Branch module enums — mirrors Prisma schema values (API uses snake_case). */

export const BRANCH_TYPES = [
  "main",
  "standard",
  "franchise",
  "warehouse",
  "kiosk",
  "service_centre",
  "online",
  "other",
];

export const BRANCH_STATUSES = [
  "draft",
  "active",
  "inactive",
  "temporarily_closed",
  "archived",
];

export const BRANCH_MANUAL_OPENING_STATUSES = ["open", "closed", "temporarily_closed"];

export const DAYS_OF_WEEK = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export const BRANCH_CLOSURE_TYPES = [
  "public_holiday",
  "maintenance",
  "emergency",
  "staff_event",
  "temporary_closure",
  "custom",
];

export function branchTypeToDb(value) {
  return String(value).trim().toUpperCase().replace(/-/g, "_");
}

export function branchTypeFromDb(value) {
  return String(value).toLowerCase();
}

export function branchStatusToDb(value) {
  return String(value).trim().toUpperCase().replace(/-/g, "_");
}

export function branchStatusFromDb(value) {
  return String(value).toLowerCase();
}

export function dayOfWeekToDb(value) {
  return String(value).trim().toUpperCase();
}

export function dayOfWeekFromDb(value) {
  return String(value).toLowerCase();
}

export function closureTypeToDb(value) {
  return String(value).trim().toUpperCase().replace(/-/g, "_");
}

export function closureTypeFromDb(value) {
  return String(value).toLowerCase();
}

export function manualOpeningStatusToDb(value) {
  return String(value).trim().toUpperCase().replace(/-/g, "_");
}

export function manualOpeningStatusFromDb(value) {
  return String(value).toLowerCase();
}

export const DEFAULT_OPENING_HOURS = [
  { day_of_week: "monday", is_closed: false, opens_at: "09:00", closes_at: "18:00" },
  { day_of_week: "tuesday", is_closed: false, opens_at: "09:00", closes_at: "18:00" },
  { day_of_week: "wednesday", is_closed: false, opens_at: "09:00", closes_at: "18:00" },
  { day_of_week: "thursday", is_closed: false, opens_at: "09:00", closes_at: "18:00" },
  { day_of_week: "friday", is_closed: false, opens_at: "09:00", closes_at: "18:00" },
  { day_of_week: "saturday", is_closed: false, opens_at: "10:00", closes_at: "16:00" },
  { day_of_week: "sunday", is_closed: true, opens_at: null, closes_at: null },
];
