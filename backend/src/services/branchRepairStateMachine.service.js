import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";

const TRANSITIONS = {
  DRAFT: ["BOOKED", "RECEIVED", "CANCELLED"],
  BOOKED: ["AWAITING_DROPOFF", "RECEIVED", "CANCELLED"],
  AWAITING_DROPOFF: ["RECEIVED", "CANCELLED"],
  RECEIVED: ["DIAGNOSING", "CANCELLED", "ON_HOLD"],
  DIAGNOSING: ["AWAITING_CUSTOMER_APPROVAL", "PARTS_REQUIRED", "UNREPAIRABLE", "ON_HOLD", "CANCELLED"],
  AWAITING_CUSTOMER_APPROVAL: ["APPROVED", "CANCELLED", "ON_HOLD"],
  APPROVED: ["PARTS_REQUIRED", "READY_FOR_REPAIR", "IN_PROGRESS", "ON_HOLD", "CANCELLED"],
  PARTS_REQUIRED: ["PARTS_ORDERED", "ON_HOLD", "CANCELLED"],
  PARTS_ORDERED: ["READY_FOR_REPAIR", "ON_HOLD", "CANCELLED"],
  READY_FOR_REPAIR: ["IN_PROGRESS", "ON_HOLD", "CANCELLED"],
  IN_PROGRESS: ["QUALITY_CHECK", "ON_HOLD", "CANCELLED"],
  QUALITY_CHECK: ["COMPLETED", "IN_PROGRESS", "ON_HOLD"],
  COMPLETED: ["READY_FOR_COLLECTION", "OUT_FOR_DELIVERY"],
  READY_FOR_COLLECTION: ["COLLECTED", "OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
  ON_HOLD: ["RECEIVED", "DIAGNOSING", "IN_PROGRESS", "CANCELLED"],
  UNREPAIRABLE: ["ARCHIVED", "READY_FOR_COLLECTION"],
  COLLECTED: ["ARCHIVED"],
  DELIVERED: ["ARCHIVED"],
  CANCELLED: ["ARCHIVED"],
  ARCHIVED: [],
};

const TERMINAL = new Set(["COLLECTED", "DELIVERED", "CANCELLED", "ARCHIVED", "UNREPAIRABLE"]);

export function assertRepairTransition(fromStatus, toStatus) {
  const allowed = TRANSITIONS[fromStatus] ?? [];
  if (!allowed.includes(toStatus)) {
    throw new ApiError(HTTP.BAD_REQUEST, `Invalid repair status transition from ${fromStatus} to ${toStatus}`);
  }
}

export function isRepairTerminal(status) {
  return TERMINAL.has(status);
}

export function canEditRepair(status) {
  return !["COLLECTED", "DELIVERED", "ARCHIVED", "CANCELLED"].includes(status);
}
