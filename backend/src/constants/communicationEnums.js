export const COMMUNICATION_STATUS_LABELS = {
  QUEUED: "Queued",
  PROCESSING: "Processing",
  SENT: "Sent",
  DELIVERED: "Delivered",
  FAILED: "Failed",
  BOUNCED: "Bounced",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
};

export const COMMUNICATION_CHANNEL_LABELS = {
  EMAIL: "Email",
  SMS: "SMS",
  PUSH: "Push",
  IN_APP: "In-app",
};

export const SENDER_VERIFICATION_LABELS = {
  PENDING: "Pending",
  VERIFIED: "Verified",
  FAILED: "Failed",
  DISABLED: "Disabled",
};

export const NOTIFICATION_EVENTS = [
  "APPOINTMENT_CREATED",
  "APPOINTMENT_CONFIRMED",
  "APPOINTMENT_REMINDER",
  "APPOINTMENT_RESCHEDULED",
  "APPOINTMENT_CANCELLED",
  "REPAIR_CREATED",
  "REPAIR_RECEIVED",
  "REPAIR_DIAGNOSIS_READY",
  "REPAIR_APPROVAL_REQUIRED",
  "REPAIR_STATUS_CHANGED",
  "REPAIR_COMPLETED",
  "REPAIR_READY_FOR_COLLECTION",
  "REPAIR_COLLECTED",
  "PAYMENT_RECEIVED",
  "PAYMENT_FAILED",
  "REFUND_REQUESTED",
  "REFUND_APPROVED",
  "REFUND_REJECTED",
  "REFUND_COMPLETED",
  "INVOICE_ISSUED",
  "INVOICE_PARTIALLY_PAID",
  "INVOICE_PAID",
  "INVOICE_OVERDUE",
  "PICKUP_SCHEDULED",
  "PICKUP_COMPLETED",
  "DELIVERY_DISPATCHED",
  "DELIVERY_COMPLETED",
  "DELIVERY_FAILED",
  "WARRANTY_CREATED",
  "WARRANTY_CLAIM_SUBMITTED",
  "WARRANTY_CLAIM_APPROVED",
  "WARRANTY_CLAIM_REJECTED",
  "WARRANTY_CLAIM_COMPLETED",
];

export const TEMPLATE_VARIABLES = {
  customer: ["first_name", "last_name", "full_name"],
  branch: ["name", "phone", "email", "address"],
  appointment: ["number", "date", "time", "service"],
  repair: ["ticket_number", "device", "status", "estimated_completion", "collection_link"],
  sale: ["number", "total"],
  payment: ["number", "amount", "method"],
  invoice: ["number", "issue_date", "due_date", "total", "amount_due", "download_link"],
  refund: ["number", "amount", "status"],
  warranty: ["number", "expiry_date"],
  delivery: ["tracking_number", "tracking_link"],
};
