import path from "node:path";
import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { env } from "../config/env.js";
import { getSupabaseAdmin, isSupabaseStorageConfigured } from "../config/supabase.js";
import { BranchSystemModel } from "../models/branchSystem.model.js";
import { writeAuditLog } from "./auditLog.service.js";
import { getClientMeta } from "../utils/branchHelpers.js";
import { ensureBranch } from "./branchSyncConnection.service.js";

const ALLOWED_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const MAX_BYTES = 10 * 1024 * 1024;

function safeFileName(original) {
  const ext = path.extname(original || "").toLowerCase().slice(0, 10);
  const base = `agreement-${Date.now()}`;
  return `${base}${ext || ".pdf"}`;
}

function storagePath(shopId, branchId, ownershipId, fileName) {
  return `shops/${shopId}/branches/${branchId}/franchise/${ownershipId}/${fileName}`;
}

export async function uploadAgreement({
  shopId,
  branchUuid,
  ownershipUuid,
  file,
  userId,
  req,
}) {
  if (!isSupabaseStorageConfigured()) {
    throw new ApiError(HTTP.SERVICE_UNAVAILABLE, "Document storage is not configured");
  }
  if (!file) throw new ApiError(HTTP.BAD_REQUEST, "Agreement file is required");
  if (!ALLOWED_MIME.has(file.mimetype)) {
    throw new ApiError(HTTP.BAD_REQUEST, "Unsupported file type");
  }
  if (file.size > MAX_BYTES) {
    throw new ApiError(HTTP.BAD_REQUEST, "File exceeds maximum size of 10MB");
  }

  const branch = await ensureBranch(shopId, branchUuid);
  const ownership = await BranchSystemModel.findOwnership(ownershipUuid, branch.id, shopId);
  if (!ownership) throw new ApiError(HTTP.NOT_FOUND, "Ownership record not found");

  const fileName = safeFileName(file.originalname);
  const objectPath = storagePath(shopId, branch.id, ownership.uuid, fileName);
  const supabase = getSupabaseAdmin();
  const bucket = env.supabaseBucket;

  const { error } = await supabase.storage.from(bucket).upload(objectPath, file.buffer, {
    contentType: file.mimetype,
    upsert: false,
  });
  if (error) throw new ApiError(HTTP.BAD_REQUEST, error.message);

  const { prisma } = await import("../config/database.js");
  await prisma.branchOwnership.update({
    where: { id: ownership.id },
    data: { agreementStoragePath: objectPath, updatedById: userId ?? null },
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_ownership.agreement.uploaded",
    entity: "branch_ownership",
    entityId: ownership.uuid,
    newValues: { storage_path: objectPath },
    ...getClientMeta(req),
  });

  return { storage_path: objectPath, file_name: fileName };
}

export async function getAgreementSignedUrl({
  shopId,
  branchUuid,
  ownershipUuid,
  userId,
  req,
}) {
  if (!isSupabaseStorageConfigured()) {
    throw new ApiError(HTTP.SERVICE_UNAVAILABLE, "Document storage is not configured");
  }

  const branch = await ensureBranch(shopId, branchUuid);
  const ownership = await BranchSystemModel.findOwnership(ownershipUuid, branch.id, shopId);
  if (!ownership?.agreementStoragePath) {
    throw new ApiError(HTTP.NOT_FOUND, "Agreement document not found");
  }

  const supabase = getSupabaseAdmin();
  const bucket = env.supabaseBucket;
  const expiresIn = 300;

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(ownership.agreementStoragePath, expiresIn);
  if (error) throw new ApiError(HTTP.BAD_REQUEST, error.message);

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_ownership.agreement.downloaded",
    entity: "branch_ownership",
    entityId: ownership.uuid,
    ...getClientMeta(req),
  });

  return {
    url: data.signedUrl,
    expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
  };
}
