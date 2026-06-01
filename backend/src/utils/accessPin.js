import { ApiError } from "./ApiError.js";
import { HTTP } from "../constants/httpStatus.js";

const PIN_PATTERN = /^\d{4}$/;

/** Validates and returns a 4-digit access PIN string. */
export function normalizeAccessPin(raw, { required = false } = {}) {
  if (raw === undefined || raw === null || String(raw).trim() === "") {
    if (required) {
      throw new ApiError(HTTP.BAD_REQUEST, "Access PIN is required and must be 4 digits");
    }
    return null;
  }

  const pin = String(raw).trim();
  if (!PIN_PATTERN.test(pin)) {
    throw new ApiError(HTTP.BAD_REQUEST, "Access PIN must be exactly 4 digits");
  }

  return pin;
}
