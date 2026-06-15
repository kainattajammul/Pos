import { REPORT_REGISTRY, REPORT_GROUPING_INTERVALS, REPORT_PERIOD_PRESETS } from "../constants/branchReportingPermissions.js";

export function listAvailableReports(permissionMap = {}) {
  const has = (key) => permissionMap.all || permissionMap[key] === true;

  return REPORT_REGISTRY.filter((report) => has(report.permission)).map((report) => ({
    code: report.code,
    name: report.name,
    description: report.description,
    supports_comparison: report.supportsComparison,
    supports_export: report.supportsExport,
    includes_cost_data: report.includesCostData,
    includes_pii: report.includesPii,
    available_actions: {
      canView: true,
      canExport: report.supportsExport,
    },
  }));
}

export function getReportFilters() {
  return {
    period_presets: REPORT_PERIOD_PRESETS,
    grouping_intervals: REPORT_GROUPING_INTERVALS,
    comparison_periods: ["previous_period", "previous_week", "previous_month", "previous_quarter", "previous_year", "custom", "none"],
    sale_statuses: ["COMPLETED", "PARTIALLY_REFUNDED", "REFUNDED", "CANCELLED", "VOIDED"],
    repair_statuses: ["DRAFT", "RECEIVED", "DIAGNOSING", "AWAITING_APPROVAL", "IN_PROGRESS", "COMPLETED", "READY_FOR_COLLECTION", "COLLECTED", "CANCELLED"],
    payment_methods: ["CASH", "CARD", "BANK_TRANSFER", "PAYPAL", "APPLE_PAY", "GOOGLE_PAY", "STORE_CREDIT", "GIFT_CARD", "SPLIT", "OTHER"],
    payment_statuses: ["PENDING", "PAID", "FAILED", "CANCELLED", "VOIDED", "REFUNDED"],
  };
}
