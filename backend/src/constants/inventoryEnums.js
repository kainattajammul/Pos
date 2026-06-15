export const TRANSFER_STATUS_LABELS = {
  DRAFT: "Draft",
  REQUESTED: "Requested",
  PENDING_APPROVAL: "Pending Approval",
  APPROVED: "Approved",
  PARTIALLY_APPROVED: "Partially Approved",
  REJECTED: "Rejected",
  READY_FOR_DISPATCH: "Ready for Dispatch",
  DISPATCHED: "Dispatched",
  PARTIALLY_RECEIVED: "Partially Received",
  RECEIVED: "Received",
  CANCELLED: "Cancelled",
};

export const VALUATION_METHOD_API = {
  WEIGHTED_AVERAGE: "weighted_average",
  LATEST_PURCHASE_COST: "latest_purchase_cost",
  STANDARD_COST: "standard_cost",
  FIFO: "fifo",
};

export const ALLOCATION_MODE_API = {
  SHARED: "shared",
  DEDICATED: "dedicated",
};

export const ALERT_SEVERITY = {
  LOW_STOCK: "medium",
  OUT_OF_STOCK: "high",
  OVERSTOCK: "low",
  NEGATIVE_STOCK: "critical",
  REORDER_REQUIRED: "medium",
};
