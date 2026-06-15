import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { prisma } from "../config/database.js";
import { BranchModel } from "../models/branch.model.js";
import { BranchPerformanceModel, BranchShiftModel, BranchStaffModel } from "../models/branchStaff.model.js";
import { periodTypeToDb } from "../constants/branchStaffEnums.js";
import { toPublicPerformance } from "../utils/branchStaffMapper.js";

async function ensureBranch(shopId, branchUuid) {
  const branch = await BranchModel.findByUuid(branchUuid, shopId);
  if (!branch) throw new ApiError(HTTP.NOT_FOUND, "Branch not found");
  return branch;
}

function buildPerformanceWhere(query) {
  const where = {};
  if (query.from) where.periodStart = { gte: new Date(query.from) };
  if (query.to) where.periodEnd = { lte: new Date(query.to) };
  if (query.period_type) where.periodType = periodTypeToDb(query.period_type);
  if (query.role) {
    where.staffAssignment = { roles: { some: { role: { code: String(query.role) } } } };
  }
  return where;
}

async function computeScheduledHours(staffAssignmentId, shopId, branchId, periodStart, periodEnd) {
  const shifts = await BranchShiftModel.list({
    branchId,
    shopId,
    where: {
      staffAssignmentId: Number(staffAssignmentId),
      startsAt: { gte: periodStart },
      endsAt: { lte: periodEnd },
      status: { in: ["PUBLISHED", "CONFIRMED", "COMPLETED"] },
    },
    orderBy: { startsAt: "asc" },
  });

  return shifts.reduce((sum, shift) => {
    const hours = (shift.endsAt - shift.startsAt) / 3600000 - (shift.breakMinutes ?? 0) / 60;
    return sum + Math.max(0, hours);
  }, 0);
}

export async function listBranchPerformance(shopId, branchUuid, query) {
  const branch = await ensureBranch(shopId, branchUuid);
  const where = buildPerformanceWhere(query);

  let rows = await BranchPerformanceModel.list({
    branchId: branch.id,
    shopId,
    where,
    orderBy: { periodStart: "desc" },
  });

  if (!rows.length && query.auto_calculate !== "false") {
    const assignments = await BranchStaffModel.list({
      branchId: branch.id,
      shopId,
      where: { archivedAt: null },
      orderBy: { createdAt: "asc" },
    });

    const periodStart = query.from ? new Date(query.from) : new Date(new Date().setDate(1));
    const periodEnd = query.to ? new Date(query.to) : new Date();

    rows = await Promise.all(
      assignments.map(async (assignment) => {
        const scheduledHours = await computeScheduledHours(
          assignment.id,
          shopId,
          branch.id,
          periodStart,
          periodEnd,
        );
        return BranchPerformanceModel.upsert({
          shopId: Number(shopId),
          branchId: branch.id,
          staffAssignmentId: assignment.id,
          periodType: periodTypeToDb(query.period_type ?? "monthly"),
          periodStart,
          periodEnd,
          scheduledHours,
          workedHours: null,
          attendanceRate: null,
          salesCount: 0,
          salesValue: null,
          repairsAssigned: 0,
          repairsCompleted: 0,
          repairSuccessRate: null,
          refundsCount: 0,
          customerRating: null,
          targetValue: null,
          achievedValue: null,
          targetPercentage: null,
          calculatedAt: new Date(),
        });
      }),
    );
  }

  return rows.map(toPublicPerformance);
}

export async function getStaffPerformance(shopId, branchUuid, assignmentUuid, query) {
  const branch = await ensureBranch(shopId, branchUuid);
  const assignment = await BranchStaffModel.findByUuid(assignmentUuid, branch.id, shopId);
  if (!assignment) throw new ApiError(HTTP.NOT_FOUND, "Staff assignment not found");

  const where = buildPerformanceWhere(query);
  const rows = await BranchPerformanceModel.findForAssignment(assignment.id, shopId, where);
  return rows.map(toPublicPerformance);
}
