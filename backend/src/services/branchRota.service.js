import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { prisma } from "../config/database.js";
import { BranchModel } from "../models/branch.model.js";
import { BranchShiftModel, BranchStaffModel } from "../models/branchStaff.model.js";
import { shiftStatusToDb } from "../constants/branchStaffEnums.js";
import { writeAuditLog } from "./auditLog.service.js";
import { toPublicShift } from "../utils/branchStaffMapper.js";
import { ACTIVE_STAFF_STATUSES } from "../constants/branchStaffEnums.js";

async function ensureBranch(shopId, branchUuid) {
  const branch = await BranchModel.findByUuid(branchUuid, shopId);
  if (!branch) throw new ApiError(HTTP.NOT_FOUND, "Branch not found");
  return branch;
}

function parseShiftBounds(payload, branchTimezone = "Europe/London") {
  void branchTimezone;
  const startsAt = new Date(payload.starts_at);
  const endsAt = new Date(payload.ends_at);
  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime()) || endsAt <= startsAt) {
    throw new ApiError(HTTP.BAD_REQUEST, "Shift end must be after start");
  }
  const shiftDate = payload.shift_date
    ? new Date(`${payload.shift_date}T00:00:00.000Z`)
    : new Date(startsAt.toISOString().slice(0, 10));
  return { startsAt, endsAt, shiftDate };
}

async function assertStaffCanBeScheduled(assignment) {
  if (!assignment || !ACTIVE_STAFF_STATUSES.includes(assignment.status) || assignment.archivedAt) {
    throw new ApiError(HTTP.CONFLICT, "Cannot schedule inactive or archived staff");
  }
  const now = new Date();
  if (assignment.startDate && assignment.startDate > now) {
    throw new ApiError(HTTP.CONFLICT, "Staff assignment has not started yet");
  }
  if (assignment.endDate && assignment.endDate < now) {
    throw new ApiError(HTTP.CONFLICT, "Staff assignment has ended");
  }
}

async function assertNoOverlap(assignment, shopId, startsAt, endsAt, excludeShiftId) {
  const overlap = await BranchShiftModel.findOverlapping(
    assignment.id,
    shopId,
    startsAt,
    endsAt,
    excludeShiftId,
  );
  if (overlap) {
    throw new ApiError(HTTP.CONFLICT, "Shift overlaps with an existing shift for this staff member");
  }

  const crossBranch = await BranchShiftModel.findCrossBranchOverlap(
    assignment.userId,
    shopId,
    startsAt,
    endsAt,
    excludeShiftId,
  );
  if (crossBranch) {
    throw new ApiError(
      HTTP.CONFLICT,
      `Staff member is already scheduled at ${crossBranch.branch.name} during this time`,
    );
  }
}

export async function listRota(shopId, branchUuid, query) {
  const branch = await ensureBranch(shopId, branchUuid);
  const where = {};
  if (query.from) where.startsAt = { gte: new Date(query.from) };
  if (query.to) where.endsAt = { lte: new Date(query.to) };
  if (query.status) where.status = shiftStatusToDb(query.status);
  if (query.staff_assignment_id) {
    const assignment = await BranchStaffModel.findByUuid(
      query.staff_assignment_id,
      branch.id,
      shopId,
    );
    if (assignment) where.staffAssignmentId = assignment.id;
  }
  if (query.role) {
    where.staffAssignment = { roles: { some: { role: { code: String(query.role) } } } };
  }

  const shifts = await BranchShiftModel.list({
    branchId: branch.id,
    shopId,
    where,
    orderBy: { startsAt: "asc" },
  });

  const mapped = shifts.map(toPublicShift);
  const totals = mapped.reduce(
    (acc, shift) => {
      acc.total_scheduled_hours += shift.total_scheduled_hours;
      acc.total_break_minutes += shift.break_minutes;
      acc.payable_hours += shift.payable_hours;
      return acc;
    },
    { total_scheduled_hours: 0, total_break_minutes: 0, payable_hours: 0 },
  );

  return { shifts: mapped, totals };
}

export async function createShift(shopId, branchUuid, payload, auditContext) {
  const branch = await ensureBranch(shopId, branchUuid);
  const assignment = await BranchStaffModel.findByUuid(
    payload.staff_assignment_id,
    branch.id,
    shopId,
  );
  if (!assignment) throw new ApiError(HTTP.NOT_FOUND, "Staff assignment not found");
  await assertStaffCanBeScheduled(assignment);

  const { startsAt, endsAt, shiftDate } = parseShiftBounds(payload, branch.timezone);
  await assertNoOverlap(assignment, shopId, startsAt, endsAt);

  const shift = await BranchShiftModel.create({
    shopId: Number(shopId),
    branchId: branch.id,
    staffAssignmentId: assignment.id,
    title: payload.title ?? null,
    shiftDate,
    startsAt,
    endsAt,
    breakMinutes: Number(payload.break_minutes) || 0,
    status: shiftStatusToDb(payload.status ?? "draft"),
    notes: payload.notes ?? null,
    createdById: auditContext.userId ?? null,
    updatedById: auditContext.userId ?? null,
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId: auditContext.userId,
    action: "branch_rota.shift.created",
    entity: "branch_staff_shift",
    entityId: shift.uuid,
    newValues: payload,
    ipAddress: auditContext.ipAddress,
    userAgent: auditContext.userAgent,
  });

  return toPublicShift({ ...shift, staffAssignment: assignment });
}

export async function updateShift(shopId, branchUuid, shiftUuid, payload, auditContext) {
  const branch = await ensureBranch(shopId, branchUuid);
  const existing = await BranchShiftModel.findByUuid(shiftUuid, branch.id, shopId);
  if (!existing) throw new ApiError(HTTP.NOT_FOUND, "Shift not found");

  const startsAt = payload.starts_at ? new Date(payload.starts_at) : existing.startsAt;
  const endsAt = payload.ends_at ? new Date(payload.ends_at) : existing.endsAt;
  if (endsAt <= startsAt) throw new ApiError(HTTP.BAD_REQUEST, "Shift end must be after start");

  await assertNoOverlap(existing.staffAssignment, shopId, startsAt, endsAt, existing.id);

  const shift = await BranchShiftModel.update(existing.id, shopId, {
    ...(payload.title !== undefined ? { title: payload.title } : {}),
    ...(payload.starts_at ? { startsAt } : {}),
    ...(payload.ends_at ? { endsAt } : {}),
    ...(payload.break_minutes !== undefined ? { breakMinutes: Number(payload.break_minutes) } : {}),
    ...(payload.notes !== undefined ? { notes: payload.notes } : {}),
    ...(payload.status ? { status: shiftStatusToDb(payload.status) } : {}),
    updatedById: auditContext.userId ?? null,
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId: auditContext.userId,
    action: "branch_rota.shift.updated",
    entity: "branch_staff_shift",
    entityId: shift.uuid,
    oldValues: existing,
    newValues: shift,
    ipAddress: auditContext.ipAddress,
    userAgent: auditContext.userAgent,
  });

  return toPublicShift(shift);
}

export async function deleteShift(shopId, branchUuid, shiftUuid, auditContext) {
  const branch = await ensureBranch(shopId, branchUuid);
  const existing = await BranchShiftModel.findByUuid(shiftUuid, branch.id, shopId);
  if (!existing) throw new ApiError(HTTP.NOT_FOUND, "Shift not found");

  await BranchShiftModel.update(existing.id, shopId, {
    status: "CANCELLED",
    updatedById: auditContext.userId ?? null,
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId: auditContext.userId,
    action: "branch_rota.shift.cancelled",
    entity: "branch_staff_shift",
    entityId: existing.uuid,
    ipAddress: auditContext.ipAddress,
    userAgent: auditContext.userAgent,
  });
}

export async function publishRota(shopId, branchUuid, payload, auditContext) {
  const branch = await ensureBranch(shopId, branchUuid);
  const where = {
    status: "DRAFT",
    ...(payload.from ? { startsAt: { gte: new Date(payload.from) } } : {}),
    ...(payload.to ? { endsAt: { lte: new Date(payload.to) } } : {}),
  };

  const result = await prisma.$transaction(async (tx) => {
    const drafts = await tx.branchStaffShift.findMany({
      where: { branchId: branch.id, shopId: Number(shopId), ...where },
    });
    await tx.branchStaffShift.updateMany({
      where: { id: { in: drafts.map((d) => d.id) } },
      data: {
        status: "PUBLISHED",
        publishedAt: new Date(),
        publishedById: auditContext.userId ?? null,
      },
    });
    return drafts.length;
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId: auditContext.userId,
    action: "branch_rota.published",
    entity: "branch_rota",
    entityId: branch.uuid,
    newValues: { published_count: result },
    ipAddress: auditContext.ipAddress,
    userAgent: auditContext.userAgent,
  });

  return { published_count: result };
}

export async function copyWeekRota(shopId, branchUuid, payload, auditContext) {
  const branch = await ensureBranch(shopId, branchUuid);
  const sourceStart = new Date(payload.source_week_start);
  const targetStart = new Date(payload.target_week_start);
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const sourceEnd = new Date(sourceStart.getTime() + weekMs);

  const sourceShifts = await BranchShiftModel.list({
    branchId: branch.id,
    shopId,
    where: {
      startsAt: { gte: sourceStart, lt: sourceEnd },
      status: { in: ["PUBLISHED", "CONFIRMED", "DRAFT"] },
    },
    orderBy: { startsAt: "asc" },
  });

  const offset = targetStart.getTime() - sourceStart.getTime();
  const created = [];

  await prisma.$transaction(async () => {
    for (const shift of sourceShifts) {
      const startsAt = new Date(shift.startsAt.getTime() + offset);
      const endsAt = new Date(shift.endsAt.getTime() + offset);
      await assertNoOverlap(
        await BranchStaffModel.findById(shift.staffAssignmentId, branch.id, shopId),
        shopId,
        startsAt,
        endsAt,
      );
      const row = await BranchShiftModel.create({
        shopId: Number(shopId),
        branchId: branch.id,
        staffAssignmentId: shift.staffAssignmentId,
        title: shift.title,
        shiftDate: new Date(startsAt.toISOString().slice(0, 10)),
        startsAt,
        endsAt,
        breakMinutes: shift.breakMinutes,
        status: "DRAFT",
        notes: shift.notes,
        createdById: auditContext.userId ?? null,
        updatedById: auditContext.userId ?? null,
      });
      created.push(row);
    }
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId: auditContext.userId,
    action: "branch_rota.week_copied",
    entity: "branch_rota",
    entityId: branch.uuid,
    newValues: { copied_count: created.length },
    ipAddress: auditContext.ipAddress,
    userAgent: auditContext.userAgent,
  });

  return { copied_count: created.length, shifts: created.map(toPublicShift) };
}
