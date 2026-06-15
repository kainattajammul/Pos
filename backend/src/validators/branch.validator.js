import { body, param, query } from "express-validator";
import {
  BRANCH_CLOSURE_TYPES,
  BRANCH_MANUAL_OPENING_STATUSES,
  BRANCH_STATUSES,
  BRANCH_TYPES,
  DAYS_OF_WEEK,
} from "../constants/branchEnums.js";
import {
  BRANCH_IDENTIFIER_MESSAGE,
  isBranchIdentifier,
  isValidIanaTimezone,
  isValidTimeString,
} from "../utils/branchHelpers.js";
import { validateOpeningHoursSchedule } from "../services/branchOpeningStatus.service.js";

export const shopIdParamRules = [
  param("shopId").isInt({ min: 1 }).withMessage("shopId must be a positive integer"),
];

export const branchUuidParamRules = [
  param("branchUuid").custom((value) => {
    if (isBranchIdentifier(value)) return true;
    throw new Error(BRANCH_IDENTIFIER_MESSAGE);
  }),
];

export const closureIdParamRules = [
  param("closureId").isInt({ min: 1 }).withMessage("closureId must be a positive integer"),
];

const openingHoursBodyRules = [
  body("opening_hours")
    .optional()
    .isArray({ min: 1, max: 7 })
    .withMessage("opening_hours must be an array of up to 7 day schedules"),
  body("opening_hours.*.day_of_week")
    .optional()
    .isIn(DAYS_OF_WEEK)
    .withMessage(`day_of_week must be one of: ${DAYS_OF_WEEK.join(", ")}`),
  body("opening_hours.*.is_closed").optional().isBoolean(),
  body("opening_hours.*.opens_at")
    .optional({ nullable: true })
    .custom((value) => value == null || isValidTimeString(value))
    .withMessage("opens_at must be HH:MM"),
  body("opening_hours.*.closes_at")
    .optional({ nullable: true })
    .custom((value) => value == null || isValidTimeString(value))
    .withMessage("closes_at must be HH:MM"),
  body("opening_hours.*.break_starts_at")
    .optional({ nullable: true })
    .custom((value) => value == null || isValidTimeString(value))
    .withMessage("break_starts_at must be HH:MM"),
  body("opening_hours.*.break_ends_at")
    .optional({ nullable: true })
    .custom((value) => value == null || isValidTimeString(value))
    .withMessage("break_ends_at must be HH:MM"),
  body("opening_hours").custom((rows) => {
    if (!rows?.length) return true;
    const errors = validateOpeningHoursSchedule(rows);
    if (errors.length) throw new Error(errors.join(". "));
    return true;
  }),
];

export const listBranchRules = [
  ...shopIdParamRules,
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("search").optional().isString().trim(),
  query("status").optional().isIn(BRANCH_STATUSES),
  query("type").optional().isIn(BRANCH_TYPES),
  query("city").optional().isString().trim(),
  query("is_active").optional().isIn(["true", "false"]),
  query("archived").optional().isIn(["true", "false"]),
  query("include_archived").optional().isIn(["true", "false"]),
  query("sort").optional().isIn(["name", "branch_code", "created_at", "updated_at"]),
  query("direction").optional().isIn(["asc", "desc"]),
];

export const createBranchRules = [
  ...shopIdParamRules,
  body("name").trim().notEmpty().withMessage("Branch name is required"),
  body("branch_code")
    .optional()
    .trim()
    .isLength({ min: 2, max: 32 })
    .withMessage("branch_code must be between 2 and 32 characters"),
  body("branch_type").optional().isIn(BRANCH_TYPES),
  body("status").optional().isIn(BRANCH_STATUSES),
  body("email")
    .optional({ nullable: true })
    .isEmail()
    .withMessage("email must be valid"),
  body("contact_person_email")
    .optional({ nullable: true })
    .isEmail()
    .withMessage("contact_person_email must be valid"),
  body("phone").optional({ nullable: true }).isLength({ min: 6, max: 32 }),
  body("alternative_phone").optional({ nullable: true }).isLength({ min: 6, max: 32 }),
  body("contact_person_phone").optional({ nullable: true }).isLength({ min: 6, max: 32 }),
  body("postcode").optional({ nullable: true }).isLength({ min: 2, max: 16 }),
  body("latitude")
    .optional({ nullable: true })
    .isFloat({ min: -90, max: 90 }),
  body("longitude")
    .optional({ nullable: true })
    .isFloat({ min: -180, max: 180 }),
  body("timezone")
    .optional()
    .custom((value) => isValidIanaTimezone(value))
    .withMessage("timezone must be a valid IANA timezone"),
  body("is_primary").optional().isBoolean(),
  body("is_active").optional().isBoolean(),
  ...openingHoursBodyRules,
];

export const updateBranchRules = [
  ...shopIdParamRules,
  ...branchUuidParamRules,
  body("name").optional().trim().notEmpty().withMessage("Branch name cannot be empty"),
  body("branch_code")
    .optional()
    .trim()
    .isLength({ min: 2, max: 32 })
    .withMessage("branch_code must be between 2 and 32 characters"),
  body("branch_type").optional().isIn(BRANCH_TYPES),
  body("email")
    .optional({ nullable: true })
    .isEmail()
    .withMessage("email must be valid"),
  body("contact_person_email")
    .optional({ nullable: true })
    .isEmail()
    .withMessage("contact_person_email must be valid"),
  body("phone").optional({ nullable: true }).isLength({ min: 6, max: 32 }),
  body("alternative_phone").optional({ nullable: true }).isLength({ min: 6, max: 32 }),
  body("contact_person_phone").optional({ nullable: true }).isLength({ min: 6, max: 32 }),
  body("postcode").optional({ nullable: true }).isLength({ min: 2, max: 16 }),
  body("latitude")
    .optional({ nullable: true })
    .isFloat({ min: -90, max: 90 }),
  body("longitude")
    .optional({ nullable: true })
    .isFloat({ min: -180, max: 180 }),
  body("timezone")
    .optional()
    .custom((value) => isValidIanaTimezone(value))
    .withMessage("timezone must be a valid IANA timezone"),
  body("is_primary").optional().isBoolean(),
  body("is_active").optional().isBoolean(),
  body().custom((_value, { req }) => {
    const fields = [
      "name",
      "branch_code",
      "branch_type",
      "address_line_1",
      "address_line_2",
      "city",
      "county",
      "postcode",
      "country",
      "latitude",
      "longitude",
      "phone",
      "alternative_phone",
      "email",
      "contact_person_name",
      "contact_person_phone",
      "contact_person_email",
      "timezone",
      "is_primary",
      "is_active",
    ];
    const hasField = fields.some((key) => req.body[key] !== undefined);
    if (!hasField && !req.body.address && !req.body.contact) {
      throw new Error("At least one field is required to update");
    }
    return true;
  }),
];

export const patchBranchStatusRules = [
  ...shopIdParamRules,
  ...branchUuidParamRules,
  body("status").optional().isIn(BRANCH_STATUSES),
  body("manual_opening_status")
    .optional({ nullable: true })
    .isIn(BRANCH_MANUAL_OPENING_STATUSES),
  body("manual_status_expires_at")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("manual_status_expires_at must be a valid ISO8601 datetime"),
  body().custom((_value, { req }) => {
    const { status, manual_opening_status, manual_status_expires_at } = req.body;
    if (
      status === undefined &&
      manual_opening_status === undefined &&
      manual_status_expires_at === undefined
    ) {
      throw new Error("At least one status field is required");
    }
    return true;
  }),
];

export const branchActionRules = [...shopIdParamRules, ...branchUuidParamRules];

export const updateOpeningHoursRules = [
  ...shopIdParamRules,
  ...branchUuidParamRules,
  body("opening_hours")
    .isArray({ min: 1, max: 7 })
    .withMessage("opening_hours is required"),
  ...openingHoursBodyRules.slice(1),
];

export const createClosureRules = [
  ...shopIdParamRules,
  ...branchUuidParamRules,
  body("title").trim().notEmpty().withMessage("title is required"),
  body("reason").optional({ nullable: true }).isString().trim(),
  body("closure_type").optional().isIn(BRANCH_CLOSURE_TYPES),
  body("starts_at").isISO8601().withMessage("starts_at must be a valid ISO8601 datetime"),
  body("ends_at").isISO8601().withMessage("ends_at must be a valid ISO8601 datetime"),
  body("all_day").optional().isBoolean(),
  body("is_recurring").optional().isBoolean(),
  body("recurrence_rule").optional({ nullable: true }).isString().trim(),
  body().custom((_value, { req }) => {
    const start = new Date(req.body.starts_at);
    const end = new Date(req.body.ends_at);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      throw new Error("ends_at must be after starts_at");
    }
    return true;
  }),
];

export const updateClosureRules = [
  ...shopIdParamRules,
  ...branchUuidParamRules,
  ...closureIdParamRules,
  body("title").optional().trim().notEmpty(),
  body("reason").optional({ nullable: true }).isString().trim(),
  body("closure_type").optional().isIn(BRANCH_CLOSURE_TYPES),
  body("starts_at").optional().isISO8601(),
  body("ends_at").optional().isISO8601(),
  body("all_day").optional().isBoolean(),
  body("is_recurring").optional().isBoolean(),
  body("recurrence_rule").optional({ nullable: true }).isString().trim(),
];

export const deleteClosureRules = [
  ...shopIdParamRules,
  ...branchUuidParamRules,
  ...closureIdParamRules,
];

export const listClosureRules = [...shopIdParamRules, ...branchUuidParamRules];
