import { body, param, query } from "express-validator";

export const branchSystemContextRules = [
  param("shopId").isInt({ min: 1 }),
  param("branchUuid").isUUID(),
];

export const listQueryRules = [
  ...branchSystemContextRules,
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("search").optional().isString(),
  query("sort").optional().isString(),
  query("direction").optional().isIn(["asc", "desc"]),
  query("date_from").optional().isISO8601(),
  query("date_to").optional().isISO8601(),
];

export const activityLogQueryRules = [
  ...listQueryRules,
  query("user_id").optional().isInt({ min: 1 }),
  query("module").optional().isString(),
  query("action").optional().isString(),
  query("entity_type").optional().isString(),
  query("entity_id").optional().isString(),
  query("ip_address").optional().isString(),
];

export const activityIdParam = [
  ...branchSystemContextRules,
  param("activityId").isInt({ min: 1 }),
];

export const systemSettingsUpdateRules = [
  ...branchSystemContextRules,
  body("franchise_owner").optional().isString(),
  body("two_factor_required").optional().isBoolean(),
];

export const connectionUuidParam = [
  ...branchSystemContextRules,
  param("connectionId").isUUID(),
];

export const createConnectionRules = [
  ...branchSystemContextRules,
  body("connection_code").notEmpty(),
  body("name").notEmpty(),
  body("provider").notEmpty(),
  body("sync_type").notEmpty(),
  body("direction").optional().isString(),
  body("schedule_type").optional().isString(),
  body("conflict_strategy").optional().isString(),
];

export const updateConnectionRules = [
  ...connectionUuidParam,
  body("name").optional().isString(),
  body("is_enabled").optional().isBoolean(),
  body("schedule_type").optional().isString(),
  body("schedule_expression").optional().isString(),
  body("conflict_strategy").optional().isString(),
];

export const jobUuidParam = [
  ...branchSystemContextRules,
  param("jobId").isUUID(),
];

export const jobItemResolveRules = [
  ...jobUuidParam,
  param("itemId").isUUID(),
  body("resolution").isIn(["keep_local", "keep_external", "merge", "skip", "retry_later"]),
  body("reason").optional().isString(),
];

export const settingsNamespaceParam = [
  ...branchSystemContextRules,
  param("namespace").notEmpty(),
];

export const settingsKeyParam = [
  ...settingsNamespaceParam,
  param("key").notEmpty(),
];

export const bulkSettingsUpdateRules = [
  ...branchSystemContextRules,
  body("settings").isArray({ min: 1 }),
  body("settings.*.namespace").notEmpty(),
  body("settings.*.key").notEmpty(),
];

export const patchSettingRules = [
  ...settingsKeyParam,
  body("value").exists(),
  body("version").optional().isInt({ min: 0 }),
  body("change_reason").optional().isString(),
];

export const securityRuleKeyParam = [
  ...branchSystemContextRules,
  param("ruleKey").notEmpty(),
];

export const patchSecurityRuleRules = [
  ...securityRuleKeyParam,
  body("value").optional(),
  body("is_enabled").optional().isBoolean(),
  body("enforcement_mode").optional().isIn(["monitor", "warn", "enforce", "MONITOR", "WARN", "ENFORCE"]),
];

export const simulateSecurityRules = [
  ...branchSystemContextRules,
  body("action").notEmpty(),
  body("context").optional().isObject(),
];

export const securityEventUuidParam = [
  ...branchSystemContextRules,
  param("eventId").isUUID(),
];

export const resolveEventRules = [
  ...securityEventUuidParam,
  body("notes").optional().isString(),
];

export const ownershipUuidParam = [
  ...branchSystemContextRules,
  param("ownershipId").isUUID(),
];

export const createOwnershipRules = [
  ...branchSystemContextRules,
  body("ownership_type").optional().isString(),
  body("ownership_percentage").optional().isFloat({ min: 0, max: 100 }),
  body("is_primary_owner").optional().isBoolean(),
  body("entity").optional().isObject(),
  body("business_entity_id").optional().isUUID(),
];

export const updateOwnershipRules = [
  ...ownershipUuidParam,
  body("ownership_percentage").optional().isFloat({ min: 0, max: 100 }),
  body("is_primary_owner").optional().isBoolean(),
  body("notes").optional().isString(),
  body("agreement_reference").optional().isString(),
];
