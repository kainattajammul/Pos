import { prisma } from "../config/database.js";
import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { BranchSystemModel } from "../models/branchSystem.model.js";
import { parsePagination, paginationMeta } from "../utils/financeHelpers.js";
import { toPublicSecurityEvent } from "../mappers/branchSystem.mapper.js";
import { writeAuditLog } from "./auditLog.service.js";
import { getClientMeta } from "../utils/branchHelpers.js";
import { ensureBranch } from "./branchSyncConnection.service.js";

function buildEventWhere(branchId, shopId, query) {
  const where = { branchId: Number(branchId), shopId: Number(shopId) };
  if (query.rule_key) where.ruleKey = query.rule_key;
  if (query.event_type) where.eventType = String(query.event_type).toUpperCase();
  if (query.severity) where.severity = String(query.severity).toUpperCase();
  if (query.status) where.status = String(query.status).toUpperCase();
  if (query.user_id) where.actorUserId = Number(query.user_id);
  if (query.search) {
    where.OR = [{ description: { contains: query.search, mode: "insensitive" } }];
  }
  if (query.date_from || query.date_to) {
    where.detectedAt = {};
    if (query.date_from) where.detectedAt.gte = new Date(query.date_from);
    if (query.date_to) where.detectedAt.lte = new Date(query.date_to);
  }
  return where;
}

export async function listEvents({ shopId, branchUuid, query = {} }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const { page, limit, skip } = parsePagination(query);
  const where = buildEventWhere(branch.id, shopId, query);

  const [rows, total] = await Promise.all([
    BranchSystemModel.listSecurityEvents(branch.id, shopId, { where, skip, take: limit }),
    BranchSystemModel.countSecurityEvents(branch.id, shopId, where),
  ]);

  return {
    data: rows.map(toPublicSecurityEvent),
    meta: paginationMeta(page, limit, total),
    hasData: total > 0,
  };
}

export async function getEvent({ shopId, branchUuid, eventUuid }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const event = await BranchSystemModel.findSecurityEvent(eventUuid, branch.id, shopId);
  if (!event) throw new ApiError(HTTP.NOT_FOUND, "Security event not found");
  return toPublicSecurityEvent(event);
}

async function transitionEvent({ shopId, branchUuid, eventUuid, status, userId, req, notes }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const event = await BranchSystemModel.findSecurityEvent(eventUuid, branch.id, shopId);
  if (!event) throw new ApiError(HTTP.NOT_FOUND, "Security event not found");

  const updated = await prisma.branchSecurityEvent.update({
    where: { id: event.id },
    data: {
      status,
      resolvedAt: ["RESOLVED", "DISMISSED"].includes(status) ? new Date() : null,
      resolvedById: userId ?? null,
      resolutionNotes: notes ?? event.resolutionNotes,
    },
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: `branch_security_event.${status.toLowerCase()}`,
    entity: "branch_security_event",
    entityId: updated.uuid,
    newValues: { status, notes },
    ...getClientMeta(req),
  });

  return toPublicSecurityEvent(updated);
}

export async function acknowledgeEvent(ctx) {
  return transitionEvent({ ...ctx, status: "ACKNOWLEDGED" });
}

export async function resolveEvent(ctx) {
  return transitionEvent({ ...ctx, status: "RESOLVED" });
}

export async function dismissEvent(ctx) {
  return transitionEvent({ ...ctx, status: "DISMISSED" });
}

export async function countOpenEvents(branchId, shopId) {
  const [openEvents, criticalEvents] = await Promise.all([
    prisma.branchSecurityEvent.count({
      where: {
        branchId: Number(branchId),
        shopId: Number(shopId),
        status: { in: ["OPEN", "ACKNOWLEDGED"] },
      },
    }),
    prisma.branchSecurityEvent.count({
      where: {
        branchId: Number(branchId),
        shopId: Number(shopId),
        severity: "CRITICAL",
        status: { in: ["OPEN", "ACKNOWLEDGED"] },
      },
    }),
  ]);
  return { openEvents, criticalEvents };
}
