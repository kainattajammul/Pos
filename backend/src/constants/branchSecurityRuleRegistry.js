export const EXTENDED_SECURITY_RULES = [
  {
    ruleKey: "require_two_factor_authentication",
    name: "Require two-factor authentication",
    description: "Staff must use two-factor authentication for branch access",
    category: "AUTHENTICATION",
    value: { enabled: false },
  },
  {
    ruleKey: "restrict_access_by_ip",
    name: "Restrict access by IP",
    description: "Limit branch access to approved IP ranges",
    category: "NETWORK",
    value: { enabled: false, allowed_ips: [] },
  },
  {
    ruleKey: "maximum_failed_login_attempts",
    name: "Maximum failed login attempts",
    description: "Lock account after repeated failed logins",
    category: "AUTHENTICATION",
    value: { count: 5, lockout_minutes: 15 },
  },
  {
    ruleKey: "require_manager_for_cash_adjustments",
    name: "Require manager for cash adjustments",
    description: "Cash drawer adjustments require manager approval",
    category: "FINANCIAL",
    value: { enabled: true },
  },
  {
    ruleKey: "require_manager_for_stock_adjustments",
    name: "Require manager for stock adjustments",
    description: "Stock adjustments require manager approval",
    category: "INVENTORY",
    value: { enabled: false },
  },
  {
    ruleKey: "require_customer_data_access_reason",
    name: "Require reason for customer data access",
    description: "Staff must provide a reason when viewing sensitive customer data",
    category: "CUSTOMER_DATA",
    value: { enabled: true },
  },
  {
    ruleKey: "restrict_customer_export",
    name: "Restrict customer export",
    description: "Limit bulk customer data exports",
    category: "EXPORTS",
    value: { enabled: true },
  },
  {
    ruleKey: "require_sync_conflict_review",
    name: "Require sync conflict review",
    description: "Sync conflicts must be reviewed before resolution",
    category: "INTEGRATIONS",
    value: { enabled: true },
  },
];

export function findSecurityRuleDefinition(ruleKey) {
  return EXTENDED_SECURITY_RULES.find((r) => r.ruleKey === ruleKey) ?? null;
}
