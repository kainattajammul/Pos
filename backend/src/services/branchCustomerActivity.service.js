import { prisma } from "../config/database.js";
import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { ensureBranch } from "./branchOperationsSettings.service.js";
import { resolveCustomerVisibility } from "./branchCustomerVisibility.service.js";

export async function logCustomerActivity({
  shopId,
  branchId,
  customerId,
  activityType,
  title,
  description,
  referenceType,
  referenceId,
  metadata,
  performedById,
}) {
  return prisma.branchCustomerActivity.create({
    data: {
      shopId: Number(shopId),
      branchId: Number(branchId),
      customerId: Number(customerId),
      activityType,
      title,
      description,
      referenceType,
      referenceId,
      metadata,
      performedById,
    },
  });
}

export async function listCustomerActivities({
  shopId,
  branchUuid,
  customerUuid,
  query,
  permissions,
}) {
  const branch = await ensureBranch(shopId, branchUuid);

  const customer = await prisma.customer.findFirst({
    where: { uuid: customerUuid, shopId: Number(shopId), archivedAt: null },
  });
  if (!customer) throw new ApiError(HTTP.NOT_FOUND, "Customer not found");

  const visibility = await resolveCustomerVisibility({
    shopId,
    branchId: branch.id,
    customerId: customer.id,
    permissions,
  });

  if (!visibility.canViewActivity) {
    throw new ApiError(HTTP.FORBIDDEN, "Activity history is not visible");
  }

  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 25));
  const skip = (page - 1) * limit;

  const where = {
    shopId: Number(shopId),
    customerId: customer.id,
    ...(visibility.crossBranch ? {} : { branchId: branch.id }),
  };
  if (query.activity_type) where.activityType = query.activity_type.toUpperCase();

  const [rows, total] = await Promise.all([
    prisma.branchCustomerActivity.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.branchCustomerActivity.count({ where }),
  ]);

  return {
    data: rows.map((a) => ({
      id: a.uuid,
      activity_type: a.activityType.toLowerCase(),
      title: a.title,
      description: a.description,
      reference_type: a.referenceType,
      reference_id: a.referenceId,
      created_at: a.createdAt.toISOString(),
    })),
    pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
  };
}
