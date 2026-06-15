import {
  dayOfWeekFromDb,
  dayOfWeekToDb,
} from "../constants/branchEnums.js";
import { parseTimeToMinutes } from "../utils/branchHelpers.js";

const DAY_INDEX = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

function getZonedParts(date, timeZone) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(date);
  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return {
    weekday: map.weekday?.toLowerCase(),
    hour: Number(map.hour),
    minute: Number(map.minute),
    localTime: `${map.hour}:${map.minute}`,
    localDateTime: `${map.year}-${map.month}-${map.day} ${map.hour}:${map.minute}:00`,
  };
}

function findTodayHours(openingHours, weekday) {
  return openingHours.find((row) => dayOfWeekFromDb(row.dayOfWeek) === weekday);
}

function isWithinRange(minutes, start, end) {
  return minutes >= start && minutes < end;
}

export function validateOpeningHoursSchedule(rows) {
  const errors = [];
  for (const row of rows) {
    const day = row.day_of_week ?? row.dayOfWeek;
    if (!day) {
      errors.push("Each opening hour row requires day_of_week");
      continue;
    }
    if (row.is_closed) continue;

    if (!row.opens_at || !row.closes_at) {
      errors.push(`${day}: opens_at and closes_at are required when not closed`);
      continue;
    }

    const openMin = parseTimeToMinutes(row.opens_at);
    const closeMin = parseTimeToMinutes(row.closes_at);
    if (openMin == null || closeMin == null || closeMin <= openMin) {
      errors.push(`${day}: closes_at must be after opens_at`);
    }

    if (row.break_starts_at || row.break_ends_at) {
      const breakStart = parseTimeToMinutes(row.break_starts_at);
      const breakEnd = parseTimeToMinutes(row.break_ends_at);
      if (breakStart == null || breakEnd == null || breakEnd <= breakStart) {
        errors.push(`${day}: invalid break times`);
      } else if (
        breakStart < openMin ||
        breakEnd > closeMin ||
        breakStart >= breakEnd
      ) {
        errors.push(`${day}: break must fall within opening hours`);
      }
    }
  }
  return errors;
}

export function mapOpeningHoursInput(rows) {
  return rows.map((row) => ({
    dayOfWeek: dayOfWeekToDb(row.day_of_week),
    isClosed: Boolean(row.is_closed),
    opensAt: row.is_closed ? null : row.opens_at,
    closesAt: row.is_closed ? null : row.closes_at,
    breakStartsAt: row.break_starts_at ?? null,
    breakEndsAt: row.break_ends_at ?? null,
  }));
}

/**
 * Determines current branch opening status from record, schedule, closures, and manual override.
 */
export function calculateBranchOpeningStatus(branch, { activeClosure = null, at = new Date() } = {}) {
  const timeZone = branch.timezone || "Europe/London";
  const zoned = getZonedParts(at, timeZone);
  const nowMinutes = zoned.hour * 60 + zoned.minute;

  if (branch.deletedAt || branch.status === "ARCHIVED" || branch.archivedAt) {
    return {
      status: "archived",
      is_open: false,
      reason: "Branch is archived",
      current_local_time: zoned.localDateTime,
      next_change_at: null,
      next_change_type: null,
    };
  }

  if (!branch.isActive || branch.status === "INACTIVE" || branch.status === "DRAFT") {
    return {
      status: "inactive",
      is_open: false,
      reason: "Branch is inactive in the system",
      current_local_time: zoned.localDateTime,
      next_change_at: null,
      next_change_type: null,
    };
  }

  if (branch.manualOpeningStatus) {
    const expiresAt = branch.manualStatusExpiresAt
      ? new Date(branch.manualStatusExpiresAt)
      : null;
    if (!expiresAt || expiresAt > at) {
      const manual = branch.manualOpeningStatus.toLowerCase();
      const isOpen = manual === "open";
      return {
        status: manual,
        is_open: isOpen,
        reason: "Manual opening status override is active",
        current_local_time: zoned.localDateTime,
        next_change_at: expiresAt ? expiresAt.toISOString() : null,
        next_change_type: expiresAt ? "manual_override_expires" : null,
      };
    }
  }

  if (activeClosure) {
    return {
      status: "temporarily_closed",
      is_open: false,
      reason: activeClosure.title || "Branch is closed for a scheduled closure",
      current_local_time: zoned.localDateTime,
      next_change_at: activeClosure.endsAt.toISOString(),
      next_change_type: "closure_ends",
    };
  }

  if (branch.status === "TEMPORARILY_CLOSED") {
    return {
      status: "temporarily_closed",
      is_open: false,
      reason: "Branch status is temporarily closed",
      current_local_time: zoned.localDateTime,
      next_change_at: null,
      next_change_type: null,
    };
  }

  const today = findTodayHours(branch.openingHours ?? [], zoned.weekday);
  if (!today || today.isClosed) {
    return {
      status: "closed",
      is_open: false,
      reason: "Closed today per weekly schedule",
      current_local_time: zoned.localDateTime,
      next_change_at: null,
      next_change_type: "opening",
    };
  }

  const openMin = parseTimeToMinutes(today.opensAt);
  const closeMin = parseTimeToMinutes(today.closesAt);

  if (nowMinutes < openMin) {
    return {
      status: "closed",
      is_open: false,
      reason: "Before opening time",
      current_local_time: zoned.localDateTime,
      next_change_at: `${zoned.localDateTime.split(" ")[0]} ${today.opensAt}:00`,
      next_change_type: "opening",
    };
  }

  if (nowMinutes >= closeMin) {
    return {
      status: "closed",
      is_open: false,
      reason: "After closing time",
      current_local_time: zoned.localDateTime,
      next_change_at: null,
      next_change_type: null,
    };
  }

  const breakStart = parseTimeToMinutes(today.breakStartsAt);
  const breakEnd = parseTimeToMinutes(today.breakEndsAt);
  if (
    breakStart != null &&
    breakEnd != null &&
    isWithinRange(nowMinutes, breakStart, breakEnd)
  ) {
    return {
      status: "closed",
      is_open: false,
      reason: "Currently on a scheduled break",
      current_local_time: zoned.localDateTime,
      next_change_at: `${zoned.localDateTime.split(" ")[0]} ${today.breakEndsAt}:00`,
      next_change_type: "break_ends",
    };
  }

  return {
    status: "open",
    is_open: true,
    reason: "Within normal opening hours",
    current_local_time: zoned.localDateTime,
    next_change_at: `${zoned.localDateTime.split(" ")[0]} ${today.closesAt}:00`,
    next_change_type: "closing",
  };
}

export { DAY_INDEX };
