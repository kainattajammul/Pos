import { prisma } from "../config/database.js";
import { BranchCommunicationModel } from "../models/branchCommunication.model.js";
import {
  toPublicEmailSenderSettings,
  toPublicInvoiceSettings,
  toPublicReceiptSettings,
  toPublicSmsSenderSettings,
} from "../mappers/branchCommunication.mapper.js";
import { ensureBranch } from "./branchCommunicationSettings.service.js";
import { writeAuditLog } from "./auditLog.service.js";
import { getClientMeta } from "../utils/branchHelpers.js";

async function updateSettings({ shopId, branchUuid, model, getter, mapper, input, userId, req, action, entity, fieldMap }) {
  const branch = await ensureBranch(shopId, branchUuid);
  await getter(branch.id, shopId);
  const data = { updatedById: userId ?? null };
  for (const [apiKey, dbKey] of Object.entries(fieldMap)) {
    if (input[apiKey] != null) data[dbKey] = input[apiKey];
  }
  const updated = await prisma[model].update({ where: { branchId: branch.id }, data });
  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action,
    entity,
    entityId: String(branch.id),
    newValues: input,
    ...getClientMeta(req),
  });
  return mapper(updated);
}

export async function getReceiptSettings(ctx) {
  const branch = await ensureBranch(ctx.shopId, ctx.branchUuid);
  const s = await BranchCommunicationModel.getReceiptSettings(branch.id, ctx.shopId);
  return toPublicReceiptSettings(s);
}

export async function updateReceiptSettings(ctx) {
  return updateSettings({
    ...ctx,
    model: "branchReceiptSettings",
    getter: BranchCommunicationModel.getReceiptSettings,
    mapper: toPublicReceiptSettings,
    action: "branch_receipts.settings.updated",
    entity: "branch_receipt_settings",
    fieldMap: {
      receipt_prefix: "receiptPrefix",
      header_message: "headerMessage",
      footer_message: "footerMessage",
      return_policy_text: "returnPolicyText",
      warranty_text: "warrantyText",
      print_automatically: "printAutomatically",
      email_automatically: "emailAutomatically",
      sms_receipt_link: "smsReceiptLink",
      include_qr_code: "includeQrCode",
      qr_code_target: "qrCodeTarget",
    },
  });
}

export async function getInvoiceSettings(ctx) {
  const branch = await ensureBranch(ctx.shopId, ctx.branchUuid);
  const s = await BranchCommunicationModel.getInvoiceSettings(branch.id, ctx.shopId);
  return toPublicInvoiceSettings(s);
}

export async function updateInvoiceSettings(ctx) {
  return updateSettings({
    ...ctx,
    model: "branchInvoiceSettings",
    getter: BranchCommunicationModel.getInvoiceSettings,
    mapper: toPublicInvoiceSettings,
    action: "branch_invoices.settings.updated",
    entity: "branch_invoice_settings",
    fieldMap: {
      invoice_prefix: "invoicePrefix",
      credit_note_prefix: "creditNotePrefix",
      payment_terms_days: "paymentTermsDays",
      default_due_date_days: "defaultDueDateDays",
      default_notes: "defaultNotes",
      default_terms: "defaultTerms",
      payment_instructions: "paymentInstructions",
      bank_details_text: "bankDetailsText",
      auto_issue_invoices: "autoIssueInvoices",
      auto_email_invoices: "autoEmailInvoices",
      send_payment_reminder: "sendPaymentReminder",
      reminder_days_before_due: "reminderDaysBeforeDue",
      overdue_reminder_days: "overdueReminderDays",
    },
  });
}

export async function getEmailSenderSettings(ctx) {
  const branch = await ensureBranch(ctx.shopId, ctx.branchUuid);
  const s = await BranchCommunicationModel.getEmailSenderSettings(branch.id, ctx.shopId);
  return toPublicEmailSenderSettings(s);
}

export async function updateEmailSenderSettings(ctx) {
  const result = await updateSettings({
    ...ctx,
    model: "branchEmailSenderSettings",
    getter: BranchCommunicationModel.getEmailSenderSettings,
    mapper: toPublicEmailSenderSettings,
    action: "branch_email_sender.updated",
    entity: "branch_email_sender_settings",
    fieldMap: {
      sender_name: "senderName",
      sender_email: "senderEmail",
      reply_to_email: "replyToEmail",
      is_enabled: "isEnabled",
      default_subject_prefix: "defaultSubjectPrefix",
      footer_signature: "footerSignature",
    },
  });
  if (ctx.input.provider) {
    const branch = await ensureBranch(ctx.shopId, ctx.branchUuid);
    await prisma.branchEmailSenderSettings.update({
      where: { branchId: branch.id },
      data: { provider: String(ctx.input.provider).toUpperCase() },
    });
  }
  return result;
}

export async function getSmsSenderSettings(ctx) {
  const branch = await ensureBranch(ctx.shopId, ctx.branchUuid);
  const s = await BranchCommunicationModel.getSmsSenderSettings(branch.id, ctx.shopId);
  return toPublicSmsSenderSettings(s);
}

export async function updateSmsSenderSettings(ctx) {
  return updateSettings({
    ...ctx,
    model: "branchSmsSenderSettings",
    getter: BranchCommunicationModel.getSmsSenderSettings,
    mapper: toPublicSmsSenderSettings,
    action: "branch_sms_sender.updated",
    entity: "branch_sms_sender_settings",
    fieldMap: {
      sender_id: "senderId",
      phone_number: "phoneNumber",
      is_enabled: "isEnabled",
      country_code: "countryCode",
      default_region: "defaultRegion",
    },
  });
}

export async function testEmailSender(ctx) {
  const branch = await ensureBranch(ctx.shopId, ctx.branchUuid);
  const settings = await BranchCommunicationModel.getEmailSenderSettings(branch.id, ctx.shopId);
  if (!settings.senderEmail) throw new Error("Sender email not configured");

  const updated = await prisma.branchEmailSenderSettings.update({
    where: { branchId: branch.id },
    data: {
      lastTestedAt: new Date(),
      lastTestStatus: settings.encryptedCredentialRef || settings.provider !== "OTHER" ? "queued" : "failed",
      lastTestError: settings.encryptedCredentialRef || settings.provider !== "OTHER" ? null : "Email provider not configured",
    },
  });

  return { ...toPublicEmailSenderSettings(updated), test_queued: true };
}

export async function testSmsSender(ctx) {
  const branch = await ensureBranch(ctx.shopId, ctx.branchUuid);
  const settings = await BranchCommunicationModel.getSmsSenderSettings(branch.id, ctx.shopId);
  if (!settings.senderId && !settings.phoneNumber) throw new Error("SMS sender not configured");

  const updated = await prisma.branchSmsSenderSettings.update({
    where: { branchId: branch.id },
    data: {
      lastTestedAt: new Date(),
      lastTestStatus: settings.encryptedCredentialRef || settings.provider !== "OTHER" ? "queued" : "failed",
      lastTestError: settings.encryptedCredentialRef || settings.provider !== "OTHER" ? null : "SMS provider not configured",
    },
  });

  return { ...toPublicSmsSenderSettings(updated), test_queued: true };
}
