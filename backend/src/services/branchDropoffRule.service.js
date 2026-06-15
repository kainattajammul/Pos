import { prisma } from "../config/database.js";
import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { ensureBranch } from "./branchOperationsSettings.service.js";
import { writeAuditLog } from "./auditLog.service.js";
import { getClientMeta, normalizeText } from "../utils/branchHelpers.js";

function toPublicDropoffRule(rule) {
  return {
    id: rule.uuid,
    name: rule.name,
    dropoff_type: rule.dropoffType.toLowerCase(),
    is_enabled: rule.isEnabled,
    location_name: rule.locationName,
    address: rule.address,
    instructions: rule.instructions,
    requires_appointment: rule.requiresAppointment,
    requires_repair_ticket: rule.requiresRepairTicket,
    requires_id_check: rule.requiresIdCheck,
    requires_packaging: rule.requiresPackaging,
    requires_device_backup: rule.requiresDeviceBackup,
    requires_passcode: rule.requiresPasscode,
    minimum_notice_minutes: rule.minimumNoticeMinutes,
    allowed_from_time: rule.allowedFromTime,
    allowed_until_time: rule.allowedUntilTime,
    accepted_device_types: rule.acceptedDeviceTypes,
    restricted_items: rule.restrictedItems,
    required_documents: rule.requiredDocuments,
    priority: rule.priority,
  };
}

export async function listDropoffRules({ shopId, branchUuid, query }) {
  const branch = await ensureBranch(shopId, branchUuid);

  const where = {
    shopId: Number(shopId),
    branchId: branch.id,
    isEnabled: query.include_disabled === "true" ? undefined : true,
  };
  if (query.dropoff_type) where.dropoffType = query.dropoff_type.toUpperCase();

  const rules = await prisma.branchDropoffRule.findMany({
    where,
    orderBy: [{ priority: "asc" }, { name: "asc" }],
  });

  return { data: rules.map(toPublicDropoffRule) };
}

export async function getDropoffRule({ shopId, branchUuid, ruleUuid }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const rule = await prisma.branchDropoffRule.findFirst({
    where: { uuid: ruleUuid, branchId: branch.id, shopId: Number(shopId) },
  });
  if (!rule) throw new ApiError(HTTP.NOT_FOUND, "Dropoff rule not found");
  return toPublicDropoffRule(rule);
}

export async function createDropoffRule({ shopId, branchUuid, input, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);

  const rule = await prisma.branchDropoffRule.create({
    data: {
      shopId: Number(shopId),
      branchId: branch.id,
      name: normalizeText(input.name),
      dropoffType: (input.dropoff_type ?? "IN_STORE_COUNTER").toUpperCase(),
      isEnabled: input.is_enabled ?? true,
      locationName: normalizeText(input.location_name),
      address: normalizeText(input.address),
      instructions: normalizeText(input.instructions),
      requiresAppointment: input.requires_appointment ?? false,
      requiresRepairTicket: input.requires_repair_ticket ?? true,
      requiresIdCheck: input.requires_id_check ?? false,
      requiresPackaging: input.requires_packaging ?? false,
      requiresDeviceBackup: input.requires_device_backup ?? false,
      requiresPasscode: input.requires_passcode ?? false,
      minimumNoticeMinutes: input.minimum_notice_minutes ?? null,
      allowedFromTime: input.allowed_from_time ?? null,
      allowedUntilTime: input.allowed_until_time ?? null,
      acceptedDeviceTypes: input.accepted_device_types ?? null,
      restrictedItems: input.restricted_items ?? null,
      requiredDocuments: input.required_documents ?? null,
      priority: input.priority ?? 100,
    },
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_operations.dropoff_rule_created",
    entity: "branch_dropoff_rule",
    entityId: rule.uuid,
    ...getClientMeta(req),
  });

  return toPublicDropoffRule(rule);
}

export async function updateDropoffRule({ shopId, branchUuid, ruleUuid, input, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const existing = await prisma.branchDropoffRule.findFirst({
    where: { uuid: ruleUuid, branchId: branch.id, shopId: Number(shopId) },
  });
  if (!existing) throw new ApiError(HTTP.NOT_FOUND, "Dropoff rule not found");

  const data = {};
  if (input.name !== undefined) data.name = normalizeText(input.name);
  if (input.dropoff_type !== undefined) data.dropoffType = input.dropoff_type.toUpperCase();
  if (input.is_enabled !== undefined) data.isEnabled = input.is_enabled;
  if (input.location_name !== undefined) data.locationName = normalizeText(input.location_name);
  if (input.address !== undefined) data.address = normalizeText(input.address);
  if (input.instructions !== undefined) data.instructions = normalizeText(input.instructions);
  if (input.requires_appointment !== undefined) data.requiresAppointment = input.requires_appointment;
  if (input.requires_repair_ticket !== undefined) data.requiresRepairTicket = input.requires_repair_ticket;
  if (input.requires_id_check !== undefined) data.requiresIdCheck = input.requires_id_check;
  if (input.requires_packaging !== undefined) data.requiresPackaging = input.requires_packaging;
  if (input.requires_device_backup !== undefined) data.requiresDeviceBackup = input.requires_device_backup;
  if (input.requires_passcode !== undefined) data.requiresPasscode = input.requires_passcode;
  if (input.minimum_notice_minutes !== undefined) data.minimumNoticeMinutes = input.minimum_notice_minutes;
  if (input.allowed_from_time !== undefined) data.allowedFromTime = input.allowed_from_time;
  if (input.allowed_until_time !== undefined) data.allowedUntilTime = input.allowed_until_time;
  if (input.accepted_device_types !== undefined) data.acceptedDeviceTypes = input.accepted_device_types;
  if (input.restricted_items !== undefined) data.restrictedItems = input.restricted_items;
  if (input.required_documents !== undefined) data.requiredDocuments = input.required_documents;
  if (input.priority !== undefined) data.priority = input.priority;

  const updated = await prisma.branchDropoffRule.update({ where: { id: existing.id }, data });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_operations.dropoff_rule_updated",
    entity: "branch_dropoff_rule",
    entityId: ruleUuid,
    newValues: input,
    ...getClientMeta(req),
  });

  return toPublicDropoffRule(updated);
}

export async function deleteDropoffRule({ shopId, branchUuid, ruleUuid, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const existing = await prisma.branchDropoffRule.findFirst({
    where: { uuid: ruleUuid, branchId: branch.id, shopId: Number(shopId) },
  });
  if (!existing) throw new ApiError(HTTP.NOT_FOUND, "Dropoff rule not found");

  await prisma.branchDropoffRule.delete({ where: { id: existing.id } });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_operations.dropoff_rule_deleted",
    entity: "branch_dropoff_rule",
    entityId: ruleUuid,
    ...getClientMeta(req),
  });

  return { id: ruleUuid, deleted: true };
}
