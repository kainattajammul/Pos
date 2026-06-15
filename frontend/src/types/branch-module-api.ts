export interface ApiBranchInventorySettings {
  allocation_mode: "shared" | "dedicated";
  stock_level: number;
  low_stock_threshold: number;
  reorder_rules: string;
  transfer_approval_required: boolean;
  valuation_method: string;
  currency?: string;
}

export interface ApiBranchOperationsSettings {
  sales_today: string;
  open_repair_tickets: number;
  appointment_slots_per_day: number;
  pickup_enabled: boolean;
  delivery_radius_km: string;
  warranty_claims_open: number;
}

export interface ApiUpdateBranchInventorySettings {
  allocation_mode?: "shared" | "dedicated";
  low_stock_threshold?: number;
  reorder_rules?: string;
  transfer_approval_required?: boolean;
  valuation_method?: string;
}

export interface ApiUpdateBranchOperationsSettings {
  appointment_slots_per_day?: number;
  pickup_enabled?: boolean;
  delivery_radius_km?: number;
  walk_in_reserve_slots?: number;
}

export interface ApiBranchFinanceSettings {
  register_id: string;
  register_uuid: string | null;
  cash_drawer_assigned: boolean;
  payments_today: string;
  refunds_today: string;
  open_invoices: number;
  vat_rate: string;
  currency: string;
  timezone: string;
  end_of_day_required: boolean;
}

export interface ApiUpdateBranchFinanceSettings {
  register_id?: string;
  register_uuid?: string | null;
  vat_rate?: string;
  currency?: string;
  timezone?: string;
  end_of_day_required?: boolean;
}

export interface ApiBranchCommunicationSettings {
  email_sender: string;
  sms_sender: string;
  receipt_header: string;
  receipt_footer: string;
  notifications_enabled: boolean;
  document_template: string;
}

export interface ApiUpdateBranchCommunicationSettings {
  email_sender?: string;
  sms_sender?: string;
  receipt_header?: string;
  receipt_footer?: string;
  notifications_enabled?: boolean;
  document_template?: string;
}

export interface ApiBranchReportingSettings {
  sales_target_monthly: string;
  repair_target_monthly: number;
  commission_rules: string;
  last_report_generated: string | null;
  default_comparison_period?: string;
}

export interface ApiUpdateBranchReportingSettings {
  sales_target_monthly?: string;
  repair_target_monthly?: number;
  commission_rules?: string;
  default_comparison_period?: string;
}

export interface ApiBranchSystemSettings {
  data_sync_status: "synced" | "pending" | "error";
  last_sync_at: string | null;
  franchise_owner: string;
  audit_log_count: number;
  two_factor_required: boolean;
  has_data?: boolean;
}

export interface ApiUpdateBranchSystemSettings {
  franchise_owner?: string;
  two_factor_required?: boolean;
}
