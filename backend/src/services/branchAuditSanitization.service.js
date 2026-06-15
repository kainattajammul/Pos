const SENSITIVE_KEYS = new Set([
  "password",
  "passwordHash",
  "password_hash",
  "accessToken",
  "access_token",
  "refreshToken",
  "refresh_token",
  "apiKey",
  "api_key",
  "serviceRoleKey",
  "service_role_key",
  "credentialReference",
  "credential_reference",
  "cardNumber",
  "card_number",
  "cvv",
  "imei",
  "collectionCode",
  "collection_code",
  "signature",
  "secret",
  "token",
]);

const MAX_JSON_DEPTH = 6;
const MAX_STRING_LENGTH = 2000;
const MAX_ARRAY_ITEMS = 50;

function maskValue(key, value) {
  if (value == null) return value;
  const lowerKey = String(key).toLowerCase();
  if (SENSITIVE_KEYS.has(key) || SENSITIVE_KEYS.has(lowerKey)) {
    return "[REDACTED]";
  }
  if (lowerKey.includes("password") || lowerKey.includes("token") || lowerKey.includes("secret")) {
    return "[REDACTED]";
  }
  if (typeof value === "string" && value.length > MAX_STRING_LENGTH) {
    return `${value.slice(0, MAX_STRING_LENGTH)}…[truncated]`;
  }
  return value;
}

function sanitizeObject(obj, depth = 0) {
  if (obj == null || depth > MAX_JSON_DEPTH) return obj;
  if (Array.isArray(obj)) {
    return obj.slice(0, MAX_ARRAY_ITEMS).map((item) => sanitizeValue(item, depth + 1));
  }
  if (typeof obj !== "object") return obj;

  const out = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.has(key)) {
      out[key] = "[REDACTED]";
      continue;
    }
    out[key] = sanitizeValue(value, depth + 1, key);
  }
  return out;
}

function sanitizeValue(value, depth = 0, key = "") {
  if (value == null) return value;
  if (typeof value === "object") return sanitizeObject(value, depth);
  return maskValue(key, value);
}

export function sanitizeAuditPayload(payload) {
  if (payload == null) return null;
  return sanitizeObject(payload);
}

export function maskIpAddress(ip, canViewSensitive) {
  if (!ip) return null;
  if (canViewSensitive) return ip;
  const parts = String(ip).split(".");
  if (parts.length === 4) return `${parts[0]}.${parts[1]}.***.***`;
  return "[masked]";
}

export function maskUserAgent(userAgent) {
  if (!userAgent) return null;
  const ua = String(userAgent);
  if (ua.length <= 40) return ua;
  return `${ua.slice(0, 40)}…`;
}
