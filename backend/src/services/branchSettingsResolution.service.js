import { prisma } from "../config/database.js";
import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { findSettingDefinition } from "../constants/branchSettingsRegistry.js";
import { BranchSystemModel } from "../models/branchSystem.model.js";
import { toPublicBranchSetting } from "../mappers/branchSystem.mapper.js";
import { writeAuditLog } from "./auditLog.service.js";
import { getClientMeta } from "../utils/branchHelpers.js";
import { ensureBranch } from "./branchSyncConnection.service.js";
import { parsePagination, paginationMeta } from "../utils/financeHelpers.js";

function inferValueType(value) {
  if (typeof value === "boolean") return "BOOLEAN";
  if (typeof value === "number") return "NUMBER";
  if (typeof value === "string") return "STRING";
  return "JSON";
}

function validateSettingValue(definition, value) {
  if (!definition) throw new ApiError(HTTP.BAD_REQUEST, "Unknown setting key");
  const type = definition.valueType;
  if (type === "BOOLEAN" && typeof value !== "boolean") {
    throw new ApiError(HTTP.BAD_REQUEST, "Setting must be a boolean");
  }
  if (type === "NUMBER" && typeof value !== "number") {
    throw new ApiError(HTTP.BAD_REQUEST, "Setting must be a number");
  }
  if (type === "STRING" && typeof value !== "string") {
    throw new ApiError(HTTP.BAD_REQUEST, "Setting must be a string");
  }
}

export async function getEffectiveSettings({ shopId, branchUuid, namespace }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const rows = await BranchSystemModel.listSettings(branch.id, shopId, namespace);

  return {
    data: rows.map((row) => {
      const def = findSettingDefinition(row.namespace, row.key);
      return toPublicBranchSetting(row, def, row.isInherited ? "inherited" : "branch_override");
    }),
    hasData: rows.length > 0,
  };
}

export async function getEffectiveSetting(branchId, shopId, namespace, key) {
  const row = await BranchSystemModel.findSetting(branchId, shopId, namespace, key);
  if (!row) {
    const def = findSettingDefinition(namespace, key);
    if (!def) return null;
    return {
      namespace,
      key,
      value: def.defaultValue,
      source: "system_default",
      is_inherited: true,
      version: 0,
    };
  }
  const def = findSettingDefinition(namespace, key);
  return toPublicBranchSetting(row, def, row.isInherited ? "inherited" : "branch_override");
}

export async function updateBranchSetting({
  shopId,
  branchUuid,
  namespace,
  key,
  value,
  expectedVersion,
  userId,
  req,
  changeReason,
}) {
  const branch = await ensureBranch(shopId, branchUuid);
  const definition = findSettingDefinition(namespace, key);
  validateSettingValue(definition, value);

  const existing = await BranchSystemModel.findSetting(branch.id, shopId, namespace, key);
  const valueType = definition?.valueType ?? inferValueType(value);

  const result = await prisma.$transaction(async (tx) => {
    if (existing && expectedVersion != null && existing.version !== Number(expectedVersion)) {
      throw new ApiError(HTTP.CONFLICT, "Setting was changed by another user. Reload and try again.");
    }

    const saved = existing
      ? await tx.branchSetting.update({
          where: { id: existing.id },
          data: {
            value,
            version: { increment: 1 },
            isInherited: false,
            updatedById: userId ?? null,
          },
        })
      : await tx.branchSetting.create({
          data: {
            shopId: Number(shopId),
            branchId: branch.id,
            namespace,
            key,
            value,
            valueType,
            isInherited: false,
            createdById: userId ?? null,
            updatedById: userId ?? null,
          },
        });

    await tx.branchSettingHistory.create({
      data: {
        shopId: Number(shopId),
        branchId: branch.id,
        namespace,
        key,
        oldValue: existing?.value ?? null,
        newValue: value,
        version: saved.version,
        changeReason: changeReason ?? null,
        changedById: userId ?? null,
      },
    });

    return saved;
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_settings.changed",
    entity: "branch_setting",
    entityId: `${namespace}.${key}`,
    oldValues: existing,
    newValues: result,
    ...getClientMeta(req),
  });

  return toPublicBranchSetting(result, definition, "branch_override");
}

export async function bulkUpdateSettings({ shopId, branchUuid, settings, userId, req }) {
  const results = [];
  for (const item of settings ?? []) {
    results.push(
      await updateBranchSetting({
        shopId,
        branchUuid,
        namespace: item.namespace,
        key: item.key,
        value: item.value,
        expectedVersion: item.version,
        userId,
        req,
        changeReason: item.change_reason,
      }),
    );
  }
  return results;
}

export async function resetToInherited({ shopId, branchUuid, namespace, key, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const existing = await BranchSystemModel.findSetting(branch.id, shopId, namespace, key);
  if (!existing) throw new ApiError(HTTP.NOT_FOUND, "Branch override not found");

  const def = findSettingDefinition(namespace, key);
  await prisma.$transaction(async (tx) => {
    await tx.branchSettingHistory.create({
      data: {
        shopId: Number(shopId),
        branchId: branch.id,
        namespace,
        key,
        oldValue: existing.value,
        newValue: def?.defaultValue ?? null,
        version: existing.version + 1,
        changeReason: "reset_to_inherited",
        changedById: userId ?? null,
      },
    });
    await tx.branchSetting.delete({ where: { id: existing.id } });
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_settings.reset",
    entity: "branch_setting",
    entityId: `${namespace}.${key}`,
    ...getClientMeta(req),
  });

  return getEffectiveSetting(branch.id, shopId, namespace, key);
}

export async function getSettingsHistory({ shopId, branchUuid, query = {} }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const { page, limit, skip } = parsePagination(query);
  const where = {};
  if (query.namespace) where.namespace = query.namespace;
  if (query.key) where.key = query.key;

  const [rows, total] = await Promise.all([
    BranchSystemModel.listSettingHistory(branch.id, shopId, { ...where, skip, take: limit }),
    BranchSystemModel.countSettingHistory(branch.id, shopId, where),
  ]);

  return {
    data: rows.map((r) => ({
      namespace: r.namespace,
      key: r.key,
      old_value: r.oldValue,
      new_value: r.newValue,
      version: r.version,
      change_reason: r.changeReason,
      changed_at: r.changedAt?.toISOString() ?? null,
    })),
    meta: paginationMeta(page, limit, total),
    hasData: total > 0,
  };
}

export async function countSettingsSummary(branchId, shopId) {
  const [overrides, inherited] = await Promise.all([
    prisma.branchSetting.count({
      where: { branchId: Number(branchId), shopId: Number(shopId), isInherited: false },
    }),
    prisma.branchSetting.count({
      where: { branchId: Number(branchId), shopId: Number(shopId), isInherited: true },
    }),
  ]);
  return { branchOverrides: overrides, inheritedSettings: inherited };
}
