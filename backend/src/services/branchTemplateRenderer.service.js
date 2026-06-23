import { createHash } from "crypto";
import { TEMPLATE_VARIABLES } from "../constants/communicationEnums.js";
import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";

const VARIABLE_PATTERN = /\{\{([a-z0-9_]+)\.([a-z0-9_]+)\}\}/gi;

export function getAllowedVariables(eventType, channel) {
  return TEMPLATE_VARIABLES;
}

export function validateTemplateVariables(content, eventType, channel) {
  const allowed = getAllowedVariables(eventType, channel);
  const matches = [...String(content).matchAll(VARIABLE_PATTERN)];
  const unsupported = [];

  for (const match of matches) {
    const [, group, field] = match;
    if (!allowed[group]?.includes(field)) {
      unsupported.push(match[0]);
    }
  }

  if (unsupported.length > 0) {
    throw new ApiError(HTTP.BAD_REQUEST, `Unsupported template variables: ${unsupported.join(", ")}`);
  }
}

export function renderTemplate({ subject, content }, context = {}) {
  const replaceVars = (text) =>
    String(text ?? "").replace(VARIABLE_PATTERN, (_, group, field) => {
      const value = context[group]?.[field];
      return value != null ? String(value) : "";
    });

  return {
    subject: subject ? replaceVars(subject) : null,
    content: replaceVars(content),
  };
}

export function sanitizeRenderedContent(content, channel) {
  if (channel === "SMS") {
    return String(content).replace(/<[^>]*>/g, "");
  }
  return String(content)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "");
}

export function hashContent(content) {
  return createHash("sha256").update(String(content)).digest("hex");
}
