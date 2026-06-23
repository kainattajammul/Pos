export const BRANCH_COMMUNICATION_PERMISSIONS = {
  NOTIFICATIONS_VIEW: "branch_notifications.view",
  NOTIFICATIONS_MANAGE: "branch_notifications.manage",
  NOTIFICATIONS_TEST: "branch_notifications.test",

  DOCUMENTS_VIEW: "branch_documents.view",
  DOCUMENTS_UPLOAD: "branch_documents.upload",
  DOCUMENTS_GENERATE: "branch_documents.generate",
  DOCUMENTS_DOWNLOAD: "branch_documents.download",
  DOCUMENTS_ARCHIVE: "branch_documents.archive",
  DOCUMENTS_MANAGE_SETTINGS: "branch_documents.manage_settings",

  RECEIPTS_VIEW: "branch_receipts.view",
  RECEIPTS_MANAGE_SETTINGS: "branch_receipts.manage_settings",
  RECEIPTS_GENERATE: "branch_receipts.generate",
  RECEIPTS_SEND: "branch_receipts.send",
  RECEIPTS_DOWNLOAD: "branch_receipts.download",

  INVOICE_SETTINGS_VIEW: "branch_invoices.manage_settings",
  INVOICE_SETTINGS_MANAGE: "branch_invoices.manage_numbering",

  EMAIL_SENDER_VIEW: "branch_email_sender.view",
  EMAIL_SENDER_MANAGE: "branch_email_sender.manage",
  EMAIL_SENDER_TEST: "branch_email_sender.test",
  EMAIL_SENDER_VERIFY: "branch_email_sender.verify",

  SMS_SENDER_VIEW: "branch_sms_sender.view",
  SMS_SENDER_MANAGE: "branch_sms_sender.manage",
  SMS_SENDER_TEST: "branch_sms_sender.test",
  SMS_SENDER_VERIFY: "branch_sms_sender.verify",

  MESSAGE_TEMPLATES_VIEW: "branch_message_templates.view",
  MESSAGE_TEMPLATES_CREATE: "branch_message_templates.create",
  MESSAGE_TEMPLATES_UPDATE: "branch_message_templates.update",
  MESSAGE_TEMPLATES_ACTIVATE: "branch_message_templates.activate",
  MESSAGE_TEMPLATES_ARCHIVE: "branch_message_templates.archive",
  MESSAGE_TEMPLATES_PREVIEW: "branch_message_templates.preview",

  COMMUNICATIONS_VIEW: "branch_communications.view",
  COMMUNICATIONS_SEND: "branch_communications.send",
  COMMUNICATIONS_RETRY: "branch_communications.retry",
  COMMUNICATIONS_CANCEL: "branch_communications.cancel",
  COMMUNICATIONS_VIEW_RECIPIENT: "branch_communications.view_recipient_details",

  COMMUNICATION_VIEW: "branch_communication.view",
  COMMUNICATION_MANAGE: "branch_communication.manage",
};

export const BRANCH_COMMUNICATION_PERMISSION_SEED = Object.entries(
  BRANCH_COMMUNICATION_PERMISSIONS,
).map(([, key]) => ({ key, module: key.split(".")[0] }));
