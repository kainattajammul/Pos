import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";

/** Valid status transitions for branch stock transfers */
const TRANSITIONS = {
  DRAFT: ["REQUESTED", "CANCELLED"],
  REQUESTED: ["PENDING_APPROVAL", "CANCELLED"],
  PENDING_APPROVAL: ["APPROVED", "PARTIALLY_APPROVED", "REJECTED", "CANCELLED"],
  APPROVED: ["READY_FOR_DISPATCH", "DISPATCHED", "CANCELLED"],
  PARTIALLY_APPROVED: ["READY_FOR_DISPATCH", "DISPATCHED", "CANCELLED"],
  READY_FOR_DISPATCH: ["DISPATCHED", "CANCELLED"],
  DISPATCHED: ["PARTIALLY_RECEIVED", "RECEIVED"],
  PARTIALLY_RECEIVED: ["RECEIVED"],
  REJECTED: [],
  RECEIVED: [],
  CANCELLED: [],
};

export function assertTransition(fromStatus, toStatus) {
  const allowed = TRANSITIONS[fromStatus] ?? [];
  if (!allowed.includes(toStatus)) {
    throw new ApiError(
      HTTP.BAD_REQUEST,
      `Invalid transfer status transition from ${fromStatus} to ${toStatus}`,
    );
  }
}

export function isTerminalStatus(status) {
  return ["RECEIVED", "REJECTED", "CANCELLED"].includes(status);
}

export function canEditTransfer(status) {
  return status === "DRAFT";
}

export const TRANSFER_ACTION_STATUS = {
  submit: { from: ["DRAFT"], to: "REQUESTED" },
  request_approval: { from: ["REQUESTED"], to: "PENDING_APPROVAL" },
  approve: { from: ["PENDING_APPROVAL", "REQUESTED"], to: "APPROVED" },
  partial_approve: { from: ["PENDING_APPROVAL", "REQUESTED"], to: "PARTIALLY_APPROVED" },
  reject: { from: ["PENDING_APPROVAL", "REQUESTED", "APPROVED", "PARTIALLY_APPROVED"], to: "REJECTED" },
  ready_dispatch: { from: ["APPROVED", "PARTIALLY_APPROVED"], to: "READY_FOR_DISPATCH" },
  dispatch: { from: ["APPROVED", "PARTIALLY_APPROVED", "READY_FOR_DISPATCH"], to: "DISPATCHED" },
  partial_receive: { from: ["DISPATCHED", "PARTIALLY_RECEIVED"], to: "PARTIALLY_RECEIVED" },
  receive: { from: ["DISPATCHED", "PARTIALLY_RECEIVED"], to: "RECEIVED" },
  cancel: {
    from: ["DRAFT", "REQUESTED", "PENDING_APPROVAL", "APPROVED", "PARTIALLY_APPROVED", "READY_FOR_DISPATCH"],
    to: "CANCELLED",
  },
};

export function resolveActionStatus(action, transfer, itemApprovals) {
  const def = TRANSFER_ACTION_STATUS[action];
  if (!def) throw new ApiError(HTTP.BAD_REQUEST, "Unknown transfer action");

  if (!def.from.includes(transfer.status)) {
    throw new ApiError(HTTP.BAD_REQUEST, `Cannot ${action} transfer in status ${transfer.status}`);
  }

  if (action === "partial_approve") return "PARTIALLY_APPROVED";
  if (action === "partial_receive") return "PARTIALLY_RECEIVED";
  if (action === "approve" && itemApprovals?.some((i) => i.approved_quantity < i.requested_quantity)) {
    return "PARTIALLY_APPROVED";
  }
  return def.to;
}
