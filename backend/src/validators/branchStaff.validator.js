import { body, param, query } from "express-validator";
import {
  BRANCH_STAFF_STATUSES,
  PERMISSION_EFFECTS,
  STAFF_SHIFT_STATUSES,
} from "../constants/branchStaffEnums.js";
import { branchUuidParamRules } from "./branch.validator.js";

export const branchStaffContextRules = [
  param("shopId").isInt({ min: 1 }),
  ...branchUuidParamRules,
];

export const assignmentUuidRules = [
  ...branchStaffContextRules,
  param("assignmentUuid").isUUID(),
];

export const roleUuidRules = [
  ...assignmentUuidRules,
  param("roleUuid").isUUID(),
];

export const shiftUuidRules = [
  ...branchStaffContextRules,
  param("shiftUuid").isUUID(),
];

export const listStaffRules = [
  ...branchStaffContextRules,
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("search").optional().isString(),
  query("status").optional().isIn(BRANCH_STAFF_STATUSES),
  query("role").optional().isString(),
  query("sort").optional().isIn(["name", "created_at", "assignment_date"]),
  query("direction").optional().isIn(["asc", "desc"]),
];

export const assignStaffRules = [
  ...branchStaffContextRules,
  body("user_id").notEmpty().withMessage("user_id is required"),
  body("employment_title").optional().isString(),
  body("employee_code").optional().isString(),
  body("status").optional().isIn(BRANCH_STAFF_STATUSES),
  body("is_primary_branch").optional().isBoolean(),
  body("start_date").optional().isISO8601(),
  body("end_date").optional().isISO8601(),
  body("role_ids").optional().isArray(),
];

export const updateStaffRules = [
  ...assignmentUuidRules,
  body("employment_title").optional().isString(),
  body("employee_code").optional().isString(),
  body("is_primary_branch").optional().isBoolean(),
  body("start_date").optional({ nullable: true }).isISO8601(),
  body("end_date").optional({ nullable: true }).isISO8601(),
];

export const createRoleRules = [
  ...branchStaffContextRules,
  body("name").trim().notEmpty(),
  body("code").trim().notEmpty(),
  body("description").optional().isString(),
  body("permission_keys").optional().isArray(),
];

export const updateRoleRules = [
  ...branchStaffContextRules,
  param("roleUuid").isUUID(),
  body("name").optional().trim().notEmpty(),
  body("description").optional().isString(),
  body("is_active").optional().isBoolean(),
  body("permission_keys").optional().isArray(),
];

export const updatePermissionsRules = [
  ...assignmentUuidRules,
  body("permissions").isArray(),
  body("permissions.*.key").isString(),
  body("permissions.*.effect").isIn(PERMISSION_EFFECTS),
  body("permissions.*.expires_at").optional({ nullable: true }).isISO8601(),
];

export const createShiftRules = [
  ...branchStaffContextRules,
  body("staff_assignment_id").isUUID(),
  body("starts_at").isISO8601(),
  body("ends_at").isISO8601(),
  body("shift_date").optional().isISO8601(),
  body("title").optional().isString(),
  body("break_minutes").optional().isInt({ min: 0 }),
  body("notes").optional().isString(),
  body("status").optional().isIn(STAFF_SHIFT_STATUSES),
];

export const updateShiftRules = [
  ...shiftUuidRules,
  body("starts_at").optional().isISO8601(),
  body("ends_at").optional().isISO8601(),
  body("title").optional().isString(),
  body("break_minutes").optional().isInt({ min: 0 }),
  body("notes").optional().isString(),
  body("status").optional().isIn(STAFF_SHIFT_STATUSES),
];

export const listRotaRules = [
  ...branchStaffContextRules,
  query("from").optional().isISO8601(),
  query("to").optional().isISO8601(),
  query("status").optional().isIn(STAFF_SHIFT_STATUSES),
  query("staff_assignment_id").optional().isUUID(),
  query("role").optional().isString(),
];

export const publishRotaRules = [
  ...branchStaffContextRules,
  body("from").optional().isISO8601(),
  body("to").optional().isISO8601(),
];

export const copyWeekRules = [
  ...branchStaffContextRules,
  body("source_week_start").isISO8601(),
  body("target_week_start").isISO8601(),
];

export const listPerformanceRules = [
  ...branchStaffContextRules,
  query("from").optional().isISO8601(),
  query("to").optional().isISO8601(),
  query("period_type").optional().isString(),
  query("role").optional().isString(),
];

export const updateSecurityRuleRules = [
  ...branchStaffContextRules,
  param("ruleKey").optional().isString(),
  body("value").optional(),
  body("is_enabled").optional().isBoolean(),
  body("rules").optional().isArray(),
];
