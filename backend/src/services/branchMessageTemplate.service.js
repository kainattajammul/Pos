import { prisma } from "../config/database.js";
import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import {
  BranchCommunicationLogModel,
  BranchMessageTemplateModel,
} from "../models/branchCommunication.model.js";
import {
  maskRecipient,
  toPublicCommunicationLog,
  toPublicMessageTemplate,
} from "../mappers/branchCommunication.mapper.js";
import { ensureBranch } from "./branchCommunicationSettings.service.js";
import { assertChannelEnabled } from "./branchNotification.service.js";
import { BranchCommunicationModel } from "../models/branchCommunication.model.js";
import {
  hashContent,
  renderTemplate,
  sanitizeRenderedContent,
  validateTemplateVariables,
} from "./branchTemplateRenderer.service.js";
import { writeAuditLog } from "./auditLog.service.js";
import { getClientMeta } from "../utils/branchHelpers.js";
import { parsePagination, paginationMeta } from "../utils/financeHelpers.js";

export async function listMessageTemplates({ shopId, branchUuid, query }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const { page, limit, skip, direction } = parsePagination(query);
  const where = { shopId: Number(shopId), branchId: branch.id, archivedAt: null };
  if (query.channel) where.channel = String(query.channel).toUpperCase();
  if (query.event_type) where.eventType = query.event_type;
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { code: { contains: query.search, mode: "insensitive" } },
    ];
  }
  if (query.is_active != null) where.isActive = query.is_active === "true";

  const [rows, total] = await prisma.$transaction([
    BranchMessageTemplateModel.list(where, { skip, take: limit, orderBy: { updatedAt: direction } }),
    BranchMessageTemplateModel.count(where),
  ]);

  return { data: rows.map(toPublicMessageTemplate), meta: paginationMeta(page, limit, total) };
}

export async function createMessageTemplate({ shopId, branchUuid, input, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  validateTemplateVariables(input.content, input.event_type, input.channel);
  if (input.channel?.toUpperCase() === "EMAIL" && !input.subject?.trim()) {
    throw new ApiError(HTTP.BAD_REQUEST, "Email templates require a subject");
  }

  const template = await prisma.$transaction(async (tx) => {
    if (input.is_default) {
      await tx.branchMessageTemplate.updateMany({
        where: {
          branchId: branch.id,
          channel: String(input.channel).toUpperCase(),
          eventType: input.event_type,
          language: input.language ?? "en",
          isDefault: true,
        },
        data: { isDefault: false },
      });
    }

    const created = await tx.branchMessageTemplate.create({
      data: {
        shopId: Number(shopId),
        branchId: branch.id,
        name: input.name,
        code: input.code,
        description: input.description ?? null,
        channel: String(input.channel).toUpperCase(),
        eventType: input.event_type,
        subject: input.subject ?? null,
        content: input.content,
        language: input.language ?? "en",
        isDefault: Boolean(input.is_default),
        allowedVariables: input.allowed_variables ?? null,
        requiredVariables: input.required_variables ?? null,
        createdById: userId ?? null,
      },
    });

    await tx.branchMessageTemplateVersion.create({
      data: {
        templateId: created.id,
        version: 1,
        subject: created.subject,
        content: created.content,
        allowedVariables: created.allowedVariables,
        changeReason: "Initial version",
        createdById: userId ?? null,
      },
    });

    return created;
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_message_templates.created",
    entity: "branch_message_template",
    entityId: template.uuid,
    newValues: input,
    ...getClientMeta(req),
  });

  return toPublicMessageTemplate(template);
}

export async function updateMessageTemplate({ shopId, branchUuid, templateUuid, input, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const existing = await BranchMessageTemplateModel.findByUuid(templateUuid, branch.id, shopId);
  if (!existing) throw new ApiError(HTTP.NOT_FOUND, "Template not found");

  if (input.content) {
    validateTemplateVariables(input.content, input.event_type ?? existing.eventType, existing.channel);
  }

  const updated = await prisma.$transaction(async (tx) => {
    const data = { updatedById: userId ?? null, version: { increment: 1 } };
    if (input.name != null) data.name = input.name;
    if (input.description !== undefined) data.description = input.description;
    if (input.subject !== undefined) data.subject = input.subject;
    if (input.content != null) data.content = input.content;
    if (input.is_active != null) data.isActive = Boolean(input.is_active);

    const row = await tx.branchMessageTemplate.update({ where: { id: existing.id }, data });

    await tx.branchMessageTemplateVersion.create({
      data: {
        templateId: row.id,
        version: row.version,
        subject: row.subject,
        content: row.content,
        allowedVariables: row.allowedVariables,
        changeReason: input.change_reason ?? "Updated",
        createdById: userId ?? null,
      },
    });

    return row;
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_message_templates.updated",
    entity: "branch_message_template",
    entityId: existing.uuid,
    newValues: input,
    ...getClientMeta(req),
  });

  return toPublicMessageTemplate(updated);
}

export async function previewMessageTemplate({ shopId, branchUuid, templateUuid, input }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const template = await BranchMessageTemplateModel.findByUuid(templateUuid, branch.id, shopId);
  if (!template) throw new ApiError(HTTP.NOT_FOUND, "Template not found");

  const rendered = renderTemplate(
    { subject: template.subject, content: template.content },
    input.preview_context ?? {},
  );

  return {
    subject: rendered.subject,
    content: sanitizeRenderedContent(rendered.content, template.channel),
    is_preview: true,
  };
}

export async function listCommunications({ shopId, branchUuid, query, permissions = {} }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const { page, limit, skip, direction } = parsePagination(query);
  const where = { shopId: Number(shopId), branchId: branch.id };
  if (query.channel) where.channel = String(query.channel).toUpperCase();
  if (query.status) where.status = String(query.status).toUpperCase();
  if (query.event_type) where.eventType = query.event_type;

  const [rows, total] = await prisma.$transaction([
    BranchCommunicationLogModel.list(where, { skip, take: limit, orderBy: { createdAt: direction } }),
    BranchCommunicationLogModel.count(where),
  ]);

  const mask = !permissions.canViewRecipient;
  return {
    data: rows.map((r) => toPublicCommunicationLog(r, { maskRecipientDetails: mask })),
    meta: paginationMeta(page, limit, total),
  };
}

export async function queueCommunication({
  shopId,
  branchUuid,
  input,
  userId,
  req,
}) {
  const branch = await ensureBranch(shopId, branchUuid);
  const channel = String(input.channel).toUpperCase();
  await assertChannelEnabled(branch.id, shopId, channel);

  let template = null;
  if (input.template_id) {
    template = await BranchMessageTemplateModel.findByUuid(input.template_id, branch.id, shopId);
    if (!template || !template.isActive) throw new ApiError(HTTP.NOT_FOUND, "Template not found");
  }

  let rendered = { subject: input.subject ?? null, content: input.content ?? "" };
  if (template) {
    rendered = renderTemplate(template, input.context ?? {});
    rendered.content = sanitizeRenderedContent(rendered.content, channel);
  }

  if (input.idempotency_key) {
    const existing = await prisma.branchCommunicationLog.findUnique({
      where: { idempotencyKey: input.idempotency_key },
    });
    if (existing) return toPublicCommunicationLog(existing);
  }

  const emailSettings = await BranchCommunicationModel.getEmailSenderSettings(branch.id, shopId);
  const smsSettings = await BranchCommunicationModel.getSmsSenderSettings(branch.id, shopId);

  if (channel === "EMAIL" && !emailSettings.isEnabled) {
    throw new ApiError(HTTP.BAD_REQUEST, "Email sender is not enabled");
  }
  if (channel === "SMS" && !smsSettings.isEnabled) {
    throw new ApiError(HTTP.BAD_REQUEST, "SMS sender is not enabled");
  }

  const log = await prisma.branchCommunicationLog.create({
    data: {
      shopId: Number(shopId),
      branchId: branch.id,
      customerId: input.customer_id ?? null,
      templateId: template?.id ?? null,
      channel,
      eventType: input.event_type ?? template?.eventType ?? null,
      recipient: input.recipient,
      recipientMasked: maskRecipient(input.recipient),
      subject: rendered.subject,
      renderedContent: rendered.content,
      contentHash: hashContent(rendered.content),
      status: "QUEUED",
      provider: channel === "EMAIL" ? emailSettings.provider : smsSettings.provider,
      idempotencyKey: input.idempotency_key ?? null,
      referenceType: input.reference_type ?? null,
      referenceId: input.reference_id ?? null,
      requestedById: userId ?? null,
      metadata: input.metadata ?? null,
    },
    include: { customer: true },
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: `branch_communications.${channel.toLowerCase()}_queued`,
    entity: "branch_communication_log",
    entityId: log.uuid,
    newValues: { event_type: log.eventType, recipient: log.recipientMasked },
    ...getClientMeta(req),
  });

  return toPublicCommunicationLog(log);
}
