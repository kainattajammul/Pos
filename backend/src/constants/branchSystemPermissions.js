export const BRANCH_SYSTEM_PERMISSIONS = {
  ACTIVITY_LOGS_VIEW: "branch_activity_logs.view",
  ACTIVITY_LOGS_VIEW_SENSITIVE: "branch_activity_logs.view_sensitive",
  ACTIVITY_LOGS_EXPORT: "branch_activity_logs.export",

  SYNC_VIEW: "branch_sync.view",
  SYNC_MANAGE_CONNECTIONS: "branch_sync.manage_connections",
  SYNC_START: "branch_sync.start",
  SYNC_PAUSE: "branch_sync.pause",
  SYNC_RETRY: "branch_sync.retry",
  SYNC_CANCEL: "branch_sync.cancel",
  SYNC_RESOLVE_CONFLICTS: "branch_sync.resolve_conflicts",
  SYNC_VIEW_ERRORS: "branch_sync.view_errors",

  SETTINGS_VIEW: "branch_settings.view",
  SETTINGS_MANAGE: "branch_settings.manage",
  SETTINGS_MANAGE_SENSITIVE: "branch_settings.manage_sensitive",
  SETTINGS_RESET: "branch_settings.reset",
  SETTINGS_VIEW_HISTORY: "branch_settings.view_history",

  SECURITY_RULES_VIEW: "branch_security_rules.view",
  SECURITY_RULES_MANAGE: "branch_security_rules.manage",
  SECURITY_RULES_SIMULATE: "branch_security_rules.simulate",
  SECURITY_EVENTS_VIEW: "branch_security_events.view",
  SECURITY_EVENTS_RESOLVE: "branch_security_events.resolve",

  FRANCHISE_VIEW: "branch_franchise_ownership.view",
  FRANCHISE_CREATE: "branch_franchise_ownership.create",
  FRANCHISE_UPDATE: "branch_franchise_ownership.update",
  FRANCHISE_ACTIVATE: "branch_franchise_ownership.activate",
  FRANCHISE_SUSPEND: "branch_franchise_ownership.suspend",
  FRANCHISE_TERMINATE: "branch_franchise_ownership.terminate",
  FRANCHISE_VIEW_DOCUMENTS: "branch_franchise_ownership.view_documents",
  FRANCHISE_UPLOAD_DOCUMENTS: "branch_franchise_ownership.upload_documents",

  DASHBOARD_VIEW: "branch_system_dashboard.view",

  SYSTEM_VIEW: "branch_system.view",
  SYSTEM_MANAGE: "branch_system.manage",
};

export const BRANCH_SYSTEM_PERMISSION_SEED = Object.entries(BRANCH_SYSTEM_PERMISSIONS).map(
  ([, key]) => ({
    key,
    module: key.split(".")[0],
  }),
);
