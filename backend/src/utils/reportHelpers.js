import { Prisma } from "@prisma/client";
import { decimalToString } from "./inventoryDecimal.js";

const { Decimal } = Prisma;

export function money(value, places = 2) {
  if (value == null) return "0.00";
  return decimalToString(value, places) ?? "0.00";
}

export function int(value) {
  return Number(value) || 0;
}

export function buildComparison(current, previous, { lowerIsBetter = false } = {}) {
  const cur = current instanceof Decimal ? current : new Decimal(String(current ?? 0));
  const prev = previous instanceof Decimal ? previous : new Decimal(String(previous ?? 0));

  const difference = cur.sub(prev);
  let percentageChange = null;
  let reasonCode = null;

  if (previous == null) {
    reasonCode = "NO_PREVIOUS_DATA";
  } else if (prev.isZero()) {
    reasonCode = "NO_PREVIOUS_BASE";
  } else {
    percentageChange = difference.div(prev).mul(100).toFixed(2);
  }

  let trend = "NOT_AVAILABLE";
  if (percentageChange != null) {
    const pct = Number(percentageChange);
    if (pct > 0) trend = "UP";
    else if (pct < 0) trend = "DOWN";
    else trend = "FLAT";
  }

  let performanceDirection = null;
  if (trend !== "NOT_AVAILABLE") {
    const improved = lowerIsBetter ? trend === "DOWN" : trend === "UP";
    performanceDirection = trend === "FLAT" ? "unchanged" : improved ? "improved" : "declined";
  }

  return {
    current: cur instanceof Decimal && !Number.isInteger(Number(cur)) ? money(cur) : Number(cur),
    previous: previous == null ? null : prev instanceof Decimal && !Number.isInteger(Number(prev)) ? money(prev) : Number(prev),
    difference: cur instanceof Decimal && !Number.isInteger(Number(cur)) ? money(difference) : Number(difference),
    percentageChange,
    trend,
    performanceDirection,
    reasonCode,
  };
}

function localDateParts(date, timezone) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const [y, m, d] = formatter.format(date).split("-").map(Number);
  return { y, m, d };
}

function utcFromLocal(y, m, d, hour = 0, min = 0, sec = 0, ms = 0) {
  return new Date(Date.UTC(y, m - 1, d, hour, min, sec, ms));
}

export function startOfLocalDay(date, timezone) {
  const { y, m, d } = localDateParts(date, timezone);
  return utcFromLocal(y, m, d, 0, 0, 0, 0);
}

export function endOfLocalDay(date, timezone) {
  const start = startOfLocalDay(date, timezone);
  return new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
}

function startOfWeek(date, timezone) {
  const start = startOfLocalDay(date, timezone);
  const day = start.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  return new Date(start.getTime() - diff * 24 * 60 * 60 * 1000);
}

function startOfMonth(date, timezone) {
  const { y, m } = localDateParts(date, timezone);
  return utcFromLocal(y, m, 1);
}

function startOfQuarter(date, timezone) {
  const { y, m } = localDateParts(date, timezone);
  const qMonth = Math.floor((m - 1) / 3) * 3 + 1;
  return utcFromLocal(y, qMonth, 1);
}

function startOfYear(date, timezone) {
  const { y } = localDateParts(date, timezone);
  return utcFromLocal(y, 1, 1);
}

function shiftPeriod(start, end, ms) {
  return { start: new Date(start.getTime() - ms), end: new Date(end.getTime() - ms) };
}

export function resolveReportPeriod(query, timezone = "Europe/London") {
  const now = new Date();
  const preset = query.period || query.preset || "current_month";

  let start;
  let end;
  let comparisonStart = null;
  let comparisonEnd = null;

  switch (preset) {
    case "today":
      start = startOfLocalDay(now, timezone);
      end = endOfLocalDay(now, timezone);
      ({ start: comparisonStart, end: comparisonEnd } = shiftPeriod(start, end, 24 * 60 * 60 * 1000));
      break;
    case "yesterday": {
      const y = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      start = startOfLocalDay(y, timezone);
      end = endOfLocalDay(y, timezone);
      ({ start: comparisonStart, end: comparisonEnd } = shiftPeriod(start, end, 24 * 60 * 60 * 1000));
      break;
    }
    case "current_week":
      start = startOfWeek(now, timezone);
      end = endOfLocalDay(now, timezone);
      ({ start: comparisonStart, end: comparisonEnd } = shiftPeriod(start, end, 7 * 24 * 60 * 60 * 1000));
      break;
    case "previous_week": {
      const w = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      start = startOfWeek(w, timezone);
      end = new Date(startOfWeek(now, timezone).getTime() - 1);
      ({ start: comparisonStart, end: comparisonEnd } = shiftPeriod(start, end, 7 * 24 * 60 * 60 * 1000));
      break;
    }
    case "previous_month": {
      const { y, m } = localDateParts(now, timezone);
      const prevMonth = m === 1 ? 12 : m - 1;
      const prevYear = m === 1 ? y - 1 : y;
      start = utcFromLocal(prevYear, prevMonth, 1);
      end = new Date(utcFromLocal(y, m, 1).getTime() - 1);
      const duration = end.getTime() - start.getTime();
      comparisonEnd = new Date(start.getTime() - 1);
      comparisonStart = new Date(comparisonEnd.getTime() - duration);
      break;
    }
    case "current_quarter":
      start = startOfQuarter(now, timezone);
      end = endOfLocalDay(now, timezone);
      ({ start: comparisonStart, end: comparisonEnd } = shiftPeriod(start, end, 90 * 24 * 60 * 60 * 1000));
      break;
    case "previous_quarter": {
      const qs = startOfQuarter(now, timezone);
      end = new Date(qs.getTime() - 1);
      start = new Date(qs.getTime() - 90 * 24 * 60 * 60 * 1000);
      ({ start: comparisonStart, end: comparisonEnd } = shiftPeriod(start, end, 90 * 24 * 60 * 60 * 1000));
      break;
    }
    case "current_year":
      start = startOfYear(now, timezone);
      end = endOfLocalDay(now, timezone);
      ({ start: comparisonStart, end: comparisonEnd } = shiftPeriod(start, end, 365 * 24 * 60 * 60 * 1000));
      break;
    case "previous_year": {
      const { y } = localDateParts(now, timezone);
      start = utcFromLocal(y - 1, 1, 1);
      end = new Date(utcFromLocal(y, 1, 1).getTime() - 1);
      comparisonStart = utcFromLocal(y - 2, 1, 1);
      comparisonEnd = new Date(utcFromLocal(y - 1, 1, 1).getTime() - 1);
      break;
    }
    case "custom":
      start = query.date_from || query.dateFrom ? new Date(query.date_from || query.dateFrom) : startOfMonth(now, timezone);
      end = query.date_to || query.dateTo ? endOfLocalDay(new Date(query.date_to || query.dateTo), timezone) : endOfLocalDay(now, timezone);
      if (query.comparison_from && query.comparison_to) {
        comparisonStart = new Date(query.comparison_from);
        comparisonEnd = endOfLocalDay(new Date(query.comparison_to), timezone);
      }
      break;
    case "current_month":
    default:
      start = startOfMonth(now, timezone);
      end = endOfLocalDay(now, timezone);
      {
        const { y, m } = localDateParts(now, timezone);
        const prevMonth = m === 1 ? 12 : m - 1;
        const prevYear = m === 1 ? y - 1 : y;
        comparisonStart = utcFromLocal(prevYear, prevMonth, 1);
        comparisonEnd = new Date(start.getTime() - 1);
      }
      break;
  }

  if (query.comparison_period === "none") {
    comparisonStart = null;
    comparisonEnd = null;
  }

  return {
    preset,
    start,
    end,
    comparisonStart,
    comparisonEnd,
    timezone,
    dateFrom: start.toISOString().slice(0, 10),
    dateTo: end.toISOString().slice(0, 10),
  };
}

export function emptyReportMeta(period, currency) {
  return {
    dateFrom: period.dateFrom,
    dateTo: period.dateTo,
    timezone: period.timezone,
    currency,
    calculatedAt: new Date().toISOString(),
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  };
}

export function noDataWarning() {
  return [{ code: "NO_DATA_FOR_PERIOD", message: "No branch activity was found for the selected period." }];
}

export function reportMeta(period, currency, pagination = {}) {
  return {
    ...emptyReportMeta(period, currency),
    ...pagination,
  };
}

export const COMPLETED_SALE_STATUSES = ["COMPLETED", "PARTIALLY_REFUNDED", "REFUNDED"];
export const COMPLETED_REPAIR_STATUSES = ["COMPLETED", "COLLECTED", "DELIVERED"];
export const ELIGIBLE_REPAIR_STATUSES = ["COMPLETED", "COLLECTED", "DELIVERED", "READY_FOR_COLLECTION", "CANCELLED", "UNREPAIRABLE"];
