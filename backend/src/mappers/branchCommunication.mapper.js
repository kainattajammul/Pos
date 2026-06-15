import {
  COMMUNICATION_CHANNEL_LABELS,
  COMMUNICATION_STATUS_LABELS,
  SENDER_VERIFICATION_LABELS,
} from "../constants/communicationEnums.js";

function toApiStatus(status, labels) {
  const value = status.toLowerCase();
  return { value, label: labels[status] ?? status };
}

export function maskRecipient(value) {
  if (!value) return "";
  const trimmed = String(value);
  if (trimmed.includes("@")) {
    const [user, domain] = trimmed.split("@");
    return `${user.slice(0, 2)}***@${domain}`;
  }
  return `******${trimmed.slice(-4)}`;
}

export function toPublicCommunicationSettings({
  notification,
  document,
  receipt,
  email,
  sms,
}) {
  return {
    email_sender: email.senderEmail || "",
    sms_sender: sms.senderId || sms.phoneNumber || "",
    receipt_header: receipt.headerMessage || "",
    receipt_footer: receipt.footerMessage || "",
    notifications_enabled: notification.notificationsEnabled,
    document_template: document.documentTemplate || "",
  };
}

export function toPublicNotificationSettings(settings) {
  return {
    notifications_enabled: settings.notificationsEnabled,
    email_enabled: settings.emailEnabled,
    sms_enabled: settings.smsEnabled,
    push_enabled: settings.pushEnabled,
    in_app_enabled: settings.inAppEnabled,
    send_appointment_confirmation: settings.sendAppointmentConfirmation,
    send_appointment_reminder: settings.sendAppointmentReminder,
    appointment_reminder_minutes: settings.appointmentReminderMinutes,
    send_repair_created: settings.sendRepairCreated,
    send_repair_status_updates: settings.sendRepairStatusUpdates,
    send_repair_ready: settings.sendRepairReady,
    send_repair_collected: settings.sendRepairCollected,
    send_payment_confirmation: settings.sendPaymentConfirmation,
    send_refund_updates: settings.sendRefundUpdates,
    send_invoice_issued: settings.sendInvoiceIssued,
    send_invoice_overdue: settings.sendInvoiceOverdue,
    send_pickup_updates: settings.sendPickupUpdates,
    send_delivery_updates: settings.sendDeliveryUpdates,
    send_warranty_updates: settings.sendWarrantyUpdates,
    notify_branch_managers: settings.notifyBranchManagers,
    notify_assigned_staff: settings.notifyAssignedStaff,
    quiet_hours_enabled: settings.quietHoursEnabled,
    quiet_hours_start: settings.quietHoursStart,
    quiet_hours_end: settings.quietHoursEnd,
    fallback_channel: settings.fallbackChannel?.toLowerCase() ?? null,
    timezone: settings.timezone,
  };
}

export function toPublicDocumentSettings(settings) {
  return {
    document_prefix: settings.documentPrefix,
    default_paper_size: settings.defaultPaperSize.toLowerCase(),
    default_orientation: settings.defaultOrientation.toLowerCase(),
    logo_storage_path: settings.logoStoragePath,
    has_logo: Boolean(settings.logoStoragePath),
    header_text: settings.headerText,
    footer_text: settings.footerText,
    legal_business_name: settings.legalBusinessName,
    registration_number: settings.registrationNumber,
    vat_number: settings.vatNumber,
    show_branch_address: settings.showBranchAddress,
    show_branch_phone: settings.showBranchPhone,
    show_branch_email: settings.showBranchEmail,
    show_website: settings.showWebsite,
    show_vat_number: settings.showVatNumber,
    watermark_enabled: settings.watermarkEnabled,
    watermark_text: settings.watermarkText,
    include_terms: settings.includeTerms,
    default_terms: settings.defaultTerms,
    default_notes: settings.defaultNotes,
    document_template: settings.documentTemplate,
    document_language: settings.documentLanguage,
    date_format: settings.dateFormat,
    time_format: settings.timeFormat,
  };
}

export function toPublicReceiptSettings(settings) {
  return {
    receipt_prefix: settings.receiptPrefix,
    receipt_paper_size: settings.receiptPaperSize.toLowerCase(),
    header_message: settings.headerMessage,
    footer_message: settings.footerMessage,
    return_policy_text: settings.returnPolicyText,
    warranty_text: settings.warrantyText,
    show_logo: settings.showLogo,
    show_branch_name: settings.showBranchName,
    show_tax_breakdown: settings.showTaxBreakdown,
    print_automatically: settings.printAutomatically,
    email_automatically: settings.emailAutomatically,
    sms_receipt_link: settings.smsReceiptLink,
    include_qr_code: settings.includeQrCode,
  };
}

export function toPublicInvoiceSettings(settings) {
  return {
    invoice_prefix: settings.invoicePrefix,
    next_invoice_sequence: settings.nextInvoiceSequence,
    credit_note_prefix: settings.creditNotePrefix,
    payment_terms_days: settings.paymentTermsDays,
    default_due_date_days: settings.defaultDueDateDays,
    default_notes: settings.defaultNotes,
    default_terms: settings.defaultTerms,
    payment_instructions: settings.paymentInstructions,
    bank_details_text: settings.bankDetailsText,
    auto_issue_invoices: settings.autoIssueInvoices,
    auto_email_invoices: settings.autoEmailInvoices,
    send_payment_reminder: settings.sendPaymentReminder,
    reminder_days_before_due: settings.reminderDaysBeforeDue,
    overdue_reminder_days: settings.overdueReminderDays,
  };
}

export function toPublicEmailSenderSettings(settings) {
  return {
    provider: settings.provider.toLowerCase(),
    sender_name: settings.senderName,
    sender_email: settings.senderEmail,
    reply_to_email: settings.replyToEmail,
    is_enabled: settings.isEnabled,
    is_verified: settings.isVerified,
    verification_status: toApiStatus(settings.verificationStatus, SENDER_VERIFICATION_LABELS),
    credentials_configured: Boolean(settings.encryptedCredentialRef || settings.providerAccountRef),
    default_subject_prefix: settings.defaultSubjectPrefix,
    footer_signature: settings.footerSignature,
    last_tested_at: settings.lastTestedAt?.toISOString() ?? null,
    last_test_status: settings.lastTestStatus,
  };
}

export function toPublicSmsSenderSettings(settings) {
  return {
    provider: settings.provider.toLowerCase(),
    sender_type: settings.senderType.toLowerCase(),
    sender_id: settings.senderId,
    phone_number: settings.phoneNumber,
    is_enabled: settings.isEnabled,
    is_verified: settings.isVerified,
    verification_status: toApiStatus(settings.verificationStatus, SENDER_VERIFICATION_LABELS),
    credentials_configured: Boolean(settings.encryptedCredentialRef || settings.providerAccountRef),
    country_code: settings.countryCode,
    default_region: settings.defaultRegion,
    last_tested_at: settings.lastTestedAt?.toISOString() ?? null,
    last_test_status: settings.lastTestStatus,
  };
}

export function toPublicMessageTemplate(template) {
  return {
    id: template.uuid,
    name: template.name,
    code: template.code,
    description: template.description,
    channel: toApiStatus(template.channel, COMMUNICATION_CHANNEL_LABELS),
    event_type: template.eventType,
    subject: template.subject,
    content: template.content,
    language: template.language,
    version: template.version,
    is_active: template.isActive,
    is_default: template.isDefault,
    updated_at: template.updatedAt.toISOString(),
  };
}

export function toPublicCommunicationLog(log, { maskRecipientDetails = true } = {}) {
  return {
    id: log.uuid,
    channel: toApiStatus(log.channel, COMMUNICATION_CHANNEL_LABELS),
    event_type: log.eventType,
    customer: log.customer
      ? { id: log.customer.uuid, name: log.customer.displayName }
      : null,
    recipient: maskRecipientDetails ? log.recipientMasked || maskRecipient(log.recipient) : log.recipient,
    subject: log.subject,
    status: toApiStatus(log.status, COMMUNICATION_STATUS_LABELS),
    provider: log.provider,
    provider_message_id: log.providerMessageId,
    sent_at: log.sentAt?.toISOString() ?? null,
    delivered_at: log.deliveredAt?.toISOString() ?? null,
    failed_at: log.failedAt?.toISOString() ?? null,
    error_message: log.errorMessage,
    created_at: log.createdAt.toISOString(),
  };
}

export function toPublicBranchDocument(doc) {
  return {
    id: doc.uuid,
    document_number: doc.documentNumber,
    document_type: doc.documentType.toLowerCase(),
    status: doc.status.toLowerCase(),
    title: doc.title,
    description: doc.description,
    mime_type: doc.mimeType,
    file_size: doc.fileSize,
    reference_type: doc.referenceType,
    reference_id: doc.referenceId,
    created_at: doc.createdAt.toISOString(),
  };
}
