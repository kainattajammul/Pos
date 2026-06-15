import { AuditLogModel } from "../models/branch.model.js";

export async function writeAuditLog({
  shopId,
  branchId = null,
  userId = null,
  action,
  entity,
  entityId = null,
  oldValues = null,
  newValues = null,
  ipAddress = null,
  userAgent = null,
}) {
  return AuditLogModel.create({
    shopId: Number(shopId),
    branchId: branchId != null ? Number(branchId) : null,
    userId: userId != null ? Number(userId) : null,
    action,
    entity,
    entityId: entityId != null ? String(entityId) : null,
    oldValues,
    newValues,
    ipAddress,
    userAgent,
  });
}
