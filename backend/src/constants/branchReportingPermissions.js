export const BRANCH_REPORTING_PERMISSIONS = {
  REPORTS_VIEW: "branch_reports.view",
  REPORTS_EXPORT: "branch_reports.export",

  PERFORMANCE_DASHBOARD_VIEW: "branch_performance_dashboard.view",
  PERFORMANCE_DASHBOARD_VIEW_FINANCIALS: "branch_performance_dashboard.view_financials",

  SALES_REPORTS_VIEW: "branch_sales_reports.view",
  SALES_REPORTS_VIEW_COSTS: "branch_sales_reports.view_costs",
  SALES_REPORTS_EXPORT: "branch_sales_reports.export",

  REPAIR_REPORTS_VIEW: "branch_repair_reports.view",
  REPAIR_REPORTS_EXPORT: "branch_repair_reports.export",

  INVENTORY_REPORTS_VIEW: "branch_inventory_reports.view",
  INVENTORY_REPORTS_VIEW_VALUATION: "branch_inventory_reports.view_valuation",
  INVENTORY_REPORTS_EXPORT: "branch_inventory_reports.export",

  PAYMENT_REPORTS_VIEW: "branch_payment_reports.view",
  PAYMENT_REPORTS_VIEW_PROVIDER: "branch_payment_reports.view_provider_details",
  PAYMENT_REPORTS_EXPORT: "branch_payment_reports.export",

  CASH_DRAWER_REPORTS_VIEW: "branch_cash_drawer_reports.view",
  CASH_DRAWER_REPORTS_VIEW_DISCREPANCIES: "branch_cash_drawer_reports.view_discrepancies",
  CASH_DRAWER_REPORTS_EXPORT: "branch_cash_drawer_reports.export",

  STAFF_PERFORMANCE_REPORTS_VIEW: "branch_staff_performance_reports.view",
  STAFF_PERFORMANCE_REPORTS_VIEW_ALL: "branch_staff_performance_reports.view_all_staff",
  STAFF_PERFORMANCE_REPORTS_EXPORT: "branch_staff_performance_reports.export",

  COMPARISON_REPORTS_VIEW: "branch_comparison_reports.view",
  PROFIT_REPORTS_VIEW: "branch_profit_reports.view",

  REPORTING_VIEW: "branch_reporting.view",
  REPORTING_MANAGE: "branch_reporting.manage",
};

export const BRANCH_REPORTING_PERMISSION_SEED = Object.entries(
  BRANCH_REPORTING_PERMISSIONS,
).map(([, key]) => ({ key, module: key.split(".")[0] }));

export const REPORT_REGISTRY = [
  {
    code: "BRANCH_PERFORMANCE",
    name: "Branch Performance Dashboard",
    description: "KPIs and trends for branch performance",
    permission: BRANCH_REPORTING_PERMISSIONS.PERFORMANCE_DASHBOARD_VIEW,
    supportsComparison: true,
    supportsExport: true,
    includesCostData: false,
    includesPii: false,
  },
  {
    code: "BRANCH_SALES",
    name: "Branch Sales Report",
    description: "Sales revenue, transactions and breakdowns",
    permission: BRANCH_REPORTING_PERMISSIONS.SALES_REPORTS_VIEW,
    supportsComparison: true,
    supportsExport: true,
    includesCostData: true,
    includesPii: true,
  },
  {
    code: "BRANCH_REPAIRS",
    name: "Branch Repair Report",
    description: "Repair tickets, turnaround and technician performance",
    permission: BRANCH_REPORTING_PERMISSIONS.REPAIR_REPORTS_VIEW,
    supportsComparison: true,
    supportsExport: true,
    includesCostData: false,
    includesPii: true,
  },
  {
    code: "BRANCH_INVENTORY",
    name: "Branch Inventory Report",
    description: "Stock levels, valuation and movements",
    permission: BRANCH_REPORTING_PERMISSIONS.INVENTORY_REPORTS_VIEW,
    supportsComparison: false,
    supportsExport: true,
    includesCostData: true,
    includesPii: false,
  },
  {
    code: "BRANCH_PAYMENTS",
    name: "Branch Payment Report",
    description: "Payments, refunds and outstanding invoices",
    permission: BRANCH_REPORTING_PERMISSIONS.PAYMENT_REPORTS_VIEW,
    supportsComparison: true,
    supportsExport: true,
    includesCostData: false,
    includesPii: true,
  },
  {
    code: "BRANCH_CASH_DRAWER",
    name: "Branch Cash Drawer Report",
    description: "Register sessions, cash movements and discrepancies",
    permission: BRANCH_REPORTING_PERMISSIONS.CASH_DRAWER_REPORTS_VIEW,
    supportsComparison: true,
    supportsExport: true,
    includesCostData: false,
    includesPii: false,
  },
  {
    code: "BRANCH_STAFF_PERFORMANCE",
    name: "Branch Staff Performance Report",
    description: "Staff sales, repairs and target achievement",
    permission: BRANCH_REPORTING_PERMISSIONS.STAFF_PERFORMANCE_REPORTS_VIEW,
    supportsComparison: true,
    supportsExport: true,
    includesCostData: false,
    includesPii: true,
  },
];

export const REPORT_GROUPING_INTERVALS = ["hour", "day", "week", "month", "quarter", "year"];

export const REPORT_PERIOD_PRESETS = [
  "today",
  "yesterday",
  "current_week",
  "previous_week",
  "current_month",
  "previous_month",
  "current_quarter",
  "previous_quarter",
  "current_year",
  "previous_year",
  "custom",
];
