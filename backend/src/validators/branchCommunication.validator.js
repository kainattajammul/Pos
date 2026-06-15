import { body, param, query } from "express-validator";

export const branchCommContextRules = [
  param("shopId").isInt({ min: 1 }),
  param("branchUuid").isUUID(),
];

export const uuidParam = (name) => [...branchCommContextRules, param(name).isUUID()];

export const listQueryRules = [
  ...branchCommContextRules,
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
];

export const communicationSettingsUpdateRules = [
  ...branchCommContextRules,
  body("email_sender").optional().isString(),
  body("sms_sender").optional().isString(),
  body("receipt_header").optional().isString(),
  body("receipt_footer").optional().isString(),
  body("notifications_enabled").optional().isBoolean(),
  body("document_template").optional().isString(),
];

export const createTemplateRules = [
  ...branchCommContextRules,
  body("name").notEmpty(),
  body("code").notEmpty(),
  body("channel").isIn(["email", "sms", "push", "in_app"]),
  body("event_type").notEmpty(),
  body("content").notEmpty(),
];

export const sendCommunicationRules = [
  ...branchCommContextRules,
  body("channel").isIn(["email", "sms", "push", "in_app"]),
  body("recipient").notEmpty(),
];
