import { prisma } from "../config/database.js";
import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { BranchSystemModel } from "../models/branchSystem.model.js";
import { parsePagination, paginationMeta } from "../utils/financeHelpers.js";
import { toPublicSyncJob, toPublicSyncJobItem } from "../mappers/branchSystem.mapper.js";
import { writeAuditLog } from "./auditLog.service.js";
import { getClientMeta } from "../utils/branchHelpers.js";
import { ensureBranch } from "./branchSyncConnection.service.js";

const CANCELLABLE = ["QUEUED", "RETRYING"];
const RETRYABLE = ["FAILED", "PARTIAL"];

export async function listJobs({ shopId, branchUuid, query = {} }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const { page, limit, skip } = parsePagination(query);
  const where = {};

  if (query.connection_id) {
    const conn = await BranchSystemModel.findSyncConnection(query.connection_id, branch.id, shopId);
    if (conn) where.connectionId = conn.id;
  }
  if (query.status) where.status = String(query.status).toUpperCase();
  if (query.trigger_type) where.triggerType = String(query.trigger_type).toUpperCase();
  if (query.failed_only === "true") where.status = "FAILED";
  if (query.conflicts_only === "true") where.conflictRecords = { gt: 0 };
  if (query.date_from || query.date_to) {
    where.createdAt = {};
    if (query.date_from) where.createdAt.gte = new Date(query.date_from);
    if (query.date_to) where.createdAt.lte = new Date(query.date_to);
  }

  const [rows, total] = await Promise.all([
    BranchSystemModel.listSyncJobs(branch.id, shopId, { where, skip, take: limit }),
    BranchSystemModel.countSyncJobs(branch.id, shopId, where),
  ]);

  return {
    data: rows.map(toPublicSyncJob),
    meta: paginationMeta(page, limit, total),
    hasData: total > 0,
  };
}

export async function getJob({ shopId, branchUuid, jobUuid }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const job = await BranchSystemModel.findSyncJob(jobUuid, branch.id, shopId);
  if (!job) throw new ApiError(HTTP.NOT_FOUND, "Sync job not found");
  return toPublicSyncJob(job);
}

export async function retryJob({ shopId, branchUuid, jobUuid, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const job = await BranchSystemModel.findSyncJob(jobUuid, branch.id, shopId);
  if (!job) throw new ApiError(HTTP.NOT_FOUND, "Sync job not found");
  if (!RETRYABLE.includes(job.status)) {
    throw new ApiError(HTTP.BAD_REQUEST, "Only failed or partial jobs can be retried");
  }

  const active = await prisma.branchSyncJob.findFirst({
    where: {
      connectionId: job.connectionId,
      status: { in: ["QUEUED", "RUNNING", "RETRYING"] },
    },
  });
  if (active) throw new ApiError(HTTP.CONFLICT, "A sync job is already active for this connection");

  const retried = await prisma.$transaction(async (tx) => {
    const created = await tx.branchSyncJob.create({
      data: {
        jobNumber: `BSJ-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        shopId: Number(shopId),
        branchId: branch.id,
        connectionId: job.connectionId,
        status: "QUEUED",
        triggerType: "RETRY",
        triggeredById: userId ?? null,
        retryCount: job.retryCount + 1,
        requestId: req?.headers?.["x-request-id"] ?? null,
        idempotencyKey: `retry-${job.uuid}`,
      },
      include: { connection: true },
    });

    await tx.branchSyncConnection.update({
      where: { id: job.connectionId },
      data: { currentStatus: "QUEUED", lastSyncStartedAt: new Date() },
    });

    return created;
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_sync.retried",
    entity: "branch_sync_job",
    entityId: retried.uuid,
    newValues: { source_job: job.uuid },
    ...getClientMeta(req),
  });

  return toPublicSyncJob(retried);
}

export async function cancelJob({ shopId, branchUuid, jobUuid, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const job = await BranchSystemModel.findSyncJob(jobUuid, branch.id, shopId);
  if (!job) throw new ApiError(HTTP.NOT_FOUND, "Sync job not found");
  if (!CANCELLABLE.includes(job.status)) {
    throw new ApiError(HTTP.BAD_REQUEST, "Only queued jobs can be cancelled");
  }

  const updated = await prisma.$transaction(async (tx) => {
    const row = await tx.branchSyncJob.update({
      where: { id: job.id },
      data: { status: "CANCELLED", completedAt: new Date() },
      include: { connection: true },
    });

    await tx.branchSyncConnection.update({
      where: { id: job.connectionId },
      data: { currentStatus: "IDLE" },
    });

    return row;
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_sync.cancelled",
    entity: "branch_sync_job",
    entityId: updated.uuid,
    ...getClientMeta(req),
  });

  return toPublicSyncJob(updated);
}

export async function listJobItems({ shopId, branchUuid, jobUuid, query = {} }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const job = await BranchSystemModel.findSyncJob(jobUuid, branch.id, shopId);
  if (!job) throw new ApiError(HTTP.NOT_FOUND, "Sync job not found");

  const { page, limit, skip } = parsePagination(query);
  const where = { syncJobId: job.id };
  if (query.status) where.status = String(query.status).toUpperCase();

  const [rows, total] = await Promise.all([
    prisma.branchSyncJobItem.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" } }),
    prisma.branchSyncJobItem.count({ where }),
  ]);

  return {
    data: rows.map(toPublicSyncJobItem),
    meta: paginationMeta(page, limit, total),
    hasData: total > 0,
  };
}

export async function completeJob({
  jobId,
  status,
  counts = {},
  errorMessage = null,
}) {
  const terminalStatus = status === "SUCCESS" ? "SUCCESS" : status === "PARTIAL" ? "PARTIAL" : "FAILED";
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const job = await tx.branchSyncJob.update({
      where: { id: jobId },
      data: {
        status: terminalStatus,
        completedAt: terminalStatus !== "FAILED" ? now : null,
        failedAt: terminalStatus === "FAILED" ? now : null,
        totalRecords: counts.total ?? 0,
        processedRecords: counts.processed ?? 0,
        createdRecords: counts.created ?? 0,
        updatedRecords: counts.updated ?? 0,
        skippedRecords: counts.skipped ?? 0,
        failedRecords: counts.failed ?? 0,
        conflictRecords: counts.conflicts ?? 0,
        errorMessage,
      },
      include: { connection: true },
    });

    const connStatus =
      terminalStatus === "SUCCESS"
        ? "SUCCESS"
        : terminalStatus === "PARTIAL"
          ? "PARTIAL"
          : "FAILED";

    await tx.branchSyncConnection.update({
      where: { id: job.connectionId },
      data: {
        currentStatus: connStatus,
        lastSyncCompletedAt: now,
        ...(terminalStatus === "SUCCESS" || terminalStatus === "PARTIAL"
          ? { lastSuccessfulSyncAt: now }
          : {}),
        lastErrorMessage: errorMessage,
      },
    });

    return job;
  });
}
