import { slugify } from "./slugify.js";

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
