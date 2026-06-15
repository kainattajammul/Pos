export const PAYMENT_METHOD_LABELS = {
  CASH: "Cash",
  CARD: "Card",
  BANK_TRANSFER: "Bank transfer",
  PAYPAL: "PayPal",
  APPLE_PAY: "Apple Pay",
  GOOGLE_PAY: "Google Pay",
  STORE_CREDIT: "Store credit",
  GIFT_CARD: "Gift card",
  SPLIT: "Split",
  OTHER: "Other",
};

export const PAYMENT_STATUS_LABELS = {
  PENDING: "Pending",
  AUTHORISED: "Authorised",
  PAID: "Paid",
  PARTIALLY_REFUNDED: "Partially refunded",
  REFUNDED: "Refunded",
  FAILED: "Failed",
  CANCELLED: "Cancelled",
  VOIDED: "Voided",
};

export const REFUND_STATUS_LABELS = {
  REQUESTED: "Requested",
  PENDING_APPROVAL: "Pending approval",
  APPROVED: "Approved",
  PROCESSING: "Processing",
  COMPLETED: "Completed",
  PARTIALLY_COMPLETED: "Partially completed",
  REJECTED: "Rejected",
  FAILED: "Failed",
  CANCELLED: "Cancelled",
};

export const INVOICE_STATUS_LABELS = {
  DRAFT: "Draft",
  ISSUED: "Issued",
  PARTIALLY_PAID: "Partially paid",
  PAID: "Paid",
  OVERDUE: "Overdue",
  VOIDED: "Voided",
  CANCELLED: "Cancelled",
  CREDITED: "Credited",
};

export const EXPENSE_STATUS_LABELS = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  PENDING_APPROVAL: "Pending approval",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  PAID: "Paid",
  CANCELLED: "Cancelled",
};

export const REGISTER_SESSION_STATUS_LABELS = {
  OPEN: "Open",
  SUSPENDED: "Suspended",
  PENDING_CLOSE: "Pending close",
  CLOSED: "Closed",
  FORCED_CLOSED: "Forced closed",
};

export const END_OF_DAY_STATUS_LABELS = {
  DRAFT: "Draft",
  PENDING_REVIEW: "Pending review",
  REVIEWED: "Reviewed",
  APPROVED: "Approved",
  CLOSED: "Closed",
  REOPENED: "Reopened",
};

export const OPEN_REGISTER_SESSION_STATUSES = ["OPEN", "SUSPENDED", "PENDING_CLOSE"];

export const COMPLETED_PAYMENT_STATUSES = ["PAID", "PARTIALLY_REFUNDED", "REFUNDED"];

export const COMPLETED_REFUND_STATUSES = ["COMPLETED", "PARTIALLY_COMPLETED"];

export const OPEN_INVOICE_STATUSES = ["DRAFT", "ISSUED", "PARTIALLY_PAID", "OVERDUE"];

export const PNL_EXPENSE_STATUSES = ["APPROVED", "PAID"];
