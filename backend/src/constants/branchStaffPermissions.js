export const BRANCH_STAFF_PERMISSIONS = {
  VIEW: "branch_staff.view",
  ASSIGN: "branch_staff.assign",
  UPDATE: "branch_staff.update",
  DEACTIVATE: "branch_staff.deactivate",
  ARCHIVE: "branch_staff.archive",
  RESTORE: "branch_staff.restore",

  ROLES_VIEW: "branch_roles.view",
  ROLES_CREATE: "branch_roles.create",
  ROLES_UPDATE: "branch_roles.update",
  ROLES_DELETE: "branch_roles.delete",
  ROLES_ASSIGN: "branch_roles.assign",

  PERMISSIONS_VIEW: "branch_permissions.view",
  PERMISSIONS_ASSIGN: "branch_permissions.assign",
  PERMISSIONS_OVERRIDE: "branch_permissions.override",

  SCHEDULE_VIEW: "branch_schedule.view",
  SCHEDULE_CREATE: "branch_schedule.create",
  SCHEDULE_UPDATE: "branch_schedule.update",
  SCHEDULE_DELETE: "branch_schedule.delete",
  SCHEDULE_PUBLISH: "branch_schedule.publish",

  PERFORMANCE_VIEW: "branch_performance.view",
  PERFORMANCE_MANAGE: "branch_performance.manage",

  SECURITY_VIEW: "branch_security.view",
  SECURITY_MANAGE: "branch_security.manage",
};

export const BRANCH_STAFF_PERMISSION_SEED = Object.entries(BRANCH_STAFF_PERMISSIONS).map(
  ([, key]) => ({
    key,
    module: key.split(".")[0],
  }),
);

export const DEFAULT_SECURITY_RULES = [
  {
    ruleKey: "require_branch_assignment",
    name: "Require branch assignment",
    description: "Staff must be assigned to the branch to access it",
    value: { enabled: true },
  },
  {
    ruleKey: "restrict_login_to_opening_hours",
    name: "Restrict login to opening hours",
    description: "Only allow branch access during opening hours",
    value: { enabled: false },
  },
  {
    ruleKey: "require_manager_for_refunds",
    name: "Require manager for refunds",
    description: "Refunds require branch manager approval",
    value: { enabled: true },
  },
  {
    ruleKey: "require_manager_for_discounts",
    name: "Require manager for discounts",
    description: "Discounts above threshold require manager approval",
    value: { enabled: true, max_discount_without_manager: 10 },
  },
  {
    ruleKey: "maximum_discount_percentage",
    name: "Maximum discount percentage",
    description: "Maximum discount allowed without escalation",
    value: { percentage: 25 },
  },
  {
    ruleKey: "maximum_refund_amount",
    name: "Maximum refund amount",
    description: "Maximum refund without manager approval",
    value: { amount: 500, currency: "GBP" },
  },
  {
    ruleKey: "session_timeout_minutes",
    name: "Session timeout",
    description: "Inactive session timeout in minutes",
    value: { minutes: 30 },
  },
  {
    ruleKey: "allow_multiple_branch_managers",
    name: "Allow multiple branch managers",
    description: "Permit more than one manager per branch",
    value: { enabled: true },
  },
  {
    ruleKey: "allow_staff_schedule_self_view",
    name: "Staff can view own schedule",
    description: "Allow staff to view their own rota",
    value: { enabled: true },
  },
  {
    ruleKey: "allow_staff_performance_self_view",
    name: "Staff can view own performance",
    description: "Allow staff to view their own performance summary",
    value: { enabled: true },
  },
];

export const DEFAULT_BRANCH_SYSTEM_ROLES = [
  {
    code: "branch_manager",
    name: "Branch Manager",
    description: "Manages branch operations and staff",
    permissions: [
      "branch_staff.view",
      "branch_staff.assign",
      "branch_staff.update",
      "branch_roles.view",
      "branch_roles.assign",
      "branch_schedule.view",
      "branch_schedule.create",
      "branch_schedule.update",
      "branch_schedule.publish",
      "branch_performance.view",
      "branch_security.view",
    ],
  },
  {
    code: "branch_cashier",
    name: "Cashier",
    description: "Handles sales and payments at the branch",
    permissions: ["branch_schedule.view"],
  },
  {
    code: "branch_technician",
    name: "Technician",
    description: "Handles repairs at the branch",
    permissions: ["branch_schedule.view"],
  },
];
