import { prisma } from "../config/database.js";
import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { dayOfWeekFromDb } from "../constants/branchEnums.js";
import { BranchOperationsModel } from "../models/branchOperations.model.js";
import { ensureBranch } from "./branchOperationsSettings.service.js";
import { parseTimeToMinutes } from "../utils/branchHelpers.js";
import { getRepairAvailabilityForDate } from "./branchRepairCapacity.service.js";

const JS_DAY_TO_PRISMA = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

const BLOCKING_APPOINTMENT_STATUSES = ["PENDING", "CONFIRMED", "CHECKED_IN", "IN_PROGRESS"];

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function buildSlotTimes(opensAt, closesAt, breakStart, breakEnd, durationMinutes) {
  const openMin = parseTimeToMinutes(opensAt);
  const closeMin = parseTimeToMinutes(closesAt);
  if (openMin == null || closeMin == null || closeMin <= openMin) return [];

  const breakStartMin = parseTimeToMinutes(breakStart);
  const breakEndMin = parseTimeToMinutes(breakEnd);
  const slots = [];

  for (let start = openMin; start + durationMinutes <= closeMin; start += durationMinutes) {
    const end = start + durationMinutes;
    if (breakStartMin != null && breakEndMin != null) {
      const overlapsBreak = start < breakEndMin && end > breakStartMin;
      if (overlapsBreak) continue;
    }
    slots.push({ startMinutes: start, endMinutes: end });
  }

  return slots;
}

function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function slotToDateTime(dayStart, minutes) {
  const d = new Date(dayStart);
  d.setMinutes(d.getMinutes() + minutes);
  return d;
}

function appointmentsOverlap(slotStart, slotEnd, appointments) {
  return appointments.filter((a) => a.startsAt < slotEnd && a.endsAt > slotStart).length;
}

export async function getAvailableSlots({
  shopId,
  branchUuid,
  date,
  durationMinutes,
  appointmentType,
  deviceCategory,
}) {
  const branch = await ensureBranch(shopId, branchUuid);
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  const closure = await prisma.branchClosure.findFirst({
    where: {
      branchId: branch.id,
      shopId: Number(shopId),
      startsAt: { lte: dayEnd },
      endsAt: { gte: dayStart },
    },
  });
  if (closure) {
    return {
      date: dayStart.toISOString().slice(0, 10),
      is_available: false,
      reason: closure.title ?? "Branch is closed",
      slots: [],
    };
  }

  const prismaDay = JS_DAY_TO_PRISMA[dayStart.getDay()];
  const openingHour = await prisma.branchOpeningHour.findFirst({
    where: { branchId: branch.id, shopId: Number(shopId), dayOfWeek: prismaDay },
  });

  if (!openingHour || openingHour.isClosed || !openingHour.opensAt || !openingHour.closesAt) {
    return {
      date: dayStart.toISOString().slice(0, 10),
      is_available: false,
      reason: "Branch is closed on this day",
      slots: [],
    };
  }

  const settings = await BranchOperationsModel.getOperationSettings(branch.id, shopId);
  const repairAvailability = await getRepairAvailabilityForDate({
    shopId,
    branchUuid,
    date: dayStart,
    deviceCategory,
  });

  const slotDuration =
    durationMinutes ??
    repairAvailability.default_duration_minutes ??
    30;

  const candidateSlots = buildSlotTimes(
    openingHour.opensAt,
    openingHour.closesAt,
    openingHour.breakStartsAt,
    openingHour.breakEndsAt,
    slotDuration,
  );

  const appointments = await prisma.branchAppointment.findMany({
    where: {
      branchId: branch.id,
      shopId: Number(shopId),
      startsAt: { gte: dayStart, lte: dayEnd },
      status: { in: BLOCKING_APPOINTMENT_STATUSES },
    },
    select: { startsAt: true, endsAt: true },
  });

  const maxSlotsPerDay = settings.appointmentSlotsPerDay;
  const walkInReserve = settings.walkInReserveSlots ?? 0;
  const bookableCapacity = Math.max(0, maxSlotsPerDay - walkInReserve);
  const bookedCount = appointments.length;

  const slots = candidateSlots.map((slot) => {
    const startsAt = slotToDateTime(dayStart, slot.startMinutes);
    const endsAt = slotToDateTime(dayStart, slot.endMinutes);
    const overlapCount = appointmentsOverlap(startsAt, endsAt, appointments);

    let available = overlapCount === 0;
    let reason = null;

    if (bookedCount >= bookableCapacity) {
      available = false;
      reason = "Daily appointment capacity reached";
    } else if (overlapCount > 0) {
      available = false;
      reason = "Slot already booked";
    } else if (
      appointmentType &&
      ["DEVICE_DROPOFF", "IN_STORE"].includes(appointmentType.toUpperCase()) &&
      !repairAvailability.can_accept_new_repair
    ) {
      available = false;
      reason = "Repair capacity limit reached";
    }

    return {
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      start_time: minutesToTime(slot.startMinutes),
      end_time: minutesToTime(slot.endMinutes),
      duration_minutes: slotDuration,
      is_available: available,
      unavailable_reason: reason,
    };
  });

  return {
    date: dayStart.toISOString().slice(0, 10),
    day_of_week: dayOfWeekFromDb(prismaDay),
    is_available: slots.some((s) => s.is_available),
    opening_hours: {
      opens_at: openingHour.opensAt,
      closes_at: openingHour.closesAt,
      break_starts_at: openingHour.breakStartsAt,
      break_ends_at: openingHour.breakEndsAt,
    },
    capacity: {
      slots_per_day: maxSlotsPerDay,
      walk_in_reserve: walkInReserve,
      booked: bookedCount,
      remaining: Math.max(0, bookableCapacity - bookedCount),
    },
    repair_capacity: repairAvailability,
    slots,
  };
}

export async function assertSlotAvailable({
  shopId,
  branchUuid,
  startsAt,
  endsAt,
  appointmentType,
  deviceCategory,
  excludeAppointmentId,
}) {
  const availability = await getAvailableSlots({
    shopId,
    branchUuid,
    date: startsAt,
    durationMinutes: Math.round((new Date(endsAt) - new Date(startsAt)) / 60000),
    appointmentType,
    deviceCategory,
  });

  const match = availability.slots.find((s) => {
    const slotStart = new Date(s.starts_at).getTime();
    const requestedStart = new Date(startsAt).getTime();
    return Math.abs(slotStart - requestedStart) < 60000 && s.is_available;
  });

  if (!match) {
    const overlapping = await prisma.branchAppointment.findFirst({
      where: {
        branchId: (await ensureBranch(shopId, branchUuid)).id,
        shopId: Number(shopId),
        id: excludeAppointmentId ? { not: Number(excludeAppointmentId) } : undefined,
        status: { in: BLOCKING_APPOINTMENT_STATUSES },
        startsAt: { lt: new Date(endsAt) },
        endsAt: { gt: new Date(startsAt) },
      },
    });
    if (overlapping) {
      throw new ApiError(HTTP.CONFLICT, "Selected time slot is no longer available");
    }
    throw new ApiError(HTTP.BAD_REQUEST, availability.reason ?? "Selected time slot is not available");
  }

  return true;
}
