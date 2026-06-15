import { randomUUID } from "crypto";
import { prisma } from "../config/database.js";
import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { env } from "../config/env.js";
import { getSupabaseAdmin } from "../config/supabase.js";
import { BranchCommunicationModel, BranchDocumentModel } from "../models/branchCommunication.model.js";
import { toPublicBranchDocument, toPublicDocumentSettings } from "../mappers/branchCommunication.mapper.js";
import { ensureBranch } from "./branchCommunicationSettings.service.js";
import { writeAuditLog } from "./auditLog.service.js";
import { getClientMeta } from "../utils/branchHelpers.js";
import { generateDocumentNumber, parsePagination, paginationMeta } from "../utils/financeHelpers.js";

const LOGO_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_LOGO_BYTES = 2 * 1024 * 1024;

function branchAssetPrefix(shopId, branchId) {
  return `shops/${shopId}/branches/${branchId}`;
}

export async function getDocumentSettings({ shopId, branchUuid }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const settings = await BranchCommunicationModel.getDocumentSettings(branch.id, shopId);
  return toPublicDocumentSettings(settings);
}

export async function updateDocumentSettings({ shopId, branchUuid, input, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  await BranchCommunicationModel.getDocumentSettings(branch.id, shopId);

  const data = { updatedById: userId ?? null };
  const map = {
    document_prefix: "documentPrefix",
    header_text: "headerText",
    footer_text: "footerText",
    legal_business_name: "legalBusinessName",
    registration_number: "registrationNumber",
    vat_number: "vatNumber",
    watermark_text: "watermarkText",
    default_terms: "defaultTerms",
    default_notes: "defaultNotes",
    document_template: "documentTemplate",
    document_language: "documentLanguage",
    date_format: "dateFormat",
    time_format: "timeFormat",
  };
  for (const [apiKey, dbKey] of Object.entries(map)) {
    if (input[apiKey] !== undefined) data[dbKey] = input[apiKey];
  }
  for (const key of ["show_branch_address", "show_branch_phone", "show_branch_email", "show_website", "show_vat_number", "watermark_enabled", "include_terms"]) {
    if (input[key] != null) data[key.replace(/_([a-z])/g, (_, c) => c.toUpperCase())] = Boolean(input[key]);
  }
  if (input.default_paper_size) data.defaultPaperSize = String(input.default_paper_size).toUpperCase();
  if (input.default_orientation) data.defaultOrientation = String(input.default_orientation).toUpperCase();

  const updated = await prisma.branchDocumentSettings.update({ where: { branchId: branch.id }, data });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_documents.settings.updated",
    entity: "branch_document_settings",
    entityId: String(branch.id),
    newValues: input,
    ...getClientMeta(req),
  });

  return toPublicDocumentSettings(updated);
}

export async function uploadBranchLogo({ shopId, branchUuid, file, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  if (!file?.buffer?.length) throw new ApiError(HTTP.BAD_REQUEST, "Logo file is required");
  if (!LOGO_MIME.has(file.mimetype)) throw new ApiError(HTTP.BAD_REQUEST, "Logo must be JPEG, PNG, or WebP");
  if (file.size > MAX_LOGO_BYTES) throw new ApiError(HTTP.BAD_REQUEST, "Logo must be 2 MB or smaller");

  const ext = file.mimetype === "image/png" ? "png" : file.mimetype === "image/webp" ? "webp" : "jpg";
  const storagePath = `${branchAssetPrefix(shopId, branch.id)}/logo/${randomUUID()}.${ext}`;
  const bucket = env.supabaseBucket;

  if (env.storageDriver === "supabase") {
    const supabase = getSupabaseAdmin();
    if (!supabase) throw new ApiError(HTTP.SERVICE_UNAVAILABLE, "Supabase storage not configured");
    const { error } = await supabase.storage.from(bucket).upload(storagePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });
    if (error) throw new ApiError(HTTP.BAD_REQUEST, error.message);
  }

  const settings = await prisma.branchDocumentSettings.update({
    where: { branchId: branch.id },
    data: {
      logoStoragePath: storagePath,
      storageBucket: bucket,
      storageFolderPrefix: branchAssetPrefix(shopId, branch.id),
      updatedById: userId ?? null,
    },
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_documents.logo.uploaded",
    entity: "branch_document_settings",
    entityId: String(branch.id),
    newValues: { storage_path: storagePath },
    ...getClientMeta(req),
  });

  return toPublicDocumentSettings(settings);
}

export async function listDocuments({ shopId, branchUuid, query }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const { page, limit, skip, direction } = parsePagination(query);
  const where = { shopId: Number(shopId), branchId: branch.id, archivedAt: null };
  if (query.document_type) where.documentType = String(query.document_type).toUpperCase();
  if (query.status) where.status = String(query.status).toUpperCase();

  const [rows, total] = await prisma.$transaction([
    BranchDocumentModel.list(where, { skip, take: limit, orderBy: { createdAt: direction } }),
    BranchDocumentModel.count(where),
  ]);

  return { data: rows.map(toPublicBranchDocument), meta: paginationMeta(page, limit, total) };
}

export async function createSignedDocumentUrl({ shopId, branchUuid, documentUuid }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const doc = await BranchDocumentModel.findByUuid(documentUuid, branch.id, shopId);
  if (!doc) throw new ApiError(HTTP.NOT_FOUND, "Document not found");

  if (env.storageDriver !== "supabase") {
    throw new ApiError(HTTP.SERVICE_UNAVAILABLE, "Signed URLs require Supabase storage");
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.storage
    .from(doc.storageBucket)
    .createSignedUrl(doc.storagePath, 300);

  if (error) throw new ApiError(HTTP.BAD_REQUEST, error.message);
  return { signed_url: data.signedUrl, expires_in_seconds: 300 };
}
