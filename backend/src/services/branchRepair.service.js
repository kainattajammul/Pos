import { prisma } from "../config/database.js";
import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { BranchRepairModel, CustomerModel } from "../models/branchOperations.model.js";
import { BranchStaffModel } from "../models/branchStaff.model.js";
import {
  assertRepairTransition,
  canEditRepair,
  isRepairTerminal,
} from "./branchRepairStateMachine.service.js";
import { ensureBranch } from "./branchOperationsSettings.service.js";
import { writeAuditLog } from "./auditLog.service.js";
import { getClientMeta } from "../utils/branchHelpers.js";
import { toPublicRepairSummary } from "../mappers/branchOperations.mapper.js";
import { logCustomerActivity } from "./branchCustomerActivity.service.js";
import { ensureBranchCustomerLink } from "./branchCustomer.service.js";

async function generateRepairTicketNumber(tx, branchCode) {
  const year = new Date().getFullYear();
  const prefix = `REP-${branchCode}-${year}-`;
  const last = await tx.branchRepairTicket.findFirst({
    where: { ticketNumber: { startsWith: prefix } },
    orderBy: { ticketNumber: "desc" },
  });
  const seq = last ? Number(last.ticketNumber.split("-").pop()) + 1 : 1;
  return `${prefix}${String(seq).padStart(6, "0")}`;
}

async function recordRepairHistory(tx, {
  shopId,
  branchId,
  repairTicketId,
  eventType,
  title,
  description,
  oldValues,
  newValues,
  performedById,
}) {
  await tx.branchRepairHistory.create({
    data: {
      shopId: Number(shopId),
      branchId: Number(branchId),
      repairTicketId,
      eventType,
      title,
      description,
      oldValues,
      newValues,
      performedById,
    },
  });
}

async function recordStatusHistory(tx, repairTicketId, fromStatus, toStatus, userId, notes) {
  await tx.branchRepairStatusHistory.create({
    data: {
      repairTicketId,
      fromStatus,
      toStatus,
      notes,
      performedById: userId,
    },
  });
}

async function getRepairOrThrow(uuid, branchId, shopId) {
  const ticket = await BranchRepairModel.findByUuid(uuid, branchId, shopId);
  if (!ticket) throw new ApiError(HTTP.NOT_FOUND, "Repair ticket not found");
  return ticket;
}

async function resolveCustomer(shopId, customerUuid) {
  if (!customerUuid) return null;
  const customer = await CustomerModel.findByUuid(customerUuid, shopId);
  if (!customer) throw new ApiError(HTTP.NOT_FOUND, "Customer not found");
  return customer;
}

async function resolveTechnicianUserId(shopId, branchId, technicianUuid) {
  const staff = await BranchStaffModel.findByUuid(technicianUuid, branchId, shopId);
  if (!staff) throw new ApiError(HTTP.NOT_FOUND, "Technician not found at this branch");
  return staff.userId;
}

async function transitionRepair({
  shopId,
  branch,
  ticket,
  toStatus,
  userId,
  req,
  notes,
  eventType = "STATUS_CHANGED",
  eventTitle,
  dataPatch = {},
  historyNewValues = {},
}) {
  if (!canEditRepair(ticket.status) && toStatus !== "ARCHIVED") {
    throw new ApiError(HTTP.BAD_REQUEST, "Repair ticket cannot be modified in its current status");
  }
  assertRepairTransition(ticket.status, toStatus);

  await prisma.$transaction(async (tx) => {
    const fresh = await tx.branchRepairTicket.findUnique({ where: { id: ticket.id } });
    if (!fresh || fresh.status !== ticket.status) {
      throw new ApiError(HTTP.CONFLICT, "Repair ticket status changed; please retry");
    }

    await tx.branchRepairTicket.update({
      where: { id: ticket.id },
      data: {
        status: toStatus,
        updatedById: userId,
        version: { increment: 1 },
        ...dataPatch,
      },
    });

    await recordStatusHistory(tx, ticket.id, ticket.status, toStatus, userId, notes);
    await recordRepairHistory(tx, {
      shopId,
      branchId: branch.id,
      repairTicketId: ticket.id,
      eventType,
      title: eventTitle ?? `Status changed to ${toStatus}`,
      description: notes,
      oldValues: { status: ticket.status },
      newValues: { status: toStatus, ...historyNewValues },
      performedById: userId,
    });
  });

  if (ticket.customerId) {
    await logCustomerActivity({
      shopId,
      branchId: branch.id,
      customerId: ticket.customerId,
      activityType: "REPAIR_STATUS_CHANGED",
      title: eventTitle ?? `Repair ${ticket.ticketNumber} status: ${toStatus}`,
      referenceType: "repair_ticket",
      referenceId: ticket.uuid,
      performedById: userId,
    });
  }

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_repairs.status_changed",
    entity: "branch_repair_ticket",
    entityId: ticket.uuid,
    oldValues: { status: ticket.status },
    newValues: { status: toStatus },
    ...getClientMeta(req),
  });

  return getRepairTicket({ shopId, branchUuid, ticketUuid: ticket.uuid });
}

export async function createRepairTicket({
  shopId,
  branchUuid,
  input,
  userId,
  req,
}) {
  const branch = await ensureBranch(shopId, branchUuid);
  const customer = await resolveCustomer(shopId, input.customer_id);

  const ticket = await prisma.$transaction(async (tx) => {
    const ticketNumber = await generateRepairTicketNumber(tx, branch.branchCode);
    const created = await tx.branchRepairTicket.create({
      data: {
        ticketNumber,
        shopId: Number(shopId),
        branchId: branch.id,
        customerId: customer?.id ?? null,
        createdById: userId,
        status: input.status?.toUpperCase() === "BOOKED" ? "BOOKED" : "DRAFT",
        priority: (input.priority ?? "NORMAL").toUpperCase(),
        repairType: input.repair_type ?? null,
        deviceCategory: input.device_category ?? null,
        manufacturer: input.manufacturer ?? null,
        model: input.model ?? null,
        colour: input.colour ?? null,
        serialNumber: input.serial_number ?? null,
        imei: input.imei ?? null,
        customerIssue: input.customer_issue,
        customerNotes: input.customer_notes ?? null,
        internalNotes: input.internal_notes ?? null,
        intakeMethod: (input.intake_method ?? "WALK_IN").toUpperCase(),
        returnMethod: (input.return_method ?? "CUSTOMER_COLLECTION").toUpperCase(),
        estimatedCompletionAt: input.estimated_completion_at
          ? new Date(input.estimated_completion_at)
          : null,
      },
      include: { customer: true },
    });

    await recordRepairHistory(tx, {
      shopId,
      branchId: branch.id,
      repairTicketId: created.id,
      eventType: "CREATED",
      title: "Repair ticket created",
      description: input.customer_issue,
      newValues: { ticket_number: ticketNumber },
      performedById: userId,
    });

    return created;
  });

  if (customer) {
    await ensureBranchCustomerLink({ shopId, branchId: branch.id, customerId: customer.id });
    await logCustomerActivity({
      shopId,
      branchId: branch.id,
      customerId: customer.id,
      activityType: "REPAIR_CREATED",
      title: `Repair ticket ${ticket.ticketNumber} created`,
      referenceType: "repair_ticket",
      referenceId: ticket.uuid,
      performedById: userId,
    });
  }

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_repairs.created",
    entity: "branch_repair_ticket",
    entityId: ticket.uuid,
    ...getClientMeta(req),
  });

  return getRepairTicket({ shopId, branchUuid, ticketUuid: ticket.uuid });
}

export async function listRepairTickets({ shopId, branchUuid, query, permissions }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 25));
  const skip = (page - 1) * limit;

  const where = {
    shopId: Number(shopId),
    branchId: branch.id,
    archivedAt: query.include_archived === "true" ? undefined : null,
  };
  if (query.status) where.status = query.status.toUpperCase();
  if (query.priority) where.priority = query.priority.toUpperCase();
  if (query.technician_id) {
    const techUserId = await resolveTechnicianUserId(shopId, branch.id, query.technician_id);
    where.assignedTechnicianId = techUserId;
  }
  if (query.search) {
    where.OR = [
      { ticketNumber: { contains: query.search, mode: "insensitive" } },
      { customer: { displayName: { contains: query.search, mode: "insensitive" } } },
      { imei: { contains: query.search, mode: "insensitive" } },
      { serialNumber: { contains: query.search, mode: "insensitive" } },
    ];
  }

  const [rows, total] = await Promise.all([
    prisma.branchRepairTicket.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { customer: true },
    }),
    prisma.branchRepairTicket.count({ where }),
  ]);

  return {
    data: rows.map((t) => toPublicRepairSummary(t, { permissions })),
    pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
  };
}

export async function getRepairTicket({ shopId, branchUuid, ticketUuid, permissions }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const ticket = await getRepairOrThrow(ticketUuid, branch.id, shopId);

  let technician = null;
  if (ticket.assignedTechnicianId) {
    technician = await prisma.user.findUnique({
      where: { id: ticket.assignedTechnicianId },
      select: { uuid: true, fullName: true },
    });
  }

  return {
    ...toPublicRepairSummary(ticket, { technician, permissions }),
    history: ticket.history?.map((h) => ({
      id: h.uuid,
      event_type: h.eventType.toLowerCase(),
      title: h.title,
      description: h.description,
      created_at: h.createdAt.toISOString(),
    })),
  };
}

export async function assignTechnician({ shopId, branchUuid, ticketUuid, technicianUuid, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const ticket = await getRepairOrThrow(ticketUuid, branch.id, shopId);
  const techUserId = await resolveTechnicianUserId(shopId, branch.id, technicianUuid);
  const isReassign = Boolean(ticket.assignedTechnicianId);

  await prisma.$transaction(async (tx) => {
    await tx.branchRepairTicket.update({
      where: { id: ticket.id },
      data: { assignedTechnicianId: techUserId, updatedById: userId, version: { increment: 1 } },
    });
    await recordRepairHistory(tx, {
      shopId,
      branchId: branch.id,
      repairTicketId: ticket.id,
      eventType: isReassign ? "TECHNICIAN_REASSIGNED" : "TECHNICIAN_ASSIGNED",
      title: isReassign ? "Technician reassigned" : "Technician assigned",
      oldValues: { technician_id: ticket.assignedTechnicianId },
      newValues: { technician_id: techUserId },
      performedById: userId,
    });
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_repairs.technician_assigned",
    entity: "branch_repair_ticket",
    entityId: ticketUuid,
    newValues: { technician_id: technicianUuid },
    ...getClientMeta(req),
  });

  return getRepairTicket({ shopId, branchUuid, ticketUuid });
}

export async function changeRepairStatus({ shopId, branchUuid, ticketUuid, status, notes, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const ticket = await getRepairOrThrow(ticketUuid, branch.id, shopId);
  const toStatus = status.toUpperCase();

  return transitionRepair({
    shopId,
    branch,
    ticket,
    toStatus,
    userId,
    req,
    notes,
  });
}

export async function addDiagnosis({ shopId, branchUuid, ticketUuid, diagnosis, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const ticket = await getRepairOrThrow(ticketUuid, branch.id, shopId);

  const needsStatusChange = ticket.status === "RECEIVED";
  const toStatus = needsStatusChange ? "DIAGNOSING" : ticket.status;
  if (needsStatusChange) assertRepairTransition(ticket.status, toStatus);

  await prisma.$transaction(async (tx) => {
    await tx.branchRepairTicket.update({
      where: { id: ticket.id },
      data: {
        technicianDiagnosis: diagnosis,
        status: toStatus,
        updatedById: userId,
        version: { increment: 1 },
      },
    });
    if (needsStatusChange) {
      await recordStatusHistory(tx, ticket.id, ticket.status, toStatus, userId, diagnosis);
    }
    await recordRepairHistory(tx, {
      shopId,
      branchId: branch.id,
      repairTicketId: ticket.id,
      eventType: "DIAGNOSIS_ADDED",
      title: "Diagnosis recorded",
      description: diagnosis,
      newValues: { diagnosis },
      performedById: userId,
    });
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_repairs.diagnosis_added",
    entity: "branch_repair_ticket",
    entityId: ticketUuid,
    ...getClientMeta(req),
  });

  return getRepairTicket({ shopId, branchUuid, ticketUuid });
}

export async function createEstimate({
  shopId,
  branchUuid,
  ticketUuid,
  estimatedCost,
  estimatedCompletionAt,
  userId,
  req,
}) {
  const branch = await ensureBranch(shopId, branchUuid);
  const ticket = await getRepairOrThrow(ticketUuid, branch.id, shopId);
  const toStatus = "AWAITING_CUSTOMER_APPROVAL";

  return transitionRepair({
    shopId,
    branch,
    ticket,
    toStatus,
    userId,
    req,
    eventType: "ESTIMATE_CREATED",
    eventTitle: "Repair estimate created",
    dataPatch: {
      estimatedCost,
      estimatedCompletionAt: estimatedCompletionAt ? new Date(estimatedCompletionAt) : null,
    },
    historyNewValues: { estimated_cost: estimatedCost, estimated_completion_at: estimatedCompletionAt },
  });
}

export async function recordCustomerApproval({
  shopId,
  branchUuid,
  ticketUuid,
  approved,
  approvedCost,
  notes,
  userId,
  req,
}) {
  const branch = await ensureBranch(shopId, branchUuid);
  const ticket = await getRepairOrThrow(ticketUuid, branch.id, shopId);

  if (approved) {
    return transitionRepair({
      shopId,
      branch,
      ticket,
      toStatus: "APPROVED",
      userId,
      req,
      notes,
      eventType: "CUSTOMER_APPROVED",
      eventTitle: "Customer approved estimate",
      dataPatch: { approvedCost: approvedCost ?? ticket.estimatedCost },
      historyNewValues: { approved_cost: approvedCost ?? ticket.estimatedCost },
    });
  }

  return transitionRepair({
    shopId,
    branch,
    ticket,
    toStatus: "CANCELLED",
    userId,
    req,
    notes,
    eventType: "CUSTOMER_REJECTED",
    eventTitle: "Customer rejected estimate",
    dataPatch: { cancelledAt: new Date() },
  });
}

export async function completeRepair({ shopId, branchUuid, ticketUuid, finalCost, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const ticket = await getRepairOrThrow(ticketUuid, branch.id, shopId);

  const result = await transitionRepair({
    shopId,
    branch,
    ticket,
    toStatus: "COMPLETED",
    userId,
    req,
    eventType: "COMPLETED",
    eventTitle: "Repair completed",
    dataPatch: {
      finalCost: finalCost ?? ticket.approvedCost ?? ticket.estimatedCost,
      completedAt: new Date(),
    },
    historyNewValues: { final_cost: finalCost },
  });

  if (ticket.customerId) {
    await logCustomerActivity({
      shopId,
      branchId: branch.id,
      customerId: ticket.customerId,
      activityType: "REPAIR_COMPLETED",
      title: `Repair ${ticket.ticketNumber} completed`,
      referenceType: "repair_ticket",
      referenceId: ticket.uuid,
      performedById: userId,
    });
  }

  return result;
}

export async function markReadyForCollection({ shopId, branchUuid, ticketUuid, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const ticket = await getRepairOrThrow(ticketUuid, branch.id, shopId);

  return transitionRepair({
    shopId,
    branch,
    ticket,
    toStatus: "READY_FOR_COLLECTION",
    userId,
    req,
    eventType: "READY_FOR_COLLECTION",
    eventTitle: "Ready for collection",
  });
}

export async function collectRepair({ shopId, branchUuid, ticketUuid, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const ticket = await getRepairOrThrow(ticketUuid, branch.id, shopId);

  const result = await transitionRepair({
    shopId,
    branch,
    ticket,
    toStatus: "COLLECTED",
    userId,
    req,
    eventType: "COLLECTED",
    eventTitle: "Device collected",
    dataPatch: { collectedAt: new Date() },
  });

  if (ticket.customerId) {
    await logCustomerActivity({
      shopId,
      branchId: branch.id,
      customerId: ticket.customerId,
      activityType: "DEVICE_COLLECTED",
      title: `Device collected for ${ticket.ticketNumber}`,
      referenceType: "repair_ticket",
      referenceId: ticket.uuid,
      performedById: userId,
    });
  }

  return result;
}

export async function cancelRepair({ shopId, branchUuid, ticketUuid, reason, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const ticket = await getRepairOrThrow(ticketUuid, branch.id, shopId);

  if (isRepairTerminal(ticket.status)) {
    throw new ApiError(HTTP.BAD_REQUEST, "Cannot cancel a repair in its current status");
  }

  return transitionRepair({
    shopId,
    branch,
    ticket,
    toStatus: "CANCELLED",
    userId,
    req,
    notes: reason,
    eventType: "CANCELLED",
    eventTitle: "Repair cancelled",
    dataPatch: { cancelledAt: new Date() },
  });
}

export async function archiveRepair({ shopId, branchUuid, ticketUuid, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const ticket = await getRepairOrThrow(ticketUuid, branch.id, shopId);

  const archivable = ["COLLECTED", "DELIVERED", "CANCELLED", "UNREPAIRABLE"];
  if (!archivable.includes(ticket.status)) {
    assertRepairTransition(ticket.status, "ARCHIVED");
  }

  await prisma.$transaction(async (tx) => {
    await tx.branchRepairTicket.update({
      where: { id: ticket.id },
      data: {
        status: "ARCHIVED",
        archivedAt: new Date(),
        updatedById: userId,
        version: { increment: 1 },
      },
    });
    await recordStatusHistory(tx, ticket.id, ticket.status, "ARCHIVED", userId, null);
    await recordRepairHistory(tx, {
      shopId,
      branchId: branch.id,
      repairTicketId: ticket.id,
      eventType: "UPDATED",
      title: "Repair ticket archived",
      performedById: userId,
    });
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_repairs.archived",
    entity: "branch_repair_ticket",
    entityId: ticketUuid,
    ...getClientMeta(req),
  });

  return getRepairTicket({ shopId, branchUuid, ticketUuid });
}
