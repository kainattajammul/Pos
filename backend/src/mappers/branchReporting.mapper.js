import { decimalToString } from "../utils/inventoryDecimal.js";

export function toPublicReportingSettings(settings) {
  return {
    sales_target_monthly: decimalToString(settings.salesTargetMonthly, 2) ?? "0.00",
    repair_target_monthly: settings.repairTargetMonthly ?? 0,
    commission_rules: settings.commissionRules ?? "",
    last_report_generated: settings.lastReportGeneratedAt?.toISOString() ?? null,
    default_comparison_period: settings.defaultComparisonPeriod ?? "previous_month",
  };
}

export function toPublicBranchContext(branch, financeSettings, period) {
  return {
    id: branch.uuid,
    name: branch.name,
    code: branch.branchCode,
    timezone: financeSettings?.timezone ?? branch.timezone ?? "Europe/London",
    currency: financeSettings?.currency ?? "GBP",
    period: period
      ? {
          start: period.dateFrom,
          end: period.dateTo,
          comparisonStart: period.comparisonStart?.toISOString().slice(0, 10) ?? null,
          comparisonEnd: period.comparisonEnd?.toISOString().slice(0, 10) ?? null,
          preset: period.preset,
        }
      : null,
  };
}

export function toKpiMetric(value, previous, options = {}) {
  const isMoney = options.isMoney ?? false;
  const lowerIsBetter = options.lowerIsBetter ?? false;
  const fmt = (v) => (isMoney ? (typeof v === "string" ? v : String(v)) : Number(v));

  let trend = "NOT_AVAILABLE";
  let percentageChange = null;
  let reasonCode = null;

  if (previous == null) {
    reasonCode = "NO_PREVIOUS_DATA";
  } else if (Number(previous) === 0) {
    reasonCode = "NO_PREVIOUS_BASE";
  } else {
    const diff = Number(value) - Number(previous);
    percentageChange = ((diff / Number(previous)) * 100).toFixed(2);
    if (diff > 0) trend = "UP";
    else if (diff < 0) trend = "DOWN";
    else trend = "FLAT";
  }

  let performanceDirection = null;
  if (trend !== "NOT_AVAILABLE") {
    const improved = lowerIsBetter ? trend === "DOWN" : trend === "UP";
    performanceDirection = trend === "FLAT" ? "unchanged" : improved ? "improved" : "declined";
  }

  return {
    value: fmt(value),
    previousValue: previous == null ? null : fmt(previous),
    percentageChange,
    trend,
    performanceDirection,
    reasonCode,
  };
}
