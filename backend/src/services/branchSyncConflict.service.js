import { prisma } from "../config/database.js";
import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { toPublicSyncJobItem } from "../mappers/branchSystem.mapper.js";
import { writeAuditLog } from "./auditLog.service.js";
import { getClientMeta } from "../utils/branchHelpers.js";
import { ensureBranch } from "./branchSyncConnection.service.js";
import { BranchSystemModel } from "../models/branchSystem.model.js";

export async function resolveConflict({
  shopId,
  branchUuid,
  jobUuid,
  itemUuid,
  resolution,
  userId,
  req,
  reason,
}) {
  const branch = await ensureBranch(shopId, branchUuid);
  const job = await BranchSystemModel.findSyncJob(jobUuid, branch.id, shopId);
  if (!job) throw new ApiError(HTTP.NOT_FOUND, "Sync job not found");

  const item = await prisma.branchSyncJobItem.findFirst({
    where: { uuid: itemUuid, syncJobId: job.id, status: "CONFLICT" },
  });
  if (!item) throw new ApiError(HTTP.NOT_FOUND, "Conflict item not found");

  const allowed = ["keep_local", "keep_external", "merge", "skip", "retry_later"];
  if (!allowed.includes(resolution)) {
    throw new ApiError(HTTP.BAD_REQUEST, "Invalid conflict resolution");
  }

  const statusMap = {
    keep_local: "UPDATED",
    keep_external: "UPDATED",
    merge: "UPDATED",
    skip: "SKIPPED",
    retry_later: "PENDING",
  };

  const updated = await prisma.$transaction(async (tx) => {
    const row = await tx.branchSyncJobItem.update({
      where: { id: item.id },
      data: {
        status: statusMap[resolution],
        action: resolution,
        processedAt: new Date(),
        conflictData: {
          ...(item.conflictData ?? {}),
          resolution,
          resolved_by: userId ?? null,
          resolved_at: new Date().toISOString(),
          reason: reason ?? null,
        },
      },
    });

    const remaining = await tx.branchSyncJobItem.count({
      where: { syncJobId: job.id, status: "CONFLICT" },
    });

    if (remaining === 0 && job.conflictRecords > 0) {
      await tx.branchSyncJob.update({
        where: { id: job.id },
        data: { conflictRecords: { decrement: 1 } },
      });
    }

    return row;
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_sync.conflict.resolved",
    entity: "branch_sync_job_item",
    entityId: updated.uuid,
    newValues: { resolution, reason },
    ...getClientMeta(req),
  });

  return toPublicSyncJobItem(updated);
}
