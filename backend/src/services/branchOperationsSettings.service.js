import { prisma } from "../config/database.js";
import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { BranchOperationsModel } from "../models/branchOperations.model.js";
import { toPublicOperationsSettings } from "../mappers/branchOperations.mapper.js";
import { writeAuditLog } from "./auditLog.service.js";
import { getClientMeta } from "../utils/branchHelpers.js";
import { decimalToString } from "../utils/inventoryDecimal.js";
import { Prisma } from "@prisma/client";

async function ensureBranch(shopId, branchUuid) {
  const branch = await BranchOperationsModel.ensureBranch(shopId, branchUuid);
  if (!branch) throw new ApiError(HTTP.NOT_FOUND, "Branch not found");
  return branch;
}

async function computeStats(branchId, shopId) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [salesAgg, openRepairs, openClaims] = await Promise.all([
    prisma.branchSale.aggregate({
      where: {
        branchId,
        shopId,
        status: "COMPLETED",
        completedAt: { gte: todayStart },
      },
      _sum: { total: true },
    }),
    prisma.branchRepairTicket.count({
      where: {
        branchId,
        shopId,
        archivedAt: null,
        status: { notIn: ["COMPLETED", "COLLECTED", "DELIVERED", "CANCELLED", "ARCHIVED"] },
      },
    }),
    prisma.branchWarrantyClaim.count({
      where: {
        branchId,
        shopId,
        status: { in: ["SUBMITTED", "UNDER_REVIEW", "INSPECTION_REQUIRED", "APPROVED", "REPAIR_IN_PROGRESS"] },
      },
    }),
  ]);

  return {
    salesToday: salesAgg._sum.total ?? new Prisma.Decimal(0),
    openRepairTickets: openRepairs,
    warrantyClaimsOpen: openClaims,
  };
}

export async function getOperationsSettings({ shopId, branchUuid }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const settings = await BranchOperationsModel.getOperationSettings(branch.id, shopId);
  const stats = await computeStats(branch.id, Number(shopId));
  return toPublicOperationsSettings(settings, stats);
}

export async function updateOperationsSettings({ shopId, branchUuid, input, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  await BranchOperationsModel.getOperationSettings(branch.id, shopId);

  const data = {};
  if (input.appointment_slots_per_day != null) data.appointmentSlotsPerDay = input.appointment_slots_per_day;
  if (input.pickup_enabled != null) data.pickupEnabled = input.pickup_enabled;
  if (input.delivery_radius_km != null) data.deliveryRadiusKm = input.delivery_radius_km;
  if (input.walk_in_reserve_slots != null) data.walkInReserveSlots = input.walk_in_reserve_slots;

  const updated = await prisma.branchOperationSettings.update({
    where: { branchId: branch.id },
    data,
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_operations.settings.updated",
    entity: "branch_operation_settings",
    entityId: String(branch.id),
    newValues: input,
    ...getClientMeta(req),
  });

  const stats = await computeStats(branch.id, Number(shopId));
  return toPublicOperationsSettings(updated, stats);
}

export { ensureBranch, computeStats };
