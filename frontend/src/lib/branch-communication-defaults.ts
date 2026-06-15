import type {
  BranchCustomerMessageTemplate,
  BranchInvoiceSettings,
} from "@/lib/branch-types";

export const PAYMENT_TERMS_OPTIONS = [
  { value: "due_on_receipt", label: "Due on receipt" },
  { value: "net_7", label: "Net 7" },
  { value: "net_14", label: "Net 14" },
  { value: "net_30", label: "Net 30" },
] as const;

export const MESSAGE_TEMPLATE_TRIGGERS = [
  { value: "repair_created", label: "Repair created" },
  { value: "repair_ready", label: "Repair ready" },
  { value: "invoice_sent", label: "Invoice sent" },
  { value: "payment_received", label: "Payment received" },
  { value: "appointment_reminder", label: "Appointment reminder" },
  { value: "custom", label: "Custom" },
] as const;

export function defaultInvoiceSettings(branchName = ""): BranchInvoiceSettings {
  return {
    invoicePrefix: "INV-",
    nextInvoiceNumber: 1001,
    paymentTerms: "due_on_receipt",
    dueDays: 0,
    showVatBreakdown: true,
    footerTerms: "",
    defaultNotes: "",
    legalName: branchName,
    showBranchAddress: true,
  };
}

export function sampleMessageTemplates(): BranchCustomerMessageTemplate[] {
  return [
    {
      id: "tpl-repair-ready",
      name: "Repair ready for pickup",
      channel: "both",
      trigger: "repair_ready",
      subject: "Your device is ready — {{branch_name}}",
      body: "Hi {{customer_name}},\n\nYour repair (ticket {{ticket_id}}) is complete and ready for collection at {{branch_name}}.\n\nThank you.",
      enabled: true,
    },
    {
      id: "tpl-invoice-sent",
      name: "Invoice sent",
      channel: "email",
      trigger: "invoice_sent",
      subject: "Invoice from {{branch_name}} — {{invoice_total}}",
      body: "Hi {{customer_name}},\n\nPlease find your invoice for {{invoice_total}}. Ticket reference: {{ticket_id}}.\n\n{{branch_name}}",
      enabled: true,
    },
    {
      id: "tpl-appointment-reminder",
      name: "Appointment reminder",
      channel: "sms",
      trigger: "appointment_reminder",
      subject: "",
      body: "Reminder: your appointment at {{branch_name}} is tomorrow. Reply STOP to opt out.",
      enabled: false,
    },
  ];
}

export function createEmptyMessageTemplate(): BranchCustomerMessageTemplate {
  return {
    id: `tpl-${Date.now()}`,
    name: "New template",
    channel: "email",
    trigger: "custom",
    subject: "",
    body: "Hi {{customer_name}},\n\n",
    enabled: true,
  };
}

export const MESSAGE_TEMPLATE_PLACEHOLDERS =
  "{{customer_name}}, {{branch_name}}, {{ticket_id}}, {{invoice_total}}";

export function renderTemplatePreview(
  text: string,
  branchName: string,
): string {
  return text
    .replace(/\{\{customer_name\}\}/g, "Jane Smith")
    .replace(/\{\{branch_name\}\}/g, branchName || "Main Branch")
    .replace(/\{\{ticket_id\}\}/g, "REP-1042")
    .replace(/\{\{invoice_total\}\}/g, "£149.99");
}
