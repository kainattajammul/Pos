import { slugify } from "./slugify.js";

const BRANCH_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isBranchUuid(value) {
  return BRANCH_UUID_RE.test(String(value ?? "").trim());
}

export function isBranchNumericId(value) {
  const trimmed = String(value ?? "").trim();
  return /^\d+$/.test(trimmed) && Number(trimmed) >= 1;
}

/** Accepts API UUIDs and legacy numeric branch ids from old URLs. */
export function isBranchIdentifier(value) {
  return isBranchUuid(value) || isBranchNumericId(value);
}

export const BRANCH_IDENTIFIER_MESSAGE =
  "branchUuid must be a valid UUID or positive branch id";

export function normalizeBranchCode(code) {
  return String(code ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "-")
    .replace(/[^A-Z0-9-]/g, "");
}

export function normalizeEmail(email) {
  const trimmed = String(email ?? "").trim().toLowerCase();
  return trimmed || null;
}

export function normalizePhone(phone) {
  const trimmed = String(phone ?? "").trim();
  return trimmed || null;
}

export function normalizeText(value) {
  const trimmed = String(value ?? "").trim();
  return trimmed || null;
}

export function generateBranchSlug(name) {
  const slug = slugify(name);
  return slug || "branch";
}

export function parseTimeToMinutes(time) {
  if (!time) return null;
  const [h, m] = String(time).split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return h * 60 + m;
}

export function isValidTimeString(value) {
  return /^\d{2}:\d{2}$/.test(String(value ?? ""));
}

export function isValidIanaTimezone(tz) {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export function getClientMeta(req) {
  return {
    ipAddress: req.ip ?? req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ?? null,
    userAgent: req.headers["user-agent"] ?? null,
  };
}
