import { prisma } from "../config/database.js";
import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { BranchSystemModel } from "../models/branchSystem.model.js";
import { parsePagination, paginationMeta } from "../utils/financeHelpers.js";
import { toPublicOwnership } from "../mappers/branchSystem.mapper.js";
import { writeAuditLog } from "./auditLog.service.js";
import { getClientMeta } from "../utils/branchHelpers.js";
import { ensureBranch } from "./branchSyncConnection.service.js";

const now = () => new Date();

function activeOwnershipWhere() {
  const t = now();
  return {
    status: "ACTIVE",
    effectiveFrom: { lte: t },
    OR: [{ effectiveUntil: null }, { effectiveUntil: { gte: t } }],
  };
}

export async function getPrimaryOwnerName(branchId, shopId) {
  const ownership = await BranchSystemModel.getPrimaryOwnership(branchId, shopId);
  if (!ownership?.businessEntity) return "";
  return (
    ownership.businessEntity.tradingName ||
    ownership.businessEntity.legalName ||
    ""
  );
}

export async function setFranchiseOwnerDisplay({
  shopId,
  branchUuid,
  franchiseOwner,
  userId,
  req,
}) {
  const branch = await ensureBranch(shopId, branchUuid);
  const name = String(franchiseOwner ?? "").trim();

  const existing = await BranchSystemModel.getPrimaryOwnership(branch.id, shopId);

  if (!name) {
    if (existing) {
      await prisma.branchOwnership.update({
        where: { id: existing.id },
        data: { status: "TERMINATED", effectiveUntil: now(), updatedById: userId ?? null },
      });
    }
    return "";
  }

  if (existing) {
    await prisma.businessEntity.update({
      where: { id: existing.businessEntityId },
      data: {
        tradingName: name,
        legalName: existing.businessEntity.legalName || name,
        updatedAt: now(),
      },
    });
  } else {
    const entity = await prisma.businessEntity.create({
      data: {
        shopId: Number(shopId),
        legalName: name,
        tradingName: name,
        entityType: "FRANCHISEE",
        status: "ACTIVE",
      },
    });

    await prisma.branchOwnership.create({
      data: {
        shopId: Number(shopId),
        branchId: branch.id,
        businessEntityId: entity.id,
        ownershipType: "FRANCHISE_OWNED",
        ownershipPercentage: 100,
        isPrimaryOwner: true,
        isOperatingEntity: true,
        effectiveFrom: now(),
        status: "ACTIVE",
        createdById: userId ?? null,
        updatedById: userId ?? null,
      },
    });
  }

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_ownership.updated",
    entity: "branch_ownership",
    entityId: String(branch.id),
    newValues: { franchise_owner: name },
    ...getClientMeta(req),
  });

  return name;
}

export async function listOwnership({ shopId, branchUuid, query = {} }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const { page, limit, skip } = parsePagination(query);
  const where = {};

  if (query.ownership_type) where.ownershipType = String(query.ownership_type).toUpperCase();
  if (query.status) where.status = String(query.status).toUpperCase();
  if (query.active_only === "true") Object.assign(where, activeOwnershipWhere());
  if (query.search) {
    where.businessEntity = {
      OR: [
        { legalName: { contains: query.search, mode: "insensitive" } },
        { tradingName: { contains: query.search, mode: "insensitive" } },
      ],
    };
  }

  const [rows, total] = await Promise.all([
    BranchSystemModel.listOwnerships(branch.id, shopId, { where, skip, take: limit }),
    BranchSystemModel.countOwnerships(branch.id, shopId, where),
  ]);

  const current = rows.filter((r) => {
    if (r.status !== "ACTIVE") return false;
    const t = now();
    return r.effectiveFrom <= t && (!r.effectiveUntil || r.effectiveUntil >= t);
  });

  return {
    data: current.map(toPublicOwnership),
    meta: paginationMeta(page, limit, total),
    hasData: total > 0,
  };
}

export async function getOwnership({ shopId, branchUuid, ownershipUuid }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const ownership = await BranchSystemModel.findOwnership(ownershipUuid, branch.id, shopId);
  if (!ownership) throw new ApiError(HTTP.NOT_FOUND, "Ownership record not found");
  return toPublicOwnership(ownership);
}

export async function createOwnership({ shopId, branchUuid, input, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);

  const pct = input.ownership_percentage != null ? Number(input.ownership_percentage) : null;
  if (pct != null && (pct < 0 || pct > 100)) {
    throw new ApiError(HTTP.BAD_REQUEST, "Ownership percentage must be between 0 and 100");
  }

  let entityId = input.business_entity_id;
  if (!entityId && input.entity) {
    const entity = await prisma.businessEntity.create({
      data: {
        shopId: Number(shopId),
        legalName: input.entity.legal_name,
        tradingName: input.entity.trading_name ?? input.entity.legal_name,
        entityType: String(input.entity.entity_type ?? "FRANCHISEE").toUpperCase(),
        contactEmail: input.entity.contact_email ?? null,
        contactPhone: input.entity.contact_phone ?? null,
        status: "ACTIVE",
      },
    });
    entityId = entity.uuid;
  }

  const entity = await prisma.businessEntity.findFirst({
    where: { uuid: entityId, shopId: Number(shopId) },
  });
  if (!entity) throw new ApiError(HTTP.BAD_REQUEST, "Business entity not found");

  if (input.is_primary_owner) {
    await prisma.branchOwnership.updateMany({
      where: {
        branchId: branch.id,
        shopId: Number(shopId),
        status: "ACTIVE",
        isPrimaryOwner: true,
      },
      data: { isPrimaryOwner: false, updatedById: userId ?? null },
    });
  }

  const ownership = await prisma.branchOwnership.create({
    data: {
      shopId: Number(shopId),
      branchId: branch.id,
      businessEntityId: entity.id,
      ownershipType: String(input.ownership_type ?? "FRANCHISE_OWNED").toUpperCase(),
      ownershipPercentage: pct,
      isPrimaryOwner: Boolean(input.is_primary_owner),
      isOperatingEntity: Boolean(input.is_operating_entity),
      effectiveFrom: input.effective_from ? new Date(input.effective_from) : now(),
      effectiveUntil: input.effective_until ? new Date(input.effective_until) : null,
      status: String(input.status ?? "ACTIVE").toUpperCase(),
      agreementReference: input.agreement_reference ?? null,
      notes: input.notes ?? null,
      createdById: userId ?? null,
      updatedById: userId ?? null,
    },
    include: { businessEntity: true },
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_ownership.created",
    entity: "branch_ownership",
    entityId: ownership.uuid,
    newValues: input,
    ...getClientMeta(req),
  });

  return toPublicOwnership(ownership);
}

export async function updateOwnership({ shopId, branchUuid, ownershipUuid, input, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const existing = await BranchSystemModel.findOwnership(ownershipUuid, branch.id, shopId);
  if (!existing) throw new ApiError(HTTP.NOT_FOUND, "Ownership record not found");

  const data = { updatedById: userId ?? null };
  if (input.ownership_percentage != null) {
    const pct = Number(input.ownership_percentage);
    if (pct < 0 || pct > 100) throw new ApiError(HTTP.BAD_REQUEST, "Invalid ownership percentage");
    data.ownershipPercentage = pct;
  }
  if (input.is_primary_owner != null) {
    if (input.is_primary_owner) {
      await prisma.branchOwnership.updateMany({
        where: {
          branchId: branch.id,
          shopId: Number(shopId),
          status: "ACTIVE",
          isPrimaryOwner: true,
          id: { not: existing.id },
        },
        data: { isPrimaryOwner: false },
      });
    }
    data.isPrimaryOwner = Boolean(input.is_primary_owner);
  }
  if (input.notes != null) data.notes = input.notes;
  if (input.agreement_reference != null) data.agreementReference = input.agreement_reference;

  const updated = await prisma.branchOwnership.update({
    where: { id: existing.id },
    data,
    include: { businessEntity: true },
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_ownership.updated",
    entity: "branch_ownership",
    entityId: updated.uuid,
    oldValues: existing,
    newValues: data,
    ...getClientMeta(req),
  });

  return toPublicOwnership(updated);
}

async function transitionOwnership({ shopId, branchUuid, ownershipUuid, status, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const existing = await BranchSystemModel.findOwnership(ownershipUuid, branch.id, shopId);
  if (!existing) throw new ApiError(HTTP.NOT_FOUND, "Ownership record not found");

  const data = { status, updatedById: userId ?? null };
  if (status === "TERMINATED" || status === "EXPIRED") data.effectiveUntil = now();

  const updated = await prisma.branchOwnership.update({
    where: { id: existing.id },
    data,
    include: { businessEntity: true },
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: `branch_ownership.${status.toLowerCase()}`,
    entity: "branch_ownership",
    entityId: updated.uuid,
    ...getClientMeta(req),
  });

  return toPublicOwnership(updated);
}

export const activateOwnership = (ctx) => transitionOwnership({ ...ctx, status: "ACTIVE" });
export const suspendOwnership = (ctx) => transitionOwnership({ ...ctx, status: "SUSPENDED" });
export const terminateOwnership = (ctx) => transitionOwnership({ ...ctx, status: "TERMINATED" });
export const restoreOwnership = (ctx) => transitionOwnership({ ...ctx, status: "ACTIVE" });

export async function listOwnershipHistory({ shopId, branchUuid, query = {} }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const { page, limit, skip } = parsePagination(query);
  const where = {};

  const [rows, total] = await Promise.all([
    BranchSystemModel.listOwnerships(branch.id, shopId, { where, skip, take: limit }),
    BranchSystemModel.countOwnerships(branch.id, shopId, where),
  ]);

  return {
    data: rows.map(toPublicOwnership),
    meta: paginationMeta(page, limit, total),
    hasData: total > 0,
  };
}

export async function getOwnershipSummary(branchId, shopId) {
  const primary = await BranchSystemModel.getPrimaryOwnership(branchId, shopId);
  return {
    type: primary?.ownershipType?.toLowerCase() ?? null,
    primaryOwner:
      primary?.businessEntity?.tradingName ||
      primary?.businessEntity?.legalName ||
      null,
    status: primary?.status?.toLowerCase() ?? null,
    agreementStatus: primary?.agreementStoragePath ? "uploaded" : primary ? "missing" : null,
  };
}
