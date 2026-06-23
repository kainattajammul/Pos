import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { REPORT_GROUPING_INTERVALS } from "../constants/branchReportingPermissions.js";
import { resolveReportPeriod } from "../utils/reportHelpers.js";

const SORT_ALLOWLIST = {
  sales: ["completed_at", "total", "sale_number", "created_at"],
  repairs: ["created_at", "completed_at", "ticket_number", "status"],
  payments: ["paid_at", "amount", "payment_number"],
  inventory: ["created_at", "quantity"],
  cash_drawers: ["opened_at", "cash_difference", "closed_at"],
  staff: ["sales_revenue", "repairs_completed"],
};

const MAX_RANGE_DAYS = {
  hour: 31,
  day: 730,
  week: 1825,
  month: 3650,
  quarter: 3650,
  year: 3650,
};

export function parseReportFilters(query, timezone = "Europe/London") {
  const period = resolveReportPeriod(query, timezone);
  const groupBy = String(query.group_by || query.groupBy || "day").toLowerCase();

  if (!REPORT_GROUPING_INTERVALS.includes(groupBy)) {
    throw new ApiError(HTTP.BAD_REQUEST, `Invalid grouping interval: ${groupBy}`);
  }

  const rangeDays = (period.end.getTime() - period.start.getTime()) / (24 * 60 * 60 * 1000);
  const maxDays = MAX_RANGE_DAYS[groupBy] ?? MAX_RANGE_DAYS.day;
  if (rangeDays > maxDays) {
    throw new ApiError(
      HTTP.BAD_REQUEST,
      `Date range exceeds maximum of ${maxDays} days for ${groupBy} grouping`,
    );
  }

  const sort = query.sort || query.sortBy || null;
  const direction = String(query.direction || query.sortDirection || "desc").toLowerCase() === "asc" ? "asc" : "desc";

  return {
    period,
    groupBy,
    sort,
    direction,
    filters: {
      channel: query.channel ? String(query.channel).toUpperCase() : null,
      status: query.status ? String(query.status).toUpperCase() : null,
      payment_method: query.payment_method ? String(query.payment_method).toUpperCase() : null,
      staff_id: query.staff_id ? Number(query.staff_id) : null,
      technician_id: query.technician_id ? Number(query.technician_id) : null,
      register_id: query.register_id ? Number(query.register_id) : null,
      customer_id: query.customer_id ? Number(query.customer_id) : null,
      search: query.search ? String(query.search).trim() : null,
      overdue_only: query.overdue_only === "true",
      discrepancy_only: query.discrepancy_only === "true",
    },
  };
}

export function resolveSortField(reportType, sortField, direction) {
  const allowed = SORT_ALLOWLIST[reportType] ?? ["created_at"];
  const field = sortField ? String(sortField).toLowerCase() : allowed[0];
  if (!allowed.includes(field)) {
    throw new ApiError(HTTP.BAD_REQUEST, `Invalid sort field: ${field}`);
  }

  const prismaFieldMap = {
    completed_at: "completedAt",
    created_at: "createdAt",
    paid_at: "paidAt",
    opened_at: "openedAt",
    closed_at: "closedAt",
    sale_number: "saleNumber",
    ticket_number: "ticketNumber",
    payment_number: "paymentNumber",
    cash_difference: "cashDifference",
    total: "total",
    amount: "amount",
    status: "status",
    quantity: "quantity",
  };

  return { [prismaFieldMap[field] ?? field]: direction };
}
