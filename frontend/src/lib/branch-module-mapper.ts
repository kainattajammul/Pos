import type { BranchCommunicationSettings, BranchFinanceSettings, BranchInventorySettings, BranchOperationsSettings, BranchReportingSettings, BranchSystemSettings } from "@/lib/branch-types";
import { defaultInvoiceSettings, sampleMessageTemplates } from "@/lib/branch-communication-defaults";
import type {
  ApiBranchCommunicationSettings,
  ApiBranchFinanceSettings,
  ApiBranchInventorySettings,
  ApiBranchOperationsSettings,
  ApiBranchReportingSettings,
  ApiBranchSystemSettings,
  ApiUpdateBranchCommunicationSettings,
  ApiUpdateBranchFinanceSettings,
  ApiUpdateBranchInventorySettings,
  ApiUpdateBranchOperationsSettings,
  ApiUpdateBranchReportingSettings,
  ApiUpdateBranchSystemSettings,
} from "@/types/branch-module-api";

export function mapApiInventorySettings(api: ApiBranchInventorySettings): BranchInventorySettings {
  return {
    allocationMode: api.allocation_mode,
    stockLevel: Number(api.stock_level) || 0,
    lowStockThreshold: api.low_stock_threshold,
    reorderRules: api.reorder_rules ?? "",
    transferApprovalRequired: api.transfer_approval_required,
    valuationMethod: api.valuation_method?.replace(/_/g, " ") ?? "weighted average",
  };
}

export function mapInventorySettingsToApi(
  settings: BranchInventorySettings,
): ApiUpdateBranchInventorySettings {
  return {
    allocation_mode: settings.allocationMode,
    low_stock_threshold: settings.lowStockThreshold,
    reorder_rules: settings.reorderRules,
    transfer_approval_required: settings.transferApprovalRequired,
    valuation_method: settings.valuationMethod.replace(/\s+/g, "_").toLowerCase(),
  };
}

export function mapApiOperationsSettings(api: ApiBranchOperationsSettings): BranchOperationsSettings {
  return {
    salesToday: Number.parseFloat(api.sales_today) || 0,
    openRepairTickets: api.open_repair_tickets,
    appointmentSlotsPerDay: api.appointment_slots_per_day,
    pickupEnabled: api.pickup_enabled,
    deliveryRadiusKm: Number.parseFloat(api.delivery_radius_km) || 0,
    warrantyClaimsOpen: api.warranty_claims_open,
  };
}

export function mapOperationsSettingsToApi(
  settings: BranchOperationsSettings,
): ApiUpdateBranchOperationsSettings {
  return {
    appointment_slots_per_day: settings.appointmentSlotsPerDay,
    pickup_enabled: settings.pickupEnabled,
    delivery_radius_km: settings.deliveryRadiusKm,
  };
}

export function mapApiFinanceSettings(api: ApiBranchFinanceSettings): BranchFinanceSettings {
  return {
    registerId: api.register_id,
    cashDrawerAssigned: api.cash_drawer_assigned,
    paymentsToday: Number.parseFloat(api.payments_today) || 0,
    refundsToday: Number.parseFloat(api.refunds_today) || 0,
    openInvoices: api.open_invoices,
    vatRate: api.vat_rate,
    currency: api.currency,
    timezone: api.timezone,
    endOfDayRequired: api.end_of_day_required,
  };
}

export function mapFinanceSettingsToApi(
  settings: BranchFinanceSettings,
): ApiUpdateBranchFinanceSettings {
  return {
    register_id: settings.registerId,
    vat_rate: settings.vatRate,
    currency: settings.currency,
    timezone: settings.timezone,
    end_of_day_required: settings.endOfDayRequired,
  };
}

export function mapApiCommunicationSettings(api: ApiBranchCommunicationSettings): BranchCommunicationSettings {
  return {
    emailSender: api.email_sender ?? "",
    smsSender: api.sms_sender ?? "",
    receiptHeader: api.receipt_header ?? "",
    receiptFooter: api.receipt_footer ?? "",
    notificationsEnabled: api.notifications_enabled,
    documentTemplate: api.document_template ?? "",
    invoice: defaultInvoiceSettings(),
    messageTemplates: sampleMessageTemplates(),
  };
}

export function mapCommunicationSettingsToApi(
  settings: BranchCommunicationSettings,
): ApiUpdateBranchCommunicationSettings {
  return {
    email_sender: settings.emailSender,
    sms_sender: settings.smsSender,
    receipt_header: settings.receiptHeader,
    receipt_footer: settings.receiptFooter,
    notifications_enabled: settings.notificationsEnabled,
    document_template: settings.documentTemplate,
  };
}

export function mapApiReportingSettings(api: ApiBranchReportingSettings): BranchReportingSettings {
  return {
    salesTargetMonthly: Number.parseFloat(api.sales_target_monthly) || 0,
    repairTargetMonthly: api.repair_target_monthly ?? 0,
    commissionRules: api.commission_rules ?? "",
    lastReportGenerated: api.last_report_generated ?? "—",
  };
}

export function mapReportingSettingsToApi(
  settings: BranchReportingSettings,
): ApiUpdateBranchReportingSettings {
  return {
    sales_target_monthly: String(settings.salesTargetMonthly),
    repair_target_monthly: settings.repairTargetMonthly,
    commission_rules: settings.commissionRules,
  };
}

export function mapApiSystemSettings(api: ApiBranchSystemSettings): BranchSystemSettings {
  return {
    dataSyncStatus: api.data_sync_status,
    lastSyncAt: api.last_sync_at ?? new Date(0).toISOString(),
    franchiseOwner: api.franchise_owner ?? "",
    auditLogCount: api.audit_log_count ?? 0,
    twoFactorRequired: api.two_factor_required ?? false,
  };
}

export function mapSystemSettingsToApi(
  settings: BranchSystemSettings,
): ApiUpdateBranchSystemSettings {
  return {
    franchise_owner: settings.franchiseOwner,
    two_factor_required: settings.twoFactorRequired,
  };
}
