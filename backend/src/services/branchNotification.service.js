import { prisma } from "../config/database.js";
import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { BranchCommunicationModel } from "../models/branchCommunication.model.js";
import { toPublicNotificationSettings } from "../mappers/branchCommunication.mapper.js";
import { ensureBranch } from "./branchCommunicationSettings.service.js";
import { writeAuditLog } from "./auditLog.service.js";
import { getClientMeta } from "../utils/branchHelpers.js";

const FIELD_MAP = {
  notifications_enabled: "notificationsEnabled",
  email_enabled: "emailEnabled",
  sms_enabled: "smsEnabled",
  push_enabled: "pushEnabled",
  in_app_enabled: "inAppEnabled",
  send_appointment_confirmation: "sendAppointmentConfirmation",
  send_appointment_reminder: "sendAppointmentReminder",
  appointment_reminder_minutes: "appointmentReminderMinutes",
  send_repair_created: "sendRepairCreated",
  send_repair_status_updates: "sendRepairStatusUpdates",
  send_repair_ready: "sendRepairReady",
  send_repair_collected: "sendRepairCollected",
  send_payment_confirmation: "sendPaymentConfirmation",
  send_refund_updates: "sendRefundUpdates",
  send_invoice_issued: "sendInvoiceIssued",
  send_invoice_overdue: "sendInvoiceOverdue",
  send_pickup_updates: "sendPickupUpdates",
  send_delivery_updates: "sendDeliveryUpdates",
  send_warranty_updates: "sendWarrantyUpdates",
  notify_branch_managers: "notifyBranchManagers",
  notify_assigned_staff: "notifyAssignedStaff",
  quiet_hours_enabled: "quietHoursEnabled",
  quiet_hours_start: "quietHoursStart",
  quiet_hours_end: "quietHoursEnd",
  timezone: "timezone",
};

export async function getNotificationSettings({ shopId, branchUuid }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const settings = await BranchCommunicationModel.getNotificationSettings(branch.id, shopId);
  return toPublicNotificationSettings(settings);
}

export async function updateNotificationSettings({ shopId, branchUuid, input, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  await BranchCommunicationModel.getNotificationSettings(branch.id, shopId);

  const data = { updatedById: userId ?? null };
  for (const [apiKey, dbKey] of Object.entries(FIELD_MAP)) {
    if (input[apiKey] != null) data[dbKey] = input[apiKey];
  }
  if (input.fallback_channel != null) {
    data.fallbackChannel = String(input.fallback_channel).toUpperCase();
  }

  const updated = await prisma.branchNotificationSettings.update({
    where: { branchId: branch.id },
    data,
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_notifications.settings.updated",
    entity: "branch_notification_settings",
    entityId: String(branch.id),
    newValues: input,
    ...getClientMeta(req),
  });

  return toPublicNotificationSettings(updated);
}

export async function assertChannelEnabled(branchId, shopId, channel) {
  const settings = await BranchCommunicationModel.getNotificationSettings(branchId, shopId);
  if (!settings.notificationsEnabled) {
    throw new ApiError(HTTP.BAD_REQUEST, "Branch notifications are disabled");
  }
  if (channel === "EMAIL" && !settings.emailEnabled) {
    throw new ApiError(HTTP.BAD_REQUEST, "Email notifications are disabled for this branch");
  }
  if (channel === "SMS" && !settings.smsEnabled) {
    throw new ApiError(HTTP.BAD_REQUEST, "SMS notifications are disabled for this branch");
  }
  return settings;
}
