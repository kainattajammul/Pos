import { prisma } from "../config/database.js";
import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { CustomerModel } from "../models/branchOperations.model.js";
import { ensureBranch } from "./branchOperationsSettings.service.js";
import { writeAuditLog } from "./auditLog.service.js";
import { getClientMeta, normalizeEmail, normalizePhone, normalizeText } from "../utils/branchHelpers.js";
import { toPublicCustomer } from "../mappers/branchOperations.mapper.js";
import { resolveCustomerVisibility } from "./branchCustomerVisibility.service.js";
import { logCustomerActivity } from "./branchCustomerActivity.service.js";

export async function ensureBranchCustomerLink({ shopId, branchId, customerId }) {
  return prisma.branchCustomer.upsert({
    where: { branchId_customerId: { branchId: Number(branchId), customerId: Number(customerId) } },
    create: {
      shopId: Number(shopId),
      branchId: Number(branchId),
      customerId: Number(customerId),
    },
    update: { lastInteractionAt: new Date() },
  });
}

function buildDisplayName(input) {
  if (input.display_name) return normalizeText(input.display_name);
  const parts = [input.first_name, input.last_name].filter(Boolean).map((s) => String(s).trim());
  if (parts.length) return parts.join(" ");
  return input.email || input.phone || "Customer";
}

export async function createCustomer({ shopId, branchUuid, input, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);

  const customer = await prisma.customer.create({
    data: {
      shopId: Number(shopId),
      firstName: normalizeText(input.first_name),
      lastName: normalizeText(input.last_name),
      displayName: buildDisplayName(input),
      email: normalizeEmail(input.email),
      phone: normalizePhone(input.phone),
      mobile: normalizePhone(input.mobile),
      addressLine1: normalizeText(input.address_line_1),
      addressLine2: normalizeText(input.address_line_2),
      city: normalizeText(input.city),
      county: normalizeText(input.county),
      postcode: normalizeText(input.postcode),
      country: normalizeText(input.country) ?? "United Kingdom",
      notes: normalizeText(input.notes),
    },
  });

  await ensureBranchCustomerLink({ shopId, branchId: branch.id, customerId: customer.id });

  await logCustomerActivity({
    shopId,
    branchId: branch.id,
    customerId: customer.id,
    activityType: "CUSTOMER_CREATED",
    title: "Customer created",
    performedById: userId,
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_customers.created",
    entity: "customer",
    entityId: customer.uuid,
    ...getClientMeta(req),
  });

  return toPublicCustomer({ ...customer, branchLink: { isBlocked: false } });
}

export async function updateCustomer({ shopId, branchUuid, customerUuid, input, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const existing = await CustomerModel.findByUuid(customerUuid, shopId);
  if (!existing) throw new ApiError(HTTP.NOT_FOUND, "Customer not found");

  const data = {};
  if (input.first_name !== undefined) data.firstName = normalizeText(input.first_name);
  if (input.last_name !== undefined) data.lastName = normalizeText(input.last_name);
  if (input.display_name !== undefined) data.displayName = normalizeText(input.display_name);
  if (input.email !== undefined) data.email = normalizeEmail(input.email);
  if (input.phone !== undefined) data.phone = normalizePhone(input.phone);
  if (input.mobile !== undefined) data.mobile = normalizePhone(input.mobile);
  if (input.address_line_1 !== undefined) data.addressLine1 = normalizeText(input.address_line_1);
  if (input.address_line_2 !== undefined) data.addressLine2 = normalizeText(input.address_line_2);
  if (input.city !== undefined) data.city = normalizeText(input.city);
  if (input.county !== undefined) data.county = normalizeText(input.county);
  if (input.postcode !== undefined) data.postcode = normalizeText(input.postcode);
  if (input.country !== undefined) data.country = normalizeText(input.country);
  if (input.notes !== undefined) data.notes = normalizeText(input.notes);
  if (input.is_active !== undefined) data.isActive = input.is_active;

  const updated = await prisma.customer.update({ where: { id: existing.id }, data });
  await ensureBranchCustomerLink({ shopId, branchId: branch.id, customerId: existing.id });

  await logCustomerActivity({
    shopId,
    branchId: branch.id,
    customerId: existing.id,
    activityType: "CUSTOMER_UPDATED",
    title: "Customer updated",
    performedById: userId,
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_customers.updated",
    entity: "customer",
    entityId: customerUuid,
    newValues: input,
    ...getClientMeta(req),
  });

  const link = await prisma.branchCustomer.findUnique({
    where: { branchId_customerId: { branchId: branch.id, customerId: existing.id } },
  });

  return toPublicCustomer({ ...updated, branchLink: link });
}

export async function getCustomer({ shopId, branchUuid, customerUuid, permissions }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const customer = await CustomerModel.findByUuid(customerUuid, shopId);
  if (!customer) throw new ApiError(HTTP.NOT_FOUND, "Customer not found");

  const link = await prisma.branchCustomer.findUnique({
    where: { branchId_customerId: { branchId: branch.id, customerId: customer.id } },
  });

  const visibility = await resolveCustomerVisibility({
    shopId,
    branchId: branch.id,
    customerId: customer.id,
    permissions,
  });

  if (!visibility.canView) {
    throw new ApiError(HTTP.FORBIDDEN, "Customer is not visible at this branch");
  }

  return toPublicCustomer(
    { ...customer, branchLink: link },
    { masked: visibility.masked },
  );
}

export async function listCustomers({ shopId, branchUuid, query, permissions }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 25));
  const skip = (page - 1) * limit;

  const visibility = await resolveCustomerVisibility({
    shopId,
    branchId: branch.id,
    permissions,
    listMode: true,
  });

  const where = { shopId: Number(shopId), archivedAt: null };

  if (!visibility.crossBranch) {
    where.branchCustomers = { some: { branchId: branch.id } };
  }

  if (query.search) {
    where.OR = [
      { displayName: { contains: query.search, mode: "insensitive" } },
      { email: { contains: query.search, mode: "insensitive" } },
      { phone: { contains: query.search, mode: "insensitive" } },
    ];
  }

  const [rows, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: "desc" },
      include: {
        branchCustomers: { where: { branchId: branch.id }, take: 1 },
      },
    }),
    prisma.customer.count({ where }),
  ]);

  return {
    data: rows.map((c) =>
      toPublicCustomer(
        { ...c, branchLink: c.branchCustomers[0] },
        { masked: visibility.masked },
      ),
    ),
    pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
  };
}

export async function archiveCustomer({ shopId, branchUuid, customerUuid, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const customer = await CustomerModel.findByUuid(customerUuid, shopId);
  if (!customer) throw new ApiError(HTTP.NOT_FOUND, "Customer not found");

  await prisma.customer.update({
    where: { id: customer.id },
    data: { archivedAt: new Date(), isActive: false },
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_customers.archived",
    entity: "customer",
    entityId: customerUuid,
    ...getClientMeta(req),
  });

  return { id: customerUuid, archived: true };
}
