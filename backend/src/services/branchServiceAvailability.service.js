import { prisma } from "../config/database.js";
import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { ensureBranch } from "./branchInventoryAllocation.service.js";
import { ServiceModel } from "../models/branchInventory.model.js";
import { decimalToString } from "../utils/inventoryDecimal.js";

export async function getServiceAvailability({ shopId, branchUuid, serviceUuid }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const service = await ServiceModel.findByUuid(serviceUuid, shopId);
  if (!service) throw new ApiError(HTTP.NOT_FOUND, "Service not found");

  const record = await prisma.branchServiceAvailability.findUnique({
    where: { branchId_serviceId: { branchId: branch.id, serviceId: service.id } },
  });

  return formatServiceAvailability(service, record);
}

function formatServiceAvailability(service, record) {
  if (!record) {
    return {
      service_id: service.uuid,
      service_name: service.name,
      status: "unavailable",
      is_visible: false,
      is_bookable: false,
      reason: "Service not enabled for this branch",
    };
  }

  const now = new Date();
  let reason = record.unavailableReason;
  let status = record.status.toLowerCase();

  if (record.availableFrom && now < record.availableFrom) {
    status = "temporarily_unavailable";
    reason = "Service is not yet available at this branch";
  }
  if (record.availableUntil && now > record.availableUntil) {
    status = "temporarily_unavailable";
    reason = "Service availability has ended";
  }

  if (record.availabilityRules?.weekdays) {
    const day = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][now.getDay()];
    if (!record.availabilityRules.weekdays.includes(day)) {
      status = "temporarily_unavailable";
      reason = "Service not available on this day";
    }
  }

  return {
    service_id: service.uuid,
    service_name: service.name,
    status,
    is_visible: record.isVisible,
    is_bookable: record.isBookable,
    accepts_walk_ins: record.acceptsWalkIns,
    accepts_online_bookings: record.acceptsOnlineBookings,
    branch_price: decimalToString(record.branchPrice, 2),
    estimated_minutes: record.estimatedMinutes,
    daily_capacity: record.dailyCapacity,
    unavailable_reason: reason,
  };
}

export async function updateServiceAvailability({ shopId, branchUuid, serviceUuid, input, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const service = await ServiceModel.findByUuid(serviceUuid, shopId);
  if (!service) throw new ApiError(HTTP.NOT_FOUND, "Service not found");

  const data = {
    status: input.status?.toUpperCase() ?? "AVAILABLE",
    isVisible: input.is_visible ?? true,
    isBookable: input.is_bookable ?? true,
    acceptsWalkIns: input.accepts_walk_ins ?? true,
    acceptsOnlineBookings: input.accepts_online_bookings ?? true,
    branchPrice: input.branch_price ?? null,
    estimatedMinutes: input.estimated_minutes ?? null,
    dailyCapacity: input.daily_capacity ?? null,
    availableFrom: input.available_from ? new Date(input.available_from) : null,
    availableUntil: input.available_until ? new Date(input.available_until) : null,
    unavailableReason: input.unavailable_reason ?? null,
    availabilityRules: input.availability_rules ?? null,
  };

  const record = await prisma.branchServiceAvailability.upsert({
    where: { branchId_serviceId: { branchId: branch.id, serviceId: service.id } },
    create: { shopId: Number(shopId), branchId: branch.id, serviceId: service.id, ...data },
    update: data,
  });

  const { writeAuditLog } = await import("./auditLog.service.js");
  const { getClientMeta } = await import("../utils/branchHelpers.js");
  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_inventory.service_availability.changed",
    entity: "branch_service_availability",
    entityId: record.uuid,
    newValues: input,
    ...getClientMeta(req),
  });

  return formatServiceAvailability(service, record);
}

export async function listServiceAvailability({ shopId, branchUuid, query }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const rows = await prisma.branchServiceAvailability.findMany({
    where: { shopId: Number(shopId), branchId: branch.id },
    include: { service: true },
    take: Math.min(100, Number(query.limit) || 50),
  });

  return {
    data: rows.map((r) => formatServiceAvailability(r.service, r)),
  };
}

export async function bulkServiceAvailability({ shopId, branchUuid, items, userId, req }) {
  const results = [];
  for (const item of items) {
    const result = await updateServiceAvailability({
      shopId,
      branchUuid,
      serviceUuid: item.service_id,
      input: item,
      userId,
      req,
    });
    results.push(result);
  }
  return { updated_count: results.length, data: results };
}
