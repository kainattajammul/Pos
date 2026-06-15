import { prisma } from "../config/database.js";
import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { ensureBranch } from "./branchReportingSettings.service.js";
import { writeAuditLog } from "./auditLog.service.js";
import { getClientMeta } from "../utils/branchHelpers.js";

export async function createReportExport({ shopId, branchUuid, input, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const format = String(input.format || "CSV").toUpperCase();
  const reportCode = String(input.report_code || input.reportCode);

  const job = await prisma.branchReportExport.create({
    data: {
      shopId: Number(shopId),
      branchId: branch.id,
      reportCode,
      format,
      status: "QUEUED",
      filters: input.filters ?? {},
      requestedById: userId ?? null,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_report.export.requested",
    entity: "branch_report_export",
    entityId: job.uuid,
    newValues: { reportCode, format },
    ...getClientMeta(req),
  });

  return {
    id: job.uuid,
    report_code: job.reportCode,
    format: job.format.toLowerCase(),
    status: { value: "queued", label: "Queued" },
    created_at: job.createdAt.toISOString(),
    expires_at: job.expiresAt?.toISOString() ?? null,
  };
}

export async function listReportExports({ shopId, branchUuid, query }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 20));
  const skip = (page - 1) * limit;

  const [rows, total] = await prisma.$transaction([
    prisma.branchReportExport.findMany({
      where: { shopId: Number(shopId), branchId: branch.id },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.branchReportExport.count({ where: { shopId: Number(shopId), branchId: branch.id } }),
  ]);

  return {
    data: rows.map((r) => ({
      id: r.uuid,
      report_code: r.reportCode,
      format: r.format.toLowerCase(),
      status: r.status.toLowerCase(),
      file_name: r.fileName,
      completed_at: r.completedAt?.toISOString() ?? null,
      expires_at: r.expiresAt?.toISOString() ?? null,
    })),
    meta: { page, limit, total, totalPages: total === 0 ? 0 : Math.ceil(total / limit) },
  };
}

export async function getReportExport({ shopId, branchUuid, exportUuid }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const job = await prisma.branchReportExport.findFirst({
    where: { uuid: exportUuid, shopId: Number(shopId), branchId: branch.id },
  });
  if (!job) throw new ApiError(HTTP.NOT_FOUND, "Export not found");

  return {
    id: job.uuid,
    report_code: job.reportCode,
    format: job.format.toLowerCase(),
    status: job.status.toLowerCase(),
    file_name: job.fileName,
    file_size: job.fileSize,
    error_message: job.errorMessage,
    completed_at: job.completedAt?.toISOString() ?? null,
    expires_at: job.expiresAt?.toISOString() ?? null,
    available_actions: {
      canDownload: job.status === "COMPLETED" && job.storagePath != null,
    },
  };
}

export async function downloadReportExport({ shopId, branchUuid, exportUuid, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const job = await prisma.branchReportExport.findFirst({
    where: { uuid: exportUuid, shopId: Number(shopId), branchId: branch.id },
  });
  if (!job) throw new ApiError(HTTP.NOT_FOUND, "Export not found");
  if (job.status !== "COMPLETED") {
    throw new ApiError(HTTP.BAD_REQUEST, "Export is not ready for download");
  }
  if (job.expiresAt && job.expiresAt < new Date()) {
    throw new ApiError(HTTP.GONE, "Export link has expired");
  }
  if (!job.storagePath) {
    throw new ApiError(HTTP.NOT_FOUND, "Export file not available");
  }

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_report.export.downloaded",
    entity: "branch_report_export",
    entityId: job.uuid,
    ...getClientMeta(req),
  });

  return {
    file_name: job.fileName,
    storage_bucket: job.storageBucket,
    storage_path: job.storagePath,
    expires_at: job.expiresAt?.toISOString() ?? null,
    message: "Use signed URL generation when storage integration is configured",
  };
}
