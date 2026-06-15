import { prisma } from "../config/database.js";
import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { BranchSystemModel } from "../models/branchSystem.model.js";
import { parsePagination, paginationMeta } from "../utils/financeHelpers.js";
import {
  toPublicSyncConnection,
  toPublicSyncJob,
  computeSyncStatusSummary,
} from "../mappers/branchSystem.mapper.js";
import { writeAuditLog } from "./auditLog.service.js";
import { getClientMeta } from "../utils/branchHelpers.js";

const ACTIVE_JOB_STATUSES = ["QUEUED", "RUNNING", "RETRYING"];

function generateJobNumber() {
  return `BSJ-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export async function ensureBranch(shopId, branchUuid) {
  const branch = await BranchSystemModel.ensureBranch(shopId, branchUuid);
  if (!branch) throw new ApiError(HTTP.NOT_FOUND, "Branch not found");
  return branch;
}

export async function getSyncSummary(shopId, branchId) {
  const connections = await BranchSystemModel.listSyncConnections(branchId, shopId);
  return computeSyncStatusSummary(connections);
}

export async function listConnections({ shopId, branchUuid, query = {}, permissions = {} }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const { page, limit, skip } = parsePagination(query);
  const where = {};
  if (query.sync_type) where.syncType = String(query.sync_type).toUpperCase();
  if (query.status) where.currentStatus = String(query.status).toUpperCase();
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { provider: { contains: query.search, mode: "insensitive" } },
    ];
  }

  const [rows, total] = await Promise.all([
    BranchSystemModel.listSyncConnections(branch.id, shopId, { where, skip, take: limit }),
    BranchSystemModel.countSyncConnections(branch.id, shopId, where),
  ]);

  return {
    data: rows.map((c) =>
      toPublicSyncConnection(c, {
        canStart: permissions.canStart,
        canPause: permissions.canPause,
        canRetry: permissions.canRetry,
        canViewErrors: permissions.canViewErrors,
      }),
    ),
    meta: paginationMeta(page, limit, total),
    hasData: total > 0,
  };
}

export async function getConnection({ shopId, branchUuid, connectionUuid, permissions = {} }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const connection = await BranchSystemModel.findSyncConnection(connectionUuid, branch.id, shopId);
  if (!connection) throw new ApiError(HTTP.NOT_FOUND, "Sync connection not found");
  return toPublicSyncConnection(connection, permissions);
}

export async function createConnection({ shopId, branchUuid, input, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);

  const connection = await prisma.branchSyncConnection.create({
    data: {
      shopId: Number(shopId),
      branchId: branch.id,
      connectionCode: input.connection_code,
      name: input.name,
      provider: input.provider,
      syncType: String(input.sync_type).toUpperCase(),
      direction: String(input.direction ?? "BIDIRECTIONAL").toUpperCase(),
      scheduleType: String(input.schedule_type ?? "MANUAL").toUpperCase(),
      scheduleExpression: input.schedule_expression ?? null,
      conflictStrategy: String(input.conflict_strategy ?? "MANUAL_REVIEW").toUpperCase(),
      providerAccountRef: input.provider_account_ref ?? null,
      createdById: userId ?? null,
      updatedById: userId ?? null,
    },
    include: { jobs: { take: 1, orderBy: { createdAt: "desc" } } },
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_sync.connection.created",
    entity: "branch_sync_connection",
    entityId: connection.uuid,
    newValues: { connection_code: input.connection_code, name: input.name },
    ...getClientMeta(req),
  });

  return toPublicSyncConnection(connection, {});
}

export async function updateConnection({ shopId, branchUuid, connectionUuid, input, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const existing = await BranchSystemModel.findSyncConnection(connectionUuid, branch.id, shopId);
  if (!existing) throw new ApiError(HTTP.NOT_FOUND, "Sync connection not found");

  const data = { updatedById: userId ?? null };
  if (input.name != null) data.name = input.name;
  if (input.is_enabled != null) data.isEnabled = Boolean(input.is_enabled);
  if (input.schedule_type != null) data.scheduleType = String(input.schedule_type).toUpperCase();
  if (input.schedule_expression != null) data.scheduleExpression = input.schedule_expression;
  if (input.conflict_strategy != null) {
    data.conflictStrategy = String(input.conflict_strategy).toUpperCase();
  }

  const updated = await prisma.branchSyncConnection.update({
    where: { id: existing.id },
    data,
    include: { jobs: { take: 1, orderBy: { createdAt: "desc" } } },
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_sync.connection.updated",
    entity: "branch_sync_connection",
    entityId: updated.uuid,
    oldValues: existing,
    newValues: data,
    ...getClientMeta(req),
  });

  return toPublicSyncConnection(updated, {});
}

async function assertNoActiveJob(connectionId) {
  const active = await prisma.branchSyncJob.findFirst({
    where: { connectionId, status: { in: ACTIVE_JOB_STATUSES } },
  });
  if (active) {
    throw new ApiError(HTTP.CONFLICT, "A sync job is already running for this connection");
  }
}

export async function startSync({ shopId, branchUuid, connectionUuid, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const connection = await BranchSystemModel.findSyncConnection(connectionUuid, branch.id, shopId);
  if (!connection) throw new ApiError(HTTP.NOT_FOUND, "Sync connection not found");
  if (!connection.isEnabled) throw new ApiError(HTTP.BAD_REQUEST, "Connection is disabled");

  await assertNoActiveJob(connection.id);

  const job = await prisma.$transaction(async (tx) => {
    const created = await tx.branchSyncJob.create({
      data: {
        jobNumber: generateJobNumber(),
        shopId: Number(shopId),
        branchId: branch.id,
        connectionId: connection.id,
        status: "QUEUED",
        triggerType: "MANUAL",
        triggeredById: userId ?? null,
        requestId: req?.headers?.["x-request-id"] ?? null,
      },
    });

    await tx.branchSyncConnection.update({
      where: { id: connection.id },
      data: {
        currentStatus: "QUEUED",
        lastSyncStartedAt: new Date(),
        updatedById: userId ?? null,
      },
    });

    return created;
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_sync.started",
    entity: "branch_sync_job",
    entityId: job.uuid,
    ...getClientMeta(req),
  });

  return toPublicSyncJob({ ...job, connection });
}

export async function pauseConnection({ shopId, branchUuid, connectionUuid, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const connection = await BranchSystemModel.findSyncConnection(connectionUuid, branch.id, shopId);
  if (!connection) throw new ApiError(HTTP.NOT_FOUND, "Sync connection not found");

  const updated = await prisma.branchSyncConnection.update({
    where: { id: connection.id },
    data: { currentStatus: "PAUSED", isEnabled: false, updatedById: userId ?? null },
    include: { jobs: { take: 1, orderBy: { createdAt: "desc" } } },
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_sync.paused",
    entity: "branch_sync_connection",
    entityId: updated.uuid,
    ...getClientMeta(req),
  });

  return toPublicSyncConnection(updated, {});
}

export async function resumeConnection({ shopId, branchUuid, connectionUuid, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const connection = await BranchSystemModel.findSyncConnection(connectionUuid, branch.id, shopId);
  if (!connection) throw new ApiError(HTTP.NOT_FOUND, "Sync connection not found");

  const updated = await prisma.branchSyncConnection.update({
    where: { id: connection.id },
    data: { currentStatus: "IDLE", isEnabled: true, updatedById: userId ?? null },
    include: { jobs: { take: 1, orderBy: { createdAt: "desc" } } },
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_sync.resumed",
    entity: "branch_sync_connection",
    entityId: updated.uuid,
    ...getClientMeta(req),
  });

  return toPublicSyncConnection(updated, {});
}

export async function testConnection({ shopId, branchUuid, connectionUuid }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const connection = await BranchSystemModel.findSyncConnection(connectionUuid, branch.id, shopId);
  if (!connection) throw new ApiError(HTTP.NOT_FOUND, "Sync connection not found");

  return {
    connection_id: connection.uuid,
    reachable: Boolean(connection.providerAccountRef),
    tested_at: new Date().toISOString(),
    message: connection.providerAccountRef
      ? "Provider reference configured"
      : "No provider account reference configured",
  };
}
