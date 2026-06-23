import { prisma } from "../config/database.js";
import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { BranchCommunicationModel } from "../models/branchCommunication.model.js";
import { toPublicCommunicationSettings } from "../mappers/branchCommunication.mapper.js";
import { writeAuditLog } from "./auditLog.service.js";
import { getClientMeta } from "../utils/branchHelpers.js";

export async function ensureBranch(shopId, branchUuid) {
  const branch = await BranchCommunicationModel.ensureBranch(shopId, branchUuid);
  if (!branch) throw new ApiError(HTTP.NOT_FOUND, "Branch not found");
  return branch;
}

async function loadCommunicationBundle(branchId, shopId) {
  const [notification, document, receipt, email, sms] = await Promise.all([
    BranchCommunicationModel.getNotificationSettings(branchId, shopId),
    BranchCommunicationModel.getDocumentSettings(branchId, shopId),
    BranchCommunicationModel.getReceiptSettings(branchId, shopId),
    BranchCommunicationModel.getEmailSenderSettings(branchId, shopId),
    BranchCommunicationModel.getSmsSenderSettings(branchId, shopId),
  ]);
  return { notification, document, receipt, email, sms };
}

export async function getCommunicationSettings({ shopId, branchUuid }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const bundle = await loadCommunicationBundle(branch.id, shopId);
  return toPublicCommunicationSettings(bundle);
}

export async function updateCommunicationSettings({ shopId, branchUuid, input, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  await loadCommunicationBundle(branch.id, shopId);

  await prisma.$transaction(async (tx) => {
    if (input.notifications_enabled != null) {
      await tx.branchNotificationSettings.update({
        where: { branchId: branch.id },
        data: {
          notificationsEnabled: Boolean(input.notifications_enabled),
          emailEnabled: Boolean(input.notifications_enabled),
          updatedById: userId ?? null,
        },
      });
    }
    if (input.email_sender != null) {
      await tx.branchEmailSenderSettings.update({
        where: { branchId: branch.id },
        data: { senderEmail: String(input.email_sender), updatedById: userId ?? null },
      });
    }
    if (input.sms_sender != null) {
      await tx.branchSmsSenderSettings.update({
        where: { branchId: branch.id },
        data: { senderId: String(input.sms_sender), updatedById: userId ?? null },
      });
    }
    if (input.receipt_header != null) {
      await tx.branchReceiptSettings.update({
        where: { branchId: branch.id },
        data: { headerMessage: input.receipt_header, updatedById: userId ?? null },
      });
    }
    if (input.receipt_footer != null) {
      await tx.branchReceiptSettings.update({
        where: { branchId: branch.id },
        data: { footerMessage: input.receipt_footer, updatedById: userId ?? null },
      });
    }
    if (input.document_template != null) {
      await tx.branchDocumentSettings.update({
        where: { branchId: branch.id },
        data: { documentTemplate: input.document_template, updatedById: userId ?? null },
      });
    }
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_communication.settings.updated",
    entity: "branch_communication_settings",
    entityId: String(branch.id),
    newValues: input,
    ...getClientMeta(req),
  });

  const bundle = await loadCommunicationBundle(branch.id, shopId);
  return toPublicCommunicationSettings(bundle);
}

export { loadCommunicationBundle };
