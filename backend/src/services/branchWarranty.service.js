import { prisma } from "../config/database.js";
import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { CustomerModel } from "../models/branchOperations.model.js";
import { ensureBranch } from "./branchOperationsSettings.service.js";
import { writeAuditLog } from "./auditLog.service.js";
import { getClientMeta } from "../utils/branchHelpers.js";
import { toPublicWarrantyClaim } from "../mappers/branchOperations.mapper.js";
import { ensureBranchCustomerLink } from "./branchCustomer.service.js";
import { logCustomerActivity } from "./branchCustomerActivity.service.js";

const CLAIM_TRANSITIONS = {
  SUBMITTED: ["UNDER_REVIEW", "CANCELLED"],
  UNDER_REVIEW: ["APPROVED", "REJECTED", "INSPECTION_REQUIRED", "CANCELLED"],
  INSPECTION_REQUIRED: ["UNDER_REVIEW", "APPROVED", "REJECTED"],
  APPROVED: ["REPAIR_IN_PROGRESS", "COMPLETED", "CANCELLED"],
  PARTIALLY_APPROVED: ["REPAIR_IN_PROGRESS", "COMPLETED", "CANCELLED"],
  REJECTED: ["COMPLETED"],
  REPAIR_IN_PROGRESS: ["COMPLETED"],
  REPLACEMENT_APPROVED: ["COMPLETED"],
  REFUND_APPROVED: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

function assertClaimTransition(fromStatus, toStatus) {
  const allowed = CLAIM_TRANSITIONS[fromStatus] ?? [];
  if (!allowed.includes(toStatus)) {
    throw new ApiError(HTTP.BAD_REQUEST, `Invalid claim status transition from ${fromStatus} to ${toStatus}`);
  }
}

async function generateWarrantyNumber(tx, branchCode) {
  const year = new Date().getFullYear();
  const prefix = `WAR-${branchCode}-${year}-`;
  const last = await tx.branchWarranty.findFirst({
    where: { warrantyNumber: { startsWith: prefix } },
    orderBy: { warrantyNumber: "desc" },
  });
  const seq = last ? Number(last.warrantyNumber.split("-").pop()) + 1 : 1;
  return `${prefix}${String(seq).padStart(6, "0")}`;
}

async function generateClaimNumber(tx, branchCode) {
  const year = new Date().getFullYear();
  const prefix = `CLM-${branchCode}-${year}-`;
  const last = await tx.branchWarrantyClaim.findFirst({
    where: { claimNumber: { startsWith: prefix } },
    orderBy: { claimNumber: "desc" },
  });
  const seq = last ? Number(last.claimNumber.split("-").pop()) + 1 : 1;
  return `${prefix}${String(seq).padStart(6, "0")}`;
}

async function recordClaimHistory(tx, claimId, fromStatus, toStatus, action, userId, notes) {
  await tx.branchWarrantyClaimHistory.create({
    data: {
      claimId,
      fromStatus,
      toStatus,
      action,
      notes,
      performedById: userId,
    },
  });
}

function toPublicWarranty(warranty) {
  return {
    id: warranty.uuid,
    warranty_number: warranty.warrantyNumber,
    warranty_type: warranty.warrantyType.toLowerCase(),
    status: warranty.status.toLowerCase(),
    starts_at: warranty.startsAt.toISOString(),
    expires_at: warranty.expiresAt.toISOString(),
    coverage_description: warranty.coverageDescription,
    exclusions: warranty.exclusions,
    customer: warranty.customer
      ? { id: warranty.customer.uuid, name: warranty.customer.displayName }
      : null,
    repair_ticket_id: warranty.repairTicketId,
    sale_id: warranty.saleId,
  };
}

async function resolveCustomer(shopId, customerUuid) {
  if (!customerUuid) return null;
  const customer = await CustomerModel.findByUuid(customerUuid, shopId);
  if (!customer) throw new ApiError(HTTP.NOT_FOUND, "Customer not found");
  return customer;
}

export async function createWarranty({ shopId, branchUuid, input, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const customer = await resolveCustomer(shopId, input.customer_id);

  const warranty = await prisma.$transaction(async (tx) => {
    const warrantyNumber = await generateWarrantyNumber(tx, branch.branchCode);

    let repairTicketId = null;
    if (input.repair_ticket_id) {
      const ticket = await tx.branchRepairTicket.findFirst({
        where: { uuid: input.repair_ticket_id, branchId: branch.id, shopId: Number(shopId) },
      });
      if (!ticket) throw new ApiError(HTTP.NOT_FOUND, "Repair ticket not found");
      repairTicketId = ticket.id;
    }

    let saleId = null;
    if (input.sale_id) {
      const sale = await tx.branchSale.findFirst({
        where: { uuid: input.sale_id, branchId: branch.id, shopId: Number(shopId) },
      });
      if (!sale) throw new ApiError(HTTP.NOT_FOUND, "Sale not found");
      saleId = sale.id;
    }

    return tx.branchWarranty.create({
      data: {
        warrantyNumber,
        shopId: Number(shopId),
        branchId: branch.id,
        customerId: customer?.id ?? null,
        repairTicketId,
        saleId,
        saleItemId: input.sale_item_id ?? null,
        warrantyType: (input.warranty_type ?? "REPAIR").toUpperCase(),
        status: "ACTIVE",
        startsAt: new Date(input.starts_at ?? Date.now()),
        expiresAt: new Date(input.expires_at),
        coverageDescription: input.coverage_description ?? null,
        exclusions: input.exclusions ?? null,
        termsSnapshot: input.terms_snapshot ?? null,
        createdById: userId,
      },
      include: { customer: true },
    });
  });

  if (customer) {
    await ensureBranchCustomerLink({ shopId, branchId: branch.id, customerId: customer.id });
    await logCustomerActivity({
      shopId,
      branchId: branch.id,
      customerId: customer.id,
      activityType: "WARRANTY_CREATED",
      title: `Warranty ${warranty.warrantyNumber} created`,
      referenceType: "warranty",
      referenceId: warranty.uuid,
      performedById: userId,
    });
  }

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_warranties.created",
    entity: "branch_warranty",
    entityId: warranty.uuid,
    ...getClientMeta(req),
  });

  return toPublicWarranty(warranty);
}

export async function getWarranty({ shopId, branchUuid, warrantyUuid }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const warranty = await prisma.branchWarranty.findFirst({
    where: { uuid: warrantyUuid, branchId: branch.id, shopId: Number(shopId) },
    include: { customer: true, claims: true },
  });
  if (!warranty) throw new ApiError(HTTP.NOT_FOUND, "Warranty not found");

  return {
    ...toPublicWarranty(warranty),
    claims: warranty.claims.map((c) => toPublicWarrantyClaim(c)),
  };
}

export async function listWarranties({ shopId, branchUuid, query }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 25));
  const skip = (page - 1) * limit;

  const where = { shopId: Number(shopId), branchId: branch.id };
  if (query.status) where.status = query.status.toUpperCase();
  if (query.customer_id) {
    const customer = await CustomerModel.findByUuid(query.customer_id, shopId);
    if (customer) where.customerId = customer.id;
  }

  const [rows, total] = await Promise.all([
    prisma.branchWarranty.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { customer: true },
    }),
    prisma.branchWarranty.count({ where }),
  ]);

  return {
    data: rows.map((w) => toPublicWarranty(w)),
    pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
  };
}

export async function createWarrantyClaim({ shopId, branchUuid, warrantyUuid, input, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const warranty = await prisma.branchWarranty.findFirst({
    where: { uuid: warrantyUuid, branchId: branch.id, shopId: Number(shopId) },
  });
  if (!warranty) throw new ApiError(HTTP.NOT_FOUND, "Warranty not found");
  if (warranty.status !== "ACTIVE") {
    throw new ApiError(HTTP.BAD_REQUEST, "Claims can only be submitted against active warranties");
  }
  if (new Date() > warranty.expiresAt) {
    throw new ApiError(HTTP.BAD_REQUEST, "Warranty has expired");
  }

  const claim = await prisma.$transaction(async (tx) => {
    const claimNumber = await generateClaimNumber(tx, branch.branchCode);
    const created = await tx.branchWarrantyClaim.create({
      data: {
        claimNumber,
        shopId: Number(shopId),
        branchId: branch.id,
        warrantyId: warranty.id,
        customerId: warranty.customerId,
        status: "SUBMITTED",
        claimReason: input.claim_reason,
        reportedIssue: input.reported_issue,
        submittedById: userId,
      },
    });

    await recordClaimHistory(tx, created.id, null, "SUBMITTED", "submitted", userId, input.reported_issue);
    return created;
  });

  if (warranty.customerId) {
    await logCustomerActivity({
      shopId,
      branchId: branch.id,
      customerId: warranty.customerId,
      activityType: "WARRANTY_CLAIM_CREATED",
      title: `Warranty claim ${claim.claimNumber} submitted`,
      referenceType: "warranty_claim",
      referenceId: claim.uuid,
      performedById: userId,
    });
  }

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_warranty_claims.created",
    entity: "branch_warranty_claim",
    entityId: claim.uuid,
    ...getClientMeta(req),
  });

  return toPublicWarrantyClaim(claim);
}

export async function getWarrantyClaim({ shopId, branchUuid, claimUuid }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const claim = await prisma.branchWarrantyClaim.findFirst({
    where: { uuid: claimUuid, branchId: branch.id, shopId: Number(shopId) },
    include: { history: { orderBy: { createdAt: "desc" }, take: 50 } },
  });
  if (!claim) throw new ApiError(HTTP.NOT_FOUND, "Warranty claim not found");

  return {
    ...toPublicWarrantyClaim(claim),
    assessment_notes: claim.assessmentNotes,
    resolution_notes: claim.resolutionNotes,
    rejection_reason: claim.rejectionReason,
    history: claim.history.map((h) => ({
      from_status: h.fromStatus?.toLowerCase() ?? null,
      to_status: h.toStatus.toLowerCase(),
      action: h.action,
      notes: h.notes,
      created_at: h.createdAt.toISOString(),
    })),
  };
}

export async function listWarrantyClaims({ shopId, branchUuid, query }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 25));
  const skip = (page - 1) * limit;

  const where = { shopId: Number(shopId), branchId: branch.id };
  if (query.status) where.status = query.status.toUpperCase();
  if (query.warranty_id) {
    const warranty = await prisma.branchWarranty.findFirst({
      where: { uuid: query.warranty_id, branchId: branch.id },
    });
    if (warranty) where.warrantyId = warranty.id;
  }

  const [rows, total] = await Promise.all([
    prisma.branchWarrantyClaim.findMany({
      where,
      skip,
      take: limit,
      orderBy: { submittedAt: "desc" },
    }),
    prisma.branchWarrantyClaim.count({ where }),
  ]);

  return {
    data: rows.map((c) => toPublicWarrantyClaim(c)),
    pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
  };
}

async function transitionClaim({
  shopId,
  branch,
  claim,
  toStatus,
  userId,
  req,
  action,
  notes,
  dataPatch = {},
}) {
  assertClaimTransition(claim.status, toStatus);

  await prisma.$transaction(async (tx) => {
    const fresh = await tx.branchWarrantyClaim.findUnique({ where: { id: claim.id } });
    if (!fresh || fresh.status !== claim.status) {
      throw new ApiError(HTTP.CONFLICT, "Claim status changed; please retry");
    }

    await tx.branchWarrantyClaim.update({
      where: { id: claim.id },
      data: {
        status: toStatus,
        version: { increment: 1 },
        ...dataPatch,
      },
    });

    await recordClaimHistory(tx, claim.id, claim.status, toStatus, action, userId, notes);
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: `branch_warranty_claims.${action}`,
    entity: "branch_warranty_claim",
    entityId: claim.uuid,
    oldValues: { status: claim.status },
    newValues: { status: toStatus },
    ...getClientMeta(req),
  });

  return getWarrantyClaim({ shopId, branchUuid: branch.uuid, claimUuid: claim.uuid });
}

export async function reviewWarrantyClaim({ shopId, branchUuid, claimUuid, notes, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const claim = await prisma.branchWarrantyClaim.findFirst({
    where: { uuid: claimUuid, branchId: branch.id, shopId: Number(shopId) },
  });
  if (!claim) throw new ApiError(HTTP.NOT_FOUND, "Warranty claim not found");

  return transitionClaim({
    shopId,
    branch,
    claim,
    toStatus: "UNDER_REVIEW",
    userId,
    req,
    action: "reviewed",
    notes,
    dataPatch: { assessedAt: new Date(), assessedById: userId, assessmentNotes: notes },
  });
}

export async function approveWarrantyClaim({ shopId, branchUuid, claimUuid, notes, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const claim = await prisma.branchWarrantyClaim.findFirst({
    where: { uuid: claimUuid, branchId: branch.id, shopId: Number(shopId) },
  });
  if (!claim) throw new ApiError(HTTP.NOT_FOUND, "Warranty claim not found");

  return transitionClaim({
    shopId,
    branch,
    claim,
    toStatus: "APPROVED",
    userId,
    req,
    action: "approved",
    notes,
    dataPatch: { approvedAt: new Date(), approvedById: userId, resolutionNotes: notes },
  });
}

export async function rejectWarrantyClaim({ shopId, branchUuid, claimUuid, reason, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const claim = await prisma.branchWarrantyClaim.findFirst({
    where: { uuid: claimUuid, branchId: branch.id, shopId: Number(shopId) },
  });
  if (!claim) throw new ApiError(HTTP.NOT_FOUND, "Warranty claim not found");

  assertClaimTransition(claim.status, "REJECTED");
  assertClaimTransition("REJECTED", "COMPLETED");

  await prisma.$transaction(async (tx) => {
    const fresh = await tx.branchWarrantyClaim.findUnique({ where: { id: claim.id } });
    if (!fresh || fresh.status !== claim.status) {
      throw new ApiError(HTTP.CONFLICT, "Claim status changed; please retry");
    }

    await tx.branchWarrantyClaim.update({
      where: { id: claim.id },
      data: {
        status: "COMPLETED",
        rejectedAt: new Date(),
        rejectionReason: reason,
        completedAt: new Date(),
        completedById: userId,
        version: { increment: 2 },
      },
    });

    await recordClaimHistory(tx, claim.id, claim.status, "REJECTED", "rejected", userId, reason);
    await recordClaimHistory(tx, claim.id, "REJECTED", "COMPLETED", "completed", userId, "Claim rejected and closed");
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_warranty_claims.rejected",
    entity: "branch_warranty_claim",
    entityId: claimUuid,
    reason,
    ...getClientMeta(req),
  });

  return getWarrantyClaim({ shopId, branchUuid, claimUuid });
}

export async function completeWarrantyClaim({ shopId, branchUuid, claimUuid, notes, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const claim = await prisma.branchWarrantyClaim.findFirst({
    where: { uuid: claimUuid, branchId: branch.id, shopId: Number(shopId) },
  });
  if (!claim) throw new ApiError(HTTP.NOT_FOUND, "Warranty claim not found");

  return transitionClaim({
    shopId,
    branch,
    claim,
    toStatus: "COMPLETED",
    userId,
    req,
    action: "completed",
    notes,
    dataPatch: {
      completedAt: new Date(),
      completedById: userId,
      resolutionNotes: notes ?? claim.resolutionNotes,
    },
  });
}

export async function cancelWarrantyClaim({ shopId, branchUuid, claimUuid, reason, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const claim = await prisma.branchWarrantyClaim.findFirst({
    where: { uuid: claimUuid, branchId: branch.id, shopId: Number(shopId) },
  });
  if (!claim) throw new ApiError(HTTP.NOT_FOUND, "Warranty claim not found");

  return transitionClaim({
    shopId,
    branch,
    claim,
    toStatus: "CANCELLED",
    userId,
    req,
    action: "cancelled",
    notes: reason,
  });
}
