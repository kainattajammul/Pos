import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { DEFAULT_SECURITY_RULES } from "../constants/branchStaffPermissions.js";
import { EXTENDED_SECURITY_RULES } from "../constants/branchSecurityRuleRegistry.js";
import { BranchSecurityRuleModel } from "../models/branchStaff.model.js";
import * as BranchSecurityService from "./branchSecurity.service.js";
import { toPublicSecurityRule } from "../utils/branchStaffMapper.js";
import { writeAuditLog } from "./auditLog.service.js";
import { getClientMeta } from "../utils/branchHelpers.js";
import { ensureBranch } from "./branchSyncConnection.service.js";
import { prisma } from "../config/database.js";

const ALL_RULE_TEMPLATES = [...DEFAULT_SECURITY_RULES, ...EXTENDED_SECURITY_RULES];

export async function ensureExtendedSecurityRules(branchId, shopId, userId) {
  await BranchSecurityService.ensureDefaultSecurityRules(branchId, shopId, userId);
  for (const template of EXTENDED_SECURITY_RULES) {
    const existing = await BranchSecurityRuleModel.findByKey(branchId, shopId, template.ruleKey);
    if (!existing) {
      await BranchSecurityRuleModel.upsert(branchId, shopId, template.ruleKey, {
        name: template.name,
        description: template.description,
        value: template.value,
        isEnabled: true,
        createdById: userId ?? null,
        updatedById: userId ?? null,
      });
    }
  }
}

export async function getEffectiveRules(shopId, branchUuid) {
  const branch = await ensureBranch(shopId, branchUuid);
  await ensureExtendedSecurityRules(branch.id, shopId, null);
  const rules = await BranchSecurityRuleModel.list(branch.id, shopId);
  return rules.map(toPublicSecurityRule);
}

export async function getRule(shopId, branchUuid, ruleKey) {
  const branch = await ensureBranch(shopId, branchUuid);
  const rule = await BranchSecurityRuleModel.findByKey(branch.id, shopId, ruleKey);
  if (!rule) throw new ApiError(HTTP.NOT_FOUND, "Security rule not found");
  return toPublicSecurityRule(rule);
}

export async function updateRule(shopId, branchUuid, ruleKey, payload, auditContext) {
  const template = ALL_RULE_TEMPLATES.find((r) => r.ruleKey === ruleKey);
  if (!template && !payload.value) {
    throw new ApiError(HTTP.BAD_REQUEST, "Unknown security rule key");
  }
  return BranchSecurityService.updateRule(shopId, branchUuid, ruleKey, payload, auditContext);
}

export async function setRuleEnabled(shopId, branchUuid, ruleKey, enabled, auditContext) {
  return updateRule(shopId, branchUuid, ruleKey, { is_enabled: enabled }, auditContext);
}

export async function evaluateRule(branch, ruleKey, context = {}) {
  return BranchSecurityService.isActionAllowed(branch, ruleKey, context);
}

export async function authorizeAction(branch, authContext, action, context = {}) {
  const result = await BranchSecurityService.isActionAllowed(branch, action, {
    ...context,
    hasBranchAssignment: authContext.branchIds?.includes(branch.uuid),
    action,
  });
  return result;
}

export async function simulateAction(shopId, branchUuid, { action, context = {} }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const rules = await BranchSecurityRuleModel.list(branch.id, shopId);
  const evaluations = [];

  for (const rule of rules.filter((r) => r.isEnabled)) {
    const result = await BranchSecurityService.isActionAllowed(branch, rule.ruleKey, {
      ...context,
      action,
    });
    evaluations.push({
      rule_key: rule.ruleKey,
      name: rule.name,
      enforcement_mode: rule.enforcementMode?.toLowerCase?.() ?? "enforce",
      allowed: result.allowed,
      reason: result.reason,
    });
  }

  const blocked = evaluations.filter((e) => !e.allowed);
  return {
    action,
    allowed: blocked.length === 0,
    evaluations,
    blocked_rules: blocked.map((b) => b.rule_key),
  };
}

export async function recordViolation({
  shopId,
  branchId,
  ruleKey,
  eventType,
  severity = "WARNING",
  actorUserId,
  description,
  metadata,
  ipAddress,
  userAgent,
}) {
  return prisma.branchSecurityEvent.create({
    data: {
      shopId: Number(shopId),
      branchId: branchId != null ? Number(branchId) : null,
      ruleKey,
      eventType,
      severity,
      actorUserId: actorUserId ?? null,
      description,
      metadata,
      ipAddress,
      userAgent,
    },
  });
}

export async function getTwoFactorRequired(branchId, shopId) {
  const rule = await BranchSecurityRuleModel.findByKey(
    branchId,
    shopId,
    "require_two_factor_authentication",
  );
  return Boolean(rule?.isEnabled && rule?.value?.enabled);
}

export async function setTwoFactorRequired(branchId, shopId, enabled, auditContext) {
  await ensureExtendedSecurityRules(branchId, shopId, auditContext.userId);
  const existing = await BranchSecurityRuleModel.findByKey(
    branchId,
    shopId,
    "require_two_factor_authentication",
  );
  const template = EXTENDED_SECURITY_RULES.find((r) => r.ruleKey === "require_two_factor_authentication");

  const updated = await BranchSecurityRuleModel.upsert(branchId, shopId, "require_two_factor_authentication", {
    name: template?.name ?? "Require two-factor authentication",
    description: template?.description ?? null,
    value: { enabled: Boolean(enabled) },
    isEnabled: true,
    updatedById: auditContext.userId ?? null,
    ...(existing ? {} : { createdById: auditContext.userId ?? null }),
  });

  await writeAuditLog({
    shopId,
    branchId,
    userId: auditContext.userId,
    action: "branch_security_rule.changed",
    entity: "branch_security_rule",
    entityId: "require_two_factor_authentication",
    oldValues: existing,
    newValues: updated,
    ipAddress: auditContext.ipAddress,
    userAgent: auditContext.userAgent,
  });

  return Boolean(enabled);
}

export async function countSecurityRulesSummary(branchId, shopId) {
  const [active, disabled] = await Promise.all([
    prisma.branchSecurityRule.count({
      where: { branchId: Number(branchId), shopId: Number(shopId), isEnabled: true },
    }),
    prisma.branchSecurityRule.count({
      where: { branchId: Number(branchId), shopId: Number(shopId), isEnabled: false },
    }),
  ]);
  return { activeRules: active, disabledRules: disabled };
}
