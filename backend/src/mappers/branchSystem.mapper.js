import { sanitizeAuditPayload, maskIpAddress, maskUserAgent } from "../services/branchAuditSanitization.service.js";

const SEVERITY_LABELS = {
  INFO: "Info",
  WARNING: "Warning",
  ERROR: "Error",
  CRITICAL: "Critical",
};

const STATUS_LABELS = {
  SUCCESS: "Success",
  FAILED: "Failed",
  PARTIAL: "Partial",
  BLOCKED: "Blocked",
};

const SYNC_STATUS_LABELS = {
  IDLE: "Idle",
  QUEUED: "Queued",
  RUNNING: "Running",
  SUCCESS: "Up to Date",
  PARTIAL: "Partial",
  FAILED: "Failed",
  PAUSED: "Paused",
  DISABLED: "Disabled",
};

const SYNC_TYPE_LABELS = {
  SETTINGS: "Settings",
  PRODUCTS: "Products",
  INVENTORY: "Inventory",
  CUSTOMERS: "Customers",
  SALES: "Sales",
  REPAIRS: "Repairs",
  PAYMENTS: "Payments",
  DOCUMENTS: "Documents",
  WEBSITE: "Website",
  MARKETPLACE: "Marketplace",
  ACCOUNTING: "Accounting",
  NOTIFICATIONS: "Notifications",
  REPORTING: "Reporting",
  OFFLINE_DEVICE: "Offline Device",
  OTHER: "Other",
};

function labelEnum(map, value) {
  const key = String(value ?? "").toUpperCase();
  return { value: key.toLowerCase(), label: map[key] ?? key };
}

export function toPublicSystemSettings({
  auditCount,
  syncSummary,
  franchiseOwner,
  twoFactorRequired,
}) {
  return {
    data_sync_status: syncSummary.status,
    last_sync_at: syncSummary.lastSyncAt,
    franchise_owner: franchiseOwner ?? "",
    audit_log_count: auditCount ?? 0,
    two_factor_required: Boolean(twoFactorRequired),
    has_data: (auditCount ?? 0) > 0 || syncSummary.connectionCount > 0 || Boolean(franchiseOwner),
  };
}

export function toPublicActivityLog(row, options = {}) {
  const { canViewSensitive = false, canExport = false, includeDetails = false } = options;
  const base = {
    id: String(row.id),
    actor: {
      id: row.user?.id ? String(row.user.id) : null,
      name: row.user?.fullName ?? "System",
      type: row.user ? "user" : "system",
    },
    module: row.entity ?? "unknown",
    action: row.action,
    description: `${row.action} on ${row.entity}`,
    entity: {
      type: row.entity,
      id: row.entityId,
    },
    severity: labelEnum(SEVERITY_LABELS, "INFO"),
    status: labelEnum(STATUS_LABELS, "SUCCESS"),
    occurred_at: row.createdAt?.toISOString() ?? null,
    available_actions: {
      can_view_details: true,
      can_export: canExport,
    },
  };

  if (includeDetails) {
    base.old_values = sanitizeAuditPayload(row.oldValues);
    base.new_values = sanitizeAuditPayload(row.newValues);
    base.ip_address = maskIpAddress(row.ipAddress, canViewSensitive);
    base.user_agent = maskUserAgent(row.userAgent);
  }

  return base;
}

export function toPublicActivitySummary({ total, todayCount }) {
  return {
    total,
    today: todayCount,
    has_data: total > 0,
  };
}

export function toPublicSyncConnection(connection, permissions = {}) {
  const latestJob = connection.jobs?.[0] ?? null;
  return {
    id: connection.uuid,
    name: connection.name,
    connection_code: connection.connectionCode,
    provider: connection.provider,
    sync_type: connection.syncType.toLowerCase(),
    sync_type_label: SYNC_TYPE_LABELS[connection.syncType] ?? connection.syncType,
    direction: connection.direction.toLowerCase(),
    status: labelEnum(SYNC_STATUS_LABELS, connection.currentStatus),
    is_enabled: connection.isEnabled,
    last_successful_sync_at: connection.lastSuccessfulSyncAt?.toISOString() ?? null,
    next_scheduled_sync_at: connection.nextScheduledSyncAt?.toISOString() ?? null,
    last_error_message: connection.lastErrorMessage,
    latest_job: latestJob
      ? {
          id: latestJob.uuid,
          total_records: latestJob.totalRecords,
          processed_records: latestJob.processedRecords,
          failed_records: latestJob.failedRecords,
          conflict_records: latestJob.conflictRecords,
          status: latestJob.status.toLowerCase(),
        }
      : null,
    available_actions: {
      can_start: permissions.canStart ?? false,
      can_pause: permissions.canPause ?? false,
      can_retry: permissions.canRetry ?? false,
      can_view_errors: permissions.canViewErrors ?? false,
    },
  };
}

export function toPublicSyncJob(job) {
  const durationMs =
    job.startedAt && (job.completedAt || job.failedAt)
      ? (job.completedAt ?? job.failedAt).getTime() - job.startedAt.getTime()
      : null;

  return {
    id: job.uuid,
    job_number: job.jobNumber,
    connection_id: job.connection?.uuid ?? null,
    connection_name: job.connection?.name ?? null,
    sync_type: job.connection?.syncType?.toLowerCase() ?? null,
    status: job.status.toLowerCase(),
    trigger_type: job.triggerType.toLowerCase(),
    started_at: job.startedAt?.toISOString() ?? null,
    completed_at: job.completedAt?.toISOString() ?? null,
    failed_at: job.failedAt?.toISOString() ?? null,
    duration_ms: durationMs,
    total_records: job.totalRecords,
    processed_records: job.processedRecords,
    created_records: job.createdRecords,
    updated_records: job.updatedRecords,
    skipped_records: job.skippedRecords,
    failed_records: job.failedRecords,
    conflict_records: job.conflictRecords,
    error_code: job.errorCode,
    error_message: job.errorMessage,
    retry_count: job.retryCount,
  };
}

export function toPublicSyncJobItem(item) {
  return {
    id: item.uuid,
    entity_type: item.entityType,
    local_entity_id: item.localEntityId,
    remote_entity_id: item.remoteEntityId,
    status: item.status.toLowerCase(),
    action: item.action,
    error_code: item.errorCode,
    error_message: item.errorMessage,
    conflict_data: sanitizeAuditPayload(item.conflictData),
    processed_at: item.processedAt?.toISOString() ?? null,
  };
}

export function toPublicBranchSetting(setting, registryEntry, source = "branch_override") {
  return {
    namespace: setting.namespace,
    key: setting.key,
    label: registryEntry?.label ?? setting.key,
    value: setting.value,
    value_type: setting.valueType.toLowerCase(),
    source,
    is_inherited: setting.isInherited,
    can_override: registryEntry?.canOverride ?? true,
    version: setting.version,
    updated_at: setting.updatedAt?.toISOString() ?? null,
  };
}

export function toPublicSecurityEvent(event) {
  return {
    id: event.uuid,
    rule_key: event.ruleKey,
    event_type: event.eventType.toLowerCase(),
    severity: labelEnum(SEVERITY_LABELS, event.severity),
    status: { value: event.status.toLowerCase(), label: event.status },
    description: event.description,
    actor_user_id: event.actorUserId ? String(event.actorUserId) : null,
    entity_type: event.entityType,
    entity_id: event.entityId,
    detected_at: event.detectedAt?.toISOString() ?? null,
    resolved_at: event.resolvedAt?.toISOString() ?? null,
    resolution_notes: event.resolutionNotes,
  };
}

export function toPublicOwnership(ownership) {
  const entity = ownership.businessEntity;
  return {
    id: ownership.uuid,
    ownership_type: ownership.ownershipType.toLowerCase(),
    ownership_percentage: ownership.ownershipPercentage
      ? String(ownership.ownershipPercentage)
      : null,
    is_primary_owner: ownership.isPrimaryOwner,
    is_operating_entity: ownership.isOperatingEntity,
    status: ownership.status.toLowerCase(),
    effective_from: ownership.effectiveFrom?.toISOString() ?? null,
    effective_until: ownership.effectiveUntil?.toISOString() ?? null,
    agreement_reference: ownership.agreementReference,
    has_agreement_document: Boolean(ownership.agreementStoragePath),
    entity: entity
      ? {
          id: entity.uuid,
          legal_name: entity.legalName,
          trading_name: entity.tradingName,
          entity_type: entity.entityType.toLowerCase(),
        }
      : null,
    notes: ownership.notes,
  };
}

export function toPublicSystemDashboard({
  branch,
  activity,
  sync,
  security,
  settings,
  ownership,
}) {
  return {
    branch: { id: branch.uuid, name: branch.name },
    activity,
    sync,
    security,
    settings,
    ownership,
    calculated_at: new Date().toISOString(),
    has_data:
      activity.totalToday > 0 ||
      sync.connections > 0 ||
      security.activeRules > 0 ||
      settings.branchOverrides > 0 ||
      Boolean(ownership.primaryOwner),
  };
}

export function computeSyncStatusSummary(connections) {
  if (!connections.length) {
    return { status: "pending", lastSyncAt: null, connectionCount: 0, running: 0, failed: 0 };
  }

  const active = connections.filter((c) => c.isEnabled);
  const running = active.filter((c) => ["RUNNING", "QUEUED"].includes(c.currentStatus)).length;
  const failed = active.filter((c) => c.currentStatus === "FAILED").length;

  let status = "synced";
  if (running > 0) status = "pending";
  else if (failed > 0) status = "error";
  else if (active.every((c) => !c.lastSuccessfulSyncAt)) status = "pending";

  const lastSyncAt = active.reduce((max, c) => {
    const t = c.lastSuccessfulSyncAt;
    if (!t) return max;
    return !max || t > max ? t : max;
  }, null);

  return {
    status,
    lastSyncAt: lastSyncAt?.toISOString() ?? null,
    connectionCount: connections.length,
    running,
    failed,
  };
}
