import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { ShopModel } from "../models/shop.model.js";
import {
  BranchClosureModel,
  BranchModel,
} from "../models/branch.model.js";
import {
  DEFAULT_OPENING_HOURS,
  branchStatusToDb,
  branchTypeToDb,
  manualOpeningStatusToDb,
} from "../constants/branchEnums.js";
import {
  generateBranchCode,
  resolveBranchCode,
} from "./branchCode.service.js";
import {
  calculateBranchOpeningStatus,
  mapOpeningHoursInput,
  validateOpeningHoursSchedule,
} from "./branchOpeningStatus.service.js";
import { writeAuditLog } from "./auditLog.service.js";
import {
  generateBranchSlug,
  normalizeBranchCode,
  normalizeEmail,
  normalizePhone,
  normalizeText,
} from "../utils/branchHelpers.js";

async function ensureShopExists(shopId) {
  const shop = await ShopModel.findById(shopId);
  if (!shop) throw new ApiError(HTTP.NOT_FOUND, "Shop not found");
  return shop;
}

async function getBranchOrThrow(shopId, branchUuidOrId) {
  const branch = await BranchModel.resolveByIdentifier(branchUuidOrId, shopId);
  if (!branch) throw new ApiError(HTTP.NOT_FOUND, "Branch not found");
  return branch;
}

function assertNotArchived(branch, action = "update") {
  if (branch.status === "ARCHIVED" || branch.archivedAt) {
    throw new ApiError(
      HTTP.CONFLICT,
      `Archived branches cannot be ${action}. Restore the branch first.`,
    );
  }
}

async function resolveOpeningStatus(branch, at = new Date()) {
  const activeClosure = await BranchClosureModel.findActiveNow(branch.id, branch.shopId, at);
  return calculateBranchOpeningStatus(branch, { activeClosure, at });
}

function buildListWhere(query) {
  const where = {};

  if (query.status) {
    where.status = branchStatusToDb(query.status);
  }
  if (query.type) {
    where.branchType = branchTypeToDb(query.type);
  }
  if (query.city) {
    where.city = { contains: String(query.city), mode: "insensitive" };
  }
  if (query.is_active === "true") where.isActive = true;
  if (query.is_active === "false") where.isActive = false;
  if (query.archived === "true") {
    where.status = "ARCHIVED";
  } else if (query.archived === "false") {
    where.status = { not: "ARCHIVED" };
  } else if (query.include_archived !== "true") {
    where.status = { not: "ARCHIVED" };
  }

  const search = String(query.search ?? "").trim();
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { branchCode: { contains: search.toUpperCase(), mode: "insensitive" } },
      { email: { contains: search.toLowerCase(), mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
      { city: { contains: search, mode: "insensitive" } },
    ];
  }

  return where;
}

function buildListOrder(query) {
  const sort = String(query.sort ?? "created_at");
  const direction = query.direction === "asc" ? "asc" : "desc";
  const map = {
    name: "name",
    branch_code: "branchCode",
    created_at: "createdAt",
    updated_at: "updatedAt",
  };
  return { [map[sort] ?? "createdAt"]: direction };
}

function mapBranchCreateData(shopId, payload, userId, branchCode) {
  const name = normalizeText(payload.name);
  return {
    shopId: Number(shopId),
    branchCode,
    name,
    slug: generateBranchSlug(name),
    branchType: branchTypeToDb(payload.branch_type ?? "standard"),
    addressLine1: normalizeText(payload.address_line_1 ?? payload.address?.line_1),
    addressLine2: normalizeText(payload.address_line_2 ?? payload.address?.line_2),
    city: normalizeText(payload.city ?? payload.address?.city),
    county: normalizeText(payload.county ?? payload.address?.county),
    postcode: normalizeText(payload.postcode ?? payload.address?.postcode),
    country: normalizeText(payload.country ?? payload.address?.country) ?? "United Kingdom",
    latitude: payload.latitude ?? payload.address?.latitude ?? null,
    longitude: payload.longitude ?? payload.address?.longitude ?? null,
    phone: normalizePhone(payload.phone ?? payload.contact?.phone),
    alternativePhone: normalizePhone(payload.alternative_phone ?? payload.contact?.alternative_phone),
    email: normalizeEmail(payload.email ?? payload.contact?.email),
    contactPersonName: normalizeText(payload.contact_person_name ?? payload.contact?.contact_person_name),
    contactPersonPhone: normalizePhone(payload.contact_person_phone ?? payload.contact?.contact_person_phone),
    contactPersonEmail: normalizeEmail(payload.contact_person_email ?? payload.contact?.contact_person_email),
    timezone: payload.timezone ?? "Europe/London",
    status: branchStatusToDb(payload.status ?? "draft"),
    isPrimary: Boolean(payload.is_primary),
    isActive: payload.is_active !== false,
    createdById: userId ?? null,
    updatedById: userId ?? null,
  };
}

function mapBranchUpdateData(payload, userId) {
  const data = { updatedById: userId ?? null };

  if (payload.name !== undefined) {
    data.name = normalizeText(payload.name);
    data.slug = generateBranchSlug(data.name);
  }
  if (payload.branch_type !== undefined) data.branchType = branchTypeToDb(payload.branch_type);
  if (payload.address_line_1 !== undefined || payload.address?.line_1 !== undefined) {
    data.addressLine1 = normalizeText(payload.address_line_1 ?? payload.address?.line_1);
  }
  if (payload.address_line_2 !== undefined || payload.address?.line_2 !== undefined) {
    data.addressLine2 = normalizeText(payload.address_line_2 ?? payload.address?.line_2);
  }
  if (payload.city !== undefined || payload.address?.city !== undefined) {
    data.city = normalizeText(payload.city ?? payload.address?.city);
  }
  if (payload.county !== undefined || payload.address?.county !== undefined) {
    data.county = normalizeText(payload.county ?? payload.address?.county);
  }
  if (payload.postcode !== undefined || payload.address?.postcode !== undefined) {
    data.postcode = normalizeText(payload.postcode ?? payload.address?.postcode);
  }
  if (payload.country !== undefined || payload.address?.country !== undefined) {
    data.country = normalizeText(payload.country ?? payload.address?.country);
  }
  if (payload.latitude !== undefined || payload.address?.latitude !== undefined) {
    data.latitude = payload.latitude ?? payload.address?.latitude ?? null;
  }
  if (payload.longitude !== undefined || payload.address?.longitude !== undefined) {
    data.longitude = payload.longitude ?? payload.address?.longitude ?? null;
  }
  if (payload.phone !== undefined || payload.contact?.phone !== undefined) {
    data.phone = normalizePhone(payload.phone ?? payload.contact?.phone);
  }
  if (payload.alternative_phone !== undefined || payload.contact?.alternative_phone !== undefined) {
    data.alternativePhone = normalizePhone(payload.alternative_phone ?? payload.contact?.alternative_phone);
  }
  if (payload.email !== undefined || payload.contact?.email !== undefined) {
    data.email = normalizeEmail(payload.email ?? payload.contact?.email);
  }
  if (payload.contact_person_name !== undefined || payload.contact?.contact_person_name !== undefined) {
    data.contactPersonName = normalizeText(payload.contact_person_name ?? payload.contact?.contact_person_name);
  }
  if (payload.contact_person_phone !== undefined || payload.contact?.contact_person_phone !== undefined) {
    data.contactPersonPhone = normalizePhone(payload.contact_person_phone ?? payload.contact?.contact_person_phone);
  }
  if (payload.contact_person_email !== undefined || payload.contact?.contact_person_email !== undefined) {
    data.contactPersonEmail = normalizeEmail(payload.contact_person_email ?? payload.contact?.contact_person_email);
  }
  if (payload.timezone !== undefined) data.timezone = payload.timezone;
  if (payload.is_primary !== undefined) data.isPrimary = Boolean(payload.is_primary);
  if (payload.is_active !== undefined) data.isActive = Boolean(payload.is_active);

  return data;
}

async function ensureUniquePrimary(shopId, isPrimary, excludeId) {
  if (!isPrimary) return;
  const existing = await BranchModel.findPrimary(shopId, excludeId);
  if (existing) {
    throw new ApiError(HTTP.CONFLICT, "This shop already has a primary branch");
  }
}

export async function listBranches(shopId, query = {}) {
  await ensureShopExists(shopId);
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const skip = (page - 1) * limit;
  const where = buildListWhere(query);
  const orderBy = buildListOrder(query);

  const [rows, total] = await Promise.all([
    BranchModel.list({ shopId, where, orderBy, skip, take: limit }),
    BranchModel.count({ shopId, where }),
  ]);

  const data = await Promise.all(
    rows.map(async (branch) => {
      const openingStatus = await resolveOpeningStatus(branch);
      return { branch, openingStatus };
    }),
  );

  return {
    rows: data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getBranchProfile(shopId, branchUuid) {
  await ensureShopExists(shopId);
  const branch = await getBranchOrThrow(shopId, branchUuid);
  const openingStatus = await resolveOpeningStatus(branch);
  const upcomingClosures = await BranchClosureModel.listUpcoming(branch.id, shopId);
  return { branch, openingStatus, upcomingClosures };
}

export async function createBranch(shopId, payload, auditContext) {
  await ensureShopExists(shopId);

  const generated = await generateBranchCode(shopId, {
    city: payload.city ?? payload.address?.city,
    name: payload.name,
  });
  const branchCode = resolveBranchCode(payload.branch_code, generated);
  if (!branchCode) throw new ApiError(HTTP.BAD_REQUEST, "Branch code is required");

  const duplicate = await BranchModel.findByCode(shopId, branchCode);
  if (duplicate) {
    throw new ApiError(HTTP.CONFLICT, "The branch code has already been taken.");
  }

  await ensureUniquePrimary(shopId, payload.is_primary);

  const openingInput = payload.opening_hours ?? DEFAULT_OPENING_HOURS;
  const hourErrors = validateOpeningHoursSchedule(openingInput);
  if (hourErrors.length) {
    throw new ApiError(HTTP.BAD_REQUEST, hourErrors.join(". "));
  }

  const data = mapBranchCreateData(shopId, payload, auditContext.userId, branchCode);
  const openingRows = mapOpeningHoursInput(openingInput);

  const branch = await BranchModel.create(data, openingRows);

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId: auditContext.userId,
    action: "branch.created",
    entity: "branch",
    entityId: branch.uuid,
    newValues: { branch_code: branch.branchCode, name: branch.name },
    ipAddress: auditContext.ipAddress,
    userAgent: auditContext.userAgent,
  });

  const openingStatus = await resolveOpeningStatus(branch);
  return { branch, openingStatus };
}

export async function updateBranch(shopId, branchUuid, payload, auditContext) {
  const branch = await getBranchOrThrow(shopId, branchUuid);
  assertNotArchived(branch, "updated");

  if (payload.branch_code !== undefined) {
    const code = normalizeBranchCode(payload.branch_code);
    const duplicate = await BranchModel.findByCode(shopId, code, branch.id);
    if (duplicate) {
      throw new ApiError(HTTP.CONFLICT, "The branch code has already been taken.");
    }
  }

  await ensureUniquePrimary(shopId, payload.is_primary, branch.id);

  const data = mapBranchUpdateData(payload, auditContext.userId);
  if (payload.branch_code !== undefined) {
    data.branchCode = normalizeBranchCode(payload.branch_code);
  }

  if (Object.keys(data).length <= 1 && !payload.branch_code) {
    throw new ApiError(HTTP.BAD_REQUEST, "At least one field is required to update");
  }

  const updated = await BranchModel.update(branch.id, shopId, data);

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId: auditContext.userId,
    action: payload.branch_code !== undefined ? "branch.code.updated" : "branch.updated",
    entity: "branch",
    entityId: branch.uuid,
    oldValues: { branch_code: branch.branchCode, name: branch.name },
    newValues: { branch_code: updated.branchCode, name: updated.name },
    ipAddress: auditContext.ipAddress,
    userAgent: auditContext.userAgent,
  });

  const openingStatus = await resolveOpeningStatus(updated);
  return { branch: updated, openingStatus };
}

export async function patchBranchStatus(shopId, branchUuid, payload, auditContext) {
  const branch = await getBranchOrThrow(shopId, branchUuid);
  assertNotArchived(branch, "status changed");

  const data = { updatedById: auditContext.userId ?? null };
  if (payload.status !== undefined) data.status = branchStatusToDb(payload.status);
  if (payload.manual_opening_status !== undefined) {
    data.manualOpeningStatus = payload.manual_opening_status
      ? manualOpeningStatusToDb(payload.manual_opening_status)
      : null;
  }
  if (payload.manual_status_expires_at !== undefined) {
    data.manualStatusExpiresAt = payload.manual_status_expires_at
      ? new Date(payload.manual_status_expires_at)
      : null;
  }

  const updated = await BranchModel.update(branch.id, shopId, data);

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId: auditContext.userId,
    action: "branch.status.updated",
    entity: "branch",
    entityId: branch.uuid,
    oldValues: { status: branch.status },
    newValues: { status: updated.status },
    ipAddress: auditContext.ipAddress,
    userAgent: auditContext.userAgent,
  });

  return { branch: updated, openingStatus: await resolveOpeningStatus(updated) };
}

export async function activateBranch(shopId, branchUuid, auditContext) {
  const branch = await getBranchOrThrow(shopId, branchUuid);
  assertNotArchived(branch, "activated");
  const updated = await BranchModel.update(branch.id, shopId, {
    status: "ACTIVE",
    isActive: true,
    updatedById: auditContext.userId ?? null,
  });
  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId: auditContext.userId,
    action: "branch.activated",
    entity: "branch",
    entityId: branch.uuid,
    ipAddress: auditContext.ipAddress,
    userAgent: auditContext.userAgent,
  });
  return { branch: updated, openingStatus: await resolveOpeningStatus(updated) };
}

export async function deactivateBranch(shopId, branchUuid, auditContext) {
  const branch = await getBranchOrThrow(shopId, branchUuid);
  assertNotArchived(branch, "deactivated");
  const updated = await BranchModel.update(branch.id, shopId, {
    status: "INACTIVE",
    isActive: false,
    updatedById: auditContext.userId ?? null,
  });
  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId: auditContext.userId,
    action: "branch.deactivated",
    entity: "branch",
    entityId: branch.uuid,
    ipAddress: auditContext.ipAddress,
    userAgent: auditContext.userAgent,
  });
  return { branch: updated, openingStatus: await resolveOpeningStatus(updated) };
}

export async function archiveBranch(shopId, branchUuid, auditContext) {
  const branch = await getBranchOrThrow(shopId, branchUuid);
  const updated = await BranchModel.update(branch.id, shopId, {
    status: "ARCHIVED",
    isActive: false,
    archivedAt: new Date(),
    updatedById: auditContext.userId ?? null,
  });
  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId: auditContext.userId,
    action: "branch.archived",
    entity: "branch",
    entityId: branch.uuid,
    ipAddress: auditContext.ipAddress,
    userAgent: auditContext.userAgent,
  });
  return { branch: updated, openingStatus: await resolveOpeningStatus(updated) };
}

export async function restoreBranch(shopId, branchUuid, auditContext) {
  const branch = await getBranchOrThrow(shopId, branchUuid);
  const updated = await BranchModel.update(branch.id, shopId, {
    status: "INACTIVE",
    isActive: false,
    archivedAt: null,
    updatedById: auditContext.userId ?? null,
  });
  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId: auditContext.userId,
    action: "branch.restored",
    entity: "branch",
    entityId: branch.uuid,
    ipAddress: auditContext.ipAddress,
    userAgent: auditContext.userAgent,
  });
  return { branch: updated, openingStatus: await resolveOpeningStatus(updated) };
}

export async function deleteBranch(shopId, branchUuid, auditContext) {
  const branch = await getBranchOrThrow(shopId, branchUuid);
  if (branch.isPrimary) {
    throw new ApiError(HTTP.CONFLICT, "The primary branch cannot be deleted.");
  }

  await BranchModel.softDelete(branch.id, shopId);

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId: auditContext.userId,
    action: "branch.deleted",
    entity: "branch",
    entityId: branch.uuid,
    oldValues: { branch_code: branch.branchCode, name: branch.name },
    ipAddress: auditContext.ipAddress,
    userAgent: auditContext.userAgent,
  });

  return { uuid: branch.uuid, name: branch.name };
}

export async function getBranchOpeningStatus(shopId, branchUuid) {
  const branch = await getBranchOrThrow(shopId, branchUuid);
  return resolveOpeningStatus(branch);
}

export async function updateBranchOpeningHours(shopId, branchUuid, payload, auditContext) {
  const branch = await getBranchOrThrow(shopId, branchUuid);
  assertNotArchived(branch, "opening hours updated");

  const rows = payload.opening_hours ?? [];
  const errors = validateOpeningHoursSchedule(rows);
  if (errors.length) throw new ApiError(HTTP.BAD_REQUEST, errors.join(". "));

  const mapped = mapOpeningHoursInput(rows);
  const updated = await BranchModel.replaceOpeningHours(branch.id, shopId, mapped);

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId: auditContext.userId,
    action: "branch.opening_hours.updated",
    entity: "branch",
    entityId: branch.uuid,
    newValues: { opening_hours: rows },
    ipAddress: auditContext.ipAddress,
    userAgent: auditContext.userAgent,
  });

  return { branch: updated, openingStatus: await resolveOpeningStatus(updated) };
}
