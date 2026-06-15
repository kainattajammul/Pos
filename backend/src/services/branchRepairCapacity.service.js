import { prisma } from "../config/database.js";
import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { ensureBranch } from "./branchOperationsSettings.service.js";
import { writeAuditLog } from "./auditLog.service.js";
import { getClientMeta } from "../utils/branchHelpers.js";

const ACTIVE_REPAIR_STATUSES = [
  "RECEIVED",
  "DIAGNOSING",
  "AWAITING_CUSTOMER_APPROVAL",
  "APPROVED",
  "PARTS_REQUIRED",
  "PARTS_ORDERED",
  "READY_FOR_REPAIR",
  "IN_PROGRESS",
  "QUALITY_CHECK",
];

function toPublicCapacityRule(rule) {
  return {
    id: rule.uuid,
    service_id: rule.serviceId,
    device_category: rule.deviceCategory,
    day_of_week: rule.dayOfWeek,
    max_repairs_per_day: rule.maxRepairsPerDay,
    max_concurrent_repairs: rule.maxConcurrentRepairs,
    default_duration_minutes: rule.defaultDurationMinutes,
    emergency_capacity: rule.emergencyCapacity,
    use_technician_capacity: rule.useTechnicianCapacity,
    is_enabled: rule.isEnabled,
    effective_from: rule.effectiveFrom?.toISOString() ?? null,
    effective_until: rule.effectiveUntil?.toISOString() ?? null,
  };
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export async function getCapacityRules({ shopId, branchUuid, query }) {
  const branch = await ensureBranch(shopId, branchUuid);

  const where = {
    shopId: Number(shopId),
    branchId: branch.id,
    isEnabled: query.include_disabled === "true" ? undefined : true,
  };
  if (query.device_category) where.deviceCategory = query.device_category;
  if (query.day_of_week != null) where.dayOfWeek = Number(query.day_of_week);

  const rules = await prisma.branchRepairCapacity.findMany({
    where,
    orderBy: [{ dayOfWeek: "asc" }],
  });

  return { data: rules.map(toPublicCapacityRule) };
}

export async function upsertCapacityRule({ shopId, branchUuid, ruleUuid, input, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);

  const data = {
    serviceId: input.service_id ?? null,
    deviceCategory: input.device_category ?? null,
    dayOfWeek: input.day_of_week != null ? Number(input.day_of_week) : null,
    maxRepairsPerDay: input.max_repairs_per_day ?? null,
    maxConcurrentRepairs: input.max_concurrent_repairs ?? null,
    defaultDurationMinutes: input.default_duration_minutes ?? null,
    emergencyCapacity: input.emergency_capacity ?? 0,
    useTechnicianCapacity: input.use_technician_capacity ?? true,
    isEnabled: input.is_enabled ?? true,
    effectiveFrom: input.effective_from ? new Date(input.effective_from) : null,
    effectiveUntil: input.effective_until ? new Date(input.effective_until) : null,
    updatedById: userId,
  };

  let rule;
  if (ruleUuid) {
    const existing = await prisma.branchRepairCapacity.findFirst({
      where: { uuid: ruleUuid, branchId: branch.id, shopId: Number(shopId) },
    });
    if (!existing) throw new ApiError(HTTP.NOT_FOUND, "Capacity rule not found");
    rule = await prisma.branchRepairCapacity.update({ where: { id: existing.id }, data });
  } else {
    rule = await prisma.branchRepairCapacity.create({
      data: {
        shopId: Number(shopId),
        branchId: branch.id,
        createdById: userId,
        ...data,
      },
    });
  }

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: ruleUuid ? "branch_repair_capacity.updated" : "branch_repair_capacity.created",
    entity: "branch_repair_capacity",
    entityId: rule.uuid,
    newValues: input,
    ...getClientMeta(req),
  });

  return toPublicCapacityRule(rule);
}

export async function putCapacityRules({ shopId, branchUuid, rules, userId, req }) {
  const results = [];
  for (const input of rules) {
    const result = await upsertCapacityRule({
      shopId,
      branchUuid,
      ruleUuid: input.id ?? null,
      input,
      userId,
      req,
    });
    results.push(result);
  }
  return { data: results };
}

export async function getAvailabilityForDate(params) {
  return getRepairAvailabilityForDate(params);
}

export async function deleteCapacityRule({ shopId, branchUuid, ruleUuid, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const existing = await prisma.branchRepairCapacity.findFirst({
    where: { uuid: ruleUuid, branchId: branch.id, shopId: Number(shopId) },
  });
  if (!existing) throw new ApiError(HTTP.NOT_FOUND, "Capacity rule not found");

  await prisma.branchRepairCapacity.delete({ where: { id: existing.id } });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_repair_capacity.deleted",
    entity: "branch_repair_capacity",
    entityId: ruleUuid,
    ...getClientMeta(req),
  });

  return { id: ruleUuid, deleted: true };
}

export async function getRepairAvailabilityForDate({ shopId, branchUuid, date, deviceCategory }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const target = new Date(date);
  const dayStart = startOfDay(target);
  const dayEnd = endOfDay(target);
  const dayOfWeek = target.getDay();

  const rules = await prisma.branchRepairCapacity.findMany({
    where: {
      shopId: Number(shopId),
      branchId: branch.id,
      isEnabled: true,
      AND: [
        { OR: [{ dayOfWeek: null }, { dayOfWeek: dayOfWeek }] },
        ...(deviceCategory
          ? [{ OR: [{ deviceCategory: null }, { deviceCategory }] }]
          : []),
      ],
    },
    orderBy: { dayOfWeek: "desc" },
  });

  const rule = rules[0];
  const maxPerDay = rule?.maxRepairsPerDay ?? null;
  const maxConcurrent = rule?.maxConcurrentRepairs ?? null;

  const [bookedToday, activeNow] = await Promise.all([
    prisma.branchRepairTicket.count({
      where: {
        shopId: Number(shopId),
        branchId: branch.id,
        archivedAt: null,
        createdAt: { gte: dayStart, lte: dayEnd },
        status: { notIn: ["CANCELLED", "ARCHIVED", "DRAFT"] },
      },
    }),
    prisma.branchRepairTicket.count({
      where: {
        shopId: Number(shopId),
        branchId: branch.id,
        archivedAt: null,
        status: { in: ACTIVE_REPAIR_STATUSES },
      },
    }),
  ]);

  return {
    date: dayStart.toISOString().slice(0, 10),
    device_category: deviceCategory ?? null,
    booked_today: bookedToday,
    active_repairs: activeNow,
    max_repairs_per_day: maxPerDay,
    max_concurrent_repairs: maxConcurrent,
    remaining_daily_capacity: maxPerDay != null ? Math.max(0, maxPerDay - bookedToday) : null,
    remaining_concurrent_capacity: maxConcurrent != null ? Math.max(0, maxConcurrent - activeNow) : null,
    can_accept_new_repair:
      (maxPerDay == null || bookedToday < maxPerDay) &&
      (maxConcurrent == null || activeNow < maxConcurrent),
    default_duration_minutes: rule?.defaultDurationMinutes ?? 60,
    emergency_capacity: rule?.emergencyCapacity ?? 0,
  };
}
