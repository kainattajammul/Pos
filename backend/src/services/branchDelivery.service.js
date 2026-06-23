import { prisma } from "../config/database.js";
import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { CustomerModel } from "../models/branchOperations.model.js";
import { ensureBranch } from "./branchOperationsSettings.service.js";
import { writeAuditLog } from "./auditLog.service.js";
import { getClientMeta, normalizeText } from "../utils/branchHelpers.js";
import { decimalToString, toDecimal } from "../utils/inventoryDecimal.js";
import { ensureBranchCustomerLink } from "./branchCustomer.service.js";
import { logCustomerActivity } from "./branchCustomerActivity.service.js";

function toPublicDelivery(delivery) {
  return {
    id: delivery.uuid,
    status: delivery.status.toLowerCase(),
    delivery_method: delivery.deliveryMethod,
    customer: delivery.customer
      ? { id: delivery.customer.uuid, name: delivery.customer.displayName }
      : null,
    repair_ticket_id: delivery.repairTicket?.uuid ?? null,
    sale_id: delivery.sale?.uuid ?? null,
    address: {
      line_1: delivery.addressLine1,
      line_2: delivery.addressLine2,
      city: delivery.city,
      postcode: delivery.postcode,
    },
    delivery_fee: decimalToString(delivery.deliveryFee, 2),
    scheduled_at: delivery.scheduledAt?.toISOString() ?? null,
    courier_reference: delivery.courierReference,
    tracking_number: delivery.trackingNumber,
    delivery_notes: delivery.deliveryNotes,
    delivered_at: delivery.deliveredAt?.toISOString() ?? null,
    failed_reason: delivery.failedReason,
    created_at: delivery.createdAt.toISOString(),
  };
}

async function resolveCustomer(shopId, customerUuid) {
  if (!customerUuid) return null;
  const customer = await CustomerModel.findByUuid(customerUuid, shopId);
  if (!customer) throw new ApiError(HTTP.NOT_FOUND, "Customer not found");
  return customer;
}

async function getDeliveryOrThrow(uuid, branchId, shopId) {
  const delivery = await prisma.branchDelivery.findFirst({
    where: { uuid, branchId: Number(branchId), shopId: Number(shopId) },
    include: { customer: true, repairTicket: { select: { uuid: true } }, sale: { select: { uuid: true } } },
  });
  if (!delivery) throw new ApiError(HTTP.NOT_FOUND, "Delivery not found");
  return delivery;
}

export async function createDelivery({ shopId, branchUuid, input, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const customer = await resolveCustomer(shopId, input.customer_id);

  let repairTicketId = null;
  if (input.repair_ticket_id) {
    const ticket = await prisma.branchRepairTicket.findFirst({
      where: { uuid: input.repair_ticket_id, branchId: branch.id, shopId: Number(shopId) },
    });
    if (!ticket) throw new ApiError(HTTP.NOT_FOUND, "Repair ticket not found");
    repairTicketId = ticket.id;
  }

  let saleId = null;
  if (input.sale_id) {
    const sale = await prisma.branchSale.findFirst({
      where: { uuid: input.sale_id, branchId: branch.id, shopId: Number(shopId) },
    });
    if (!sale) throw new ApiError(HTTP.NOT_FOUND, "Sale not found");
    saleId = sale.id;
  }

  const delivery = await prisma.branchDelivery.create({
    data: {
      shopId: Number(shopId),
      branchId: branch.id,
      customerId: customer?.id ?? null,
      repairTicketId,
      saleId,
      status: (input.status ?? "PENDING").toUpperCase(),
      deliveryMethod: normalizeText(input.delivery_method),
      addressLine1: normalizeText(input.address_line_1),
      addressLine2: normalizeText(input.address_line_2),
      city: normalizeText(input.city),
      postcode: normalizeText(input.postcode),
      deliveryFee: input.delivery_fee != null ? toDecimal(input.delivery_fee) : null,
      scheduledAt: input.scheduled_at ? new Date(input.scheduled_at) : null,
      courierReference: normalizeText(input.courier_reference),
      trackingNumber: normalizeText(input.tracking_number),
      deliveryNotes: normalizeText(input.delivery_notes),
      createdById: userId,
    },
    include: { customer: true, repairTicket: { select: { uuid: true } }, sale: { select: { uuid: true } } },
  });

  if (customer) {
    await ensureBranchCustomerLink({ shopId, branchId: branch.id, customerId: customer.id });
    await logCustomerActivity({
      shopId,
      branchId: branch.id,
      customerId: customer.id,
      activityType: "DELIVERY_CREATED",
      title: "Delivery created",
      referenceType: "delivery",
      referenceId: delivery.uuid,
      performedById: userId,
    });
  }

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_operations.delivery_created",
    entity: "branch_delivery",
    entityId: delivery.uuid,
    ...getClientMeta(req),
  });

  return toPublicDelivery(delivery);
}

export async function getDelivery({ shopId, branchUuid, deliveryUuid }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const delivery = await getDeliveryOrThrow(deliveryUuid, branch.id, shopId);
  return toPublicDelivery(delivery);
}

export async function listDeliveries({ shopId, branchUuid, query }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 25));
  const skip = (page - 1) * limit;

  const where = { shopId: Number(shopId), branchId: branch.id };
  if (query.status) where.status = query.status.toUpperCase();
  if (query.from) where.scheduledAt = { ...(where.scheduledAt ?? {}), gte: new Date(query.from) };
  if (query.to) where.scheduledAt = { ...(where.scheduledAt ?? {}), lte: new Date(query.to) };

  const [rows, total] = await Promise.all([
    prisma.branchDelivery.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { customer: true, repairTicket: { select: { uuid: true } }, sale: { select: { uuid: true } } },
    }),
    prisma.branchDelivery.count({ where }),
  ]);

  return {
    data: rows.map((d) => toPublicDelivery(d)),
    pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
  };
}

export async function updateDeliveryStatus({
  shopId,
  branchUuid,
  deliveryUuid,
  status,
  input = {},
  userId,
  req,
}) {
  const branch = await ensureBranch(shopId, branchUuid);
  const delivery = await getDeliveryOrThrow(deliveryUuid, branch.id, shopId);
  const toStatus = status.toUpperCase();

  const data = { status: toStatus };
  if (input.courier_reference !== undefined) data.courierReference = normalizeText(input.courier_reference);
  if (input.tracking_number !== undefined) data.trackingNumber = normalizeText(input.tracking_number);
  if (input.delivery_notes !== undefined) data.deliveryNotes = normalizeText(input.delivery_notes);
  if (input.scheduled_at !== undefined) data.scheduledAt = input.scheduled_at ? new Date(input.scheduled_at) : null;
  if (input.proof_of_delivery !== undefined) data.proofOfDelivery = input.proof_of_delivery;

  if (toStatus === "DELIVERED") {
    data.deliveredAt = new Date();
  }
  if (toStatus === "FAILED") {
    data.failedReason = normalizeText(input.failed_reason);
  }
  if (toStatus === "CANCELLED") {
    data.failedReason = normalizeText(input.failed_reason ?? input.cancellation_reason);
  }

  const updated = await prisma.branchDelivery.update({
    where: { id: delivery.id },
    data,
    include: { customer: true },
  });

  if (toStatus === "DELIVERED" && delivery.customerId) {
    await logCustomerActivity({
      shopId,
      branchId: branch.id,
      customerId: delivery.customerId,
      activityType: "DELIVERY_COMPLETED",
      title: "Delivery completed",
      referenceType: "delivery",
      referenceId: delivery.uuid,
      performedById: userId,
    });
  }

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: `branch_operations.delivery_${toStatus.toLowerCase()}`,
    entity: "branch_delivery",
    entityId: deliveryUuid,
    newValues: { status: toStatus },
    ...getClientMeta(req),
  });

  return toPublicDelivery(updated);
}

export async function cancelDelivery({ shopId, branchUuid, deliveryUuid, reason, userId, req }) {
  return updateDeliveryStatus({
    shopId,
    branchUuid,
    deliveryUuid,
    status: "CANCELLED",
    input: { failed_reason: reason },
    userId,
    req,
  });
}
