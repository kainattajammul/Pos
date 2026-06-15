import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { BranchClosureModel, BranchModel } from "../models/branch.model.js";
import { closureTypeToDb } from "../constants/branchEnums.js";
import { writeAuditLog } from "./auditLog.service.js";
import { normalizeText } from "../utils/branchHelpers.js";

async function resolveBranchOrThrow(shopId, branchUuidOrId) {
  const branch = await BranchModel.resolveByIdentifier(branchUuidOrId, shopId);
  if (!branch) throw new ApiError(HTTP.NOT_FOUND, "Branch not found");
  return branch;
}

function assertBranchAllowsClosureOps(branch) {
  if (branch.status === "ARCHIVED" || branch.archivedAt) {
    throw new ApiError(HTTP.CONFLICT, "Archived branches cannot manage closures until restored");
  }
}

export async function listBranchClosures(shopId, branchUuid) {
  const branch = await resolveBranchOrThrow(shopId, branchUuid);
  return BranchClosureModel.listUpcoming(branch.id, shopId);
}

export async function createBranchClosure(shopId, branchUuid, payload, auditContext) {
  const branch = await resolveBranchOrThrow(shopId, branchUuid);
  assertBranchAllowsClosureOps(branch);

  const startsAt = new Date(payload.starts_at);
  const endsAt = new Date(payload.ends_at);
  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime()) || endsAt <= startsAt) {
    throw new ApiError(HTTP.BAD_REQUEST, "Closure end must be after start");
  }

  const closure = await BranchClosureModel.create({
    branchId: branch.id,
    shopId: Number(shopId),
    title: normalizeText(payload.title),
    reason: normalizeText(payload.reason),
    closureType: closureTypeToDb(payload.closure_type ?? "custom"),
    startsAt,
    endsAt,
    allDay: payload.all_day ?? true,
    isRecurring: payload.is_recurring ?? false,
    recurrenceRule: normalizeText(payload.recurrence_rule),
    createdById: auditContext.userId ?? null,
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId: auditContext.userId,
    action: "branch.closure.created",
    entity: "branch_closure",
    entityId: closure.id,
    newValues: closure,
    ipAddress: auditContext.ipAddress,
    userAgent: auditContext.userAgent,
  });

  return closure;
}

export async function updateBranchClosure(shopId, branchUuid, closureId, payload, auditContext) {
  const branch = await resolveBranchOrThrow(shopId, branchUuid);
  assertBranchAllowsClosureOps(branch);

  const existing = await BranchClosureModel.findById(closureId, branch.id, shopId);
  if (!existing) throw new ApiError(HTTP.NOT_FOUND, "Closure not found");

  const data = {};
  if (payload.title !== undefined) data.title = normalizeText(payload.title);
  if (payload.reason !== undefined) data.reason = normalizeText(payload.reason);
  if (payload.closure_type !== undefined) data.closureType = closureTypeToDb(payload.closure_type);
  if (payload.all_day !== undefined) data.allDay = payload.all_day;
  if (payload.is_recurring !== undefined) data.isRecurring = payload.is_recurring;
  if (payload.recurrence_rule !== undefined) data.recurrenceRule = normalizeText(payload.recurrence_rule);
  if (payload.starts_at !== undefined) data.startsAt = new Date(payload.starts_at);
  if (payload.ends_at !== undefined) data.endsAt = new Date(payload.ends_at);

  const startsAt = data.startsAt ?? existing.startsAt;
  const endsAt = data.endsAt ?? existing.endsAt;
  if (endsAt <= startsAt) {
    throw new ApiError(HTTP.BAD_REQUEST, "Closure end must be after start");
  }

  const updated = await BranchClosureModel.update(closureId, branch.id, shopId, data);

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId: auditContext.userId,
    action: "branch.closure.updated",
    entity: "branch_closure",
    entityId: closureId,
    oldValues: existing,
    newValues: updated,
    ipAddress: auditContext.ipAddress,
    userAgent: auditContext.userAgent,
  });

  return updated;
}

export async function deleteBranchClosure(shopId, branchUuid, closureId, auditContext) {
  const branch = await resolveBranchOrThrow(shopId, branchUuid);

  const existing = await BranchClosureModel.findById(closureId, branch.id, shopId);
  if (!existing) throw new ApiError(HTTP.NOT_FOUND, "Closure not found");

  await BranchClosureModel.remove(closureId, branch.id, shopId);

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId: auditContext.userId,
    action: "branch.closure.deleted",
    entity: "branch_closure",
    entityId: closureId,
    oldValues: existing,
    ipAddress: auditContext.ipAddress,
    userAgent: auditContext.userAgent,
  });
}
