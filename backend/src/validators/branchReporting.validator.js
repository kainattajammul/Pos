import { body, param, query } from "express-validator";

export const branchReportingContextRules = [
  param("shopId").isInt({ min: 1 }),
  param("branchUuid").isUUID(),
];

export const reportQueryRules = [
  ...branchReportingContextRules,
  query("period").optional().isString(),
  query("date_from").optional().isISO8601(),
  query("date_to").optional().isISO8601(),
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
];

export const reportingSettingsUpdateRules = [
  ...branchReportingContextRules,
  body("sales_target_monthly").optional().isString(),
  body("repair_target_monthly").optional().isInt({ min: 0 }),
  body("commission_rules").optional().isString(),
  body("default_comparison_period").optional().isString(),
];

export const createExportRules = [
  ...branchReportingContextRules,
  body("report_code").notEmpty(),
  body("format").optional().isIn(["csv", "xlsx", "pdf", "CSV", "XLSX", "PDF"]),
];

export const exportUuidParam = [...branchReportingContextRules, param("exportUuid").isUUID()];
