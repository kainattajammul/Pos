import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { BranchModel } from "../models/branch.model.js";
import { BranchSecurityRuleModel } from "../models/branchStaff.model.js";
import { DEFAULT_SECURITY_RULES } from "../constants/branchStaffPermissions.js";
import { writeAuditLog } from "./auditLog.service.js";
import { toPublicSecurityRule } from "../utils/branchStaffMapper.js";
import { calculateBranchOpeningStatus } from "./branchOpeningStatus.service.js";

const RULE_VALIDATORS = {
  maximum_discount_percentage: (value) =>
    typeof value?.percentage === "number" && value.percentage >= 0 && value.percentage <= 100,
  maximum_refund_amount: (value) =>
    typeof value?.amount === "number" && value.amount >= 0,
  session_timeout_minutes: (value) =>
    typeof value?.minutes === "number" && value.minutes >= 5,
};

async function ensureBranch(shopId, branchUuid) {
  const branch = await BranchModel.findByUuid(branchUuid, shopId);
  if (!branch) throw new ApiError(HTTP.NOT_FOUND, "Branch not found");
  return branch;
}

export async function ensureDefaultSecurityRules(branchId, shopId, userId) {
  for (const template of DEFAULT_SECURITY_RULES) {
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

export async function getRules(shopId, branchUuid) {
  const branch = await ensureBranch(shopId, branchUuid);
  await ensureDefaultSecurityRules(branch.id, shopId, null);
  const rules = await BranchSecurityRuleModel.list(branch.id, shopId);
  return rules.map(toPublicSecurityRule);
}

export async function getRule(shopId, branchUuid, ruleKey) {
  const branch = await ensureBranch(shopId, branchUuid);
  const rule = await BranchSecurityRuleModel.findByKey(branch.id, shopId, ruleKey);
  if (!rule) throw new ApiError(HTTP.NOT_FOUND, "Security rule not found");
  return toPublicSecurityRule(rule);
}

function validateRuleValue(ruleKey, value) {
  const validator = RULE_VALIDATORS[ruleKey];
  if (validator && !validator(value)) {
    throw new ApiError(HTTP.BAD_REQUEST, `Invalid value for security rule: ${ruleKey}`);
  }
}

export async function updateRule(shopId, branchUuid, ruleKey, payload, auditContext) {
  const branch = await ensureBranch(shopId, branchUuid);
  validateRuleValue(ruleKey, payload.value);

  const existing = await BranchSecurityRuleModel.findByKey(branch.id, shopId, ruleKey);
  const updated = await BranchSecurityRuleModel.upsert(branch.id, shopId, ruleKey, {
    name: payload.name ?? existing?.name ?? ruleKey,
    description: payload.description ?? existing?.description ?? null,
    value: payload.value ?? existing?.value,
    isEnabled: payload.is_enabled ?? existing?.isEnabled ?? true,
    updatedById: auditContext.userId ?? null,
    ...(existing ? {} : { createdById: auditContext.userId ?? null }),
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId: auditContext.userId,
    action: "branch_security_rule.updated",
    entity: "branch_security_rule",
    entityId: ruleKey,
    oldValues: existing,
    newValues: updated,
    ipAddress: auditContext.ipAddress,
    userAgent: auditContext.userAgent,
  });

  return toPublicSecurityRule(updated);
}

export async function updateRules(shopId, branchUuid, payload, auditContext) {
  const results = [];
  for (const rule of payload.rules ?? []) {
    results.push(await updateRule(shopId, branchUuid, rule.rule_key, rule, auditContext));
  }
  return results;
}

export async function isActionAllowed(branch, ruleKey, context = {}) {
  const rule = await BranchSecurityRuleModel.findByKey(branch.id, branch.shopId, ruleKey);
  if (!rule || !rule.isEnabled) return { allowed: true, reason: "Rule not enabled" };

  if (ruleKey === "restrict_login_to_opening_hours") {
    const opening = calculateBranchOpeningStatus(branch, { at: new Date() });
    if (rule.value?.enabled && !opening.is_open) {
      return { allowed: false, reason: "Branch is outside opening hours" };
    }
  }

  if (ruleKey === "require_branch_assignment" && rule.value?.enabled) {
    if (!context.hasBranchAssignment) {
      return { allowed: false, reason: "Branch assignment required" };
    }
  }

  if (ruleKey === "require_manager_for_refunds" && context.action === "refund") {
    if (rule.value?.enabled && !context.isManager) {
      return { allowed: false, reason: "Manager approval required for refunds" };
    }
  }

  return { allowed: true, reason: "Allowed by security rules" };
}

export async function validateBranchAccess(branch, authContext) {
  const rules = await BranchSecurityRuleModel.list(branch.id, branch.shopId);
  for (const rule of rules.filter((r) => r.isEnabled)) {
    const result = await isActionAllowed(branch, rule.ruleKey, {
      hasBranchAssignment: authContext.branchIds?.includes(branch.uuid),
      isManager: false,
    });
    if (!result.allowed) return result;
  }
  return { allowed: true };
}
