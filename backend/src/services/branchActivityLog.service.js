import { prisma } from "../config/database.js";
import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { BranchSystemModel } from "../models/branchSystem.model.js";
import { parsePagination, paginationMeta } from "../utils/financeHelpers.js";
import {
  maskIpAddress,
  maskUserAgent,
  sanitizeAuditPayload,
} from "./branchAuditSanitization.service.js";
import {
  toPublicActivityLog,
  toPublicActivitySummary,
} from "../mappers/branchSystem.mapper.js";

const RECURSION_GUARD_ACTIONS = new Set([
  "branch_activity_log.viewed",
  "branch_activity_log.exported",
  "audit_log.created",
]);

export async function ensureBranch(shopId, branchUuid) {
  const branch = await BranchSystemModel.ensureBranch(shopId, branchUuid);
  if (!branch) throw new ApiError(HTTP.NOT_FOUND, "Branch not found");
  return branch;
}

function buildActivityWhere(branchId, shopId, query) {
  const where = {
    branchId: Number(branchId),
    shopId: Number(shopId),
  };

  if (query.user_id) where.userId = Number(query.user_id);
  if (query.module) where.entity = { contains: query.module, mode: "insensitive" };
  if (query.action) where.action = { contains: query.action, mode: "insensitive" };
  if (query.entity_type) where.entity = query.entity_type;
  if (query.entity_id) where.entityId = String(query.entity_id);
  if (query.ip_address) where.ipAddress = { contains: query.ip_address };
  if (query.search) {
    where.OR = [
      { action: { contains: query.search, mode: "insensitive" } },
      { entity: { contains: query.search, mode: "insensitive" } },
      { entityId: { contains: query.search, mode: "insensitive" } },
    ];
  }
  if (query.date_from || query.date_to) {
    where.createdAt = {};
    if (query.date_from) where.createdAt.gte = new Date(query.date_from);
    if (query.date_to) where.createdAt.lte = new Date(query.date_to);
  }

  return where;
}

function activityOrderBy(query) {
  const sort = String(query.sort || "created_at");
  const direction = String(query.direction || "desc").toLowerCase() === "asc" ? "asc" : "desc";
  const map = {
    created_at: "createdAt",
    action: "action",
    entity: "entity",
  };
  return { [map[sort] ?? "createdAt"]: direction };
}

export async function listActivityLogs({
  shopId,
  branchUuid,
  query = {},
  permissions = {},
}) {
  const branch = await ensureBranch(shopId, branchUuid);
  const { page, limit, skip } = parsePagination(query);
  const where = buildActivityWhere(branch.id, shopId, query);

  const [rows, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: activityOrderBy(query),
      include: {
        user: { select: { id: true, fullName: true, email: true } },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  const canViewSensitive = Boolean(permissions.canViewSensitive);
  const data = rows.map((row) =>
    toPublicActivityLog(row, { canViewSensitive, canExport: permissions.canExport }),
  );

  return {
    data,
    meta: paginationMeta(page, limit, total),
    hasData: total > 0,
  };
}

export async function getActivityLog({
  shopId,
  branchUuid,
  activityId,
  permissions = {},
  auditContext = null,
}) {
  const branch = await ensureBranch(shopId, branchUuid);
  const row = await prisma.auditLog.findFirst({
    where: {
      id: Number(activityId),
      branchId: branch.id,
      shopId: Number(shopId),
    },
    include: {
      user: { select: { id: true, fullName: true, email: true } },
    },
  });
  if (!row) throw new ApiError(HTTP.NOT_FOUND, "Activity log not found");

  const canViewSensitive = Boolean(permissions.canViewSensitive);
  const data = toPublicActivityLog(row, {
    canViewSensitive,
    canExport: permissions.canExport,
    includeDetails: true,
  });

  if (auditContext && canViewSensitive && !RECURSION_GUARD_ACTIONS.has(auditContext.action)) {
    // Sensitive detail views are audited separately by controller
  }

  return data;
}

export async function getActivitySummary({ shopId, branchUuid, query = {} }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const where = buildActivityWhere(branch.id, shopId, query);

  const [total, todayStart] = await Promise.all([
    prisma.auditLog.count({ where }),
    (() => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return d;
    })(),
  ]);

  const todayWhere = {
    ...where,
    createdAt: { gte: todayStart },
  };
  const todayCount = await prisma.auditLog.count({ where: todayWhere });

  return toPublicActivitySummary({ total, todayCount });
}

export async function exportActivityLogs({
  shopId,
  branchUuid,
  query = {},
  permissions = {},
}) {
  if (!permissions.canExport) {
    throw new ApiError(HTTP.FORBIDDEN, "Export permission required");
  }

  const result = await listActivityLogs({
    shopId,
    branchUuid,
    query: { ...query, limit: 1000, page: 1 },
    permissions,
  });

  return {
    exportedAt: new Date().toISOString(),
    count: result.data.length,
    records: result.data.map((row) => ({
      ...row,
      old_values: sanitizeAuditPayload(row.old_values),
      new_values: sanitizeAuditPayload(row.new_values),
      ip_address: maskIpAddress(row.ip_address, permissions.canViewSensitive),
      user_agent: maskUserAgent(row.user_agent),
    })),
    meta: result.meta,
  };
}

export { sanitizeAuditPayload, maskIpAddress, maskUserAgent };
