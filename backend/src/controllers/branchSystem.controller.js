import * as SystemSettingsService from "../services/branchSystemSettings.service.js";
import * as ActivityLogService from "../services/branchActivityLog.service.js";
import * as SyncConnectionService from "../services/branchSyncConnection.service.js";
import * as SyncJobService from "../services/branchSyncJob.service.js";
import * as SyncConflictService from "../services/branchSyncConflict.service.js";
import * as SettingsService from "../services/branchSettingsResolution.service.js";
import * as SecurityPolicyService from "../services/branchSecurityPolicy.service.js";
import * as SecurityEventService from "../services/branchSecurityEvent.service.js";
import * as OwnershipService from "../services/branchOwnership.service.js";
import * as OwnershipDocumentService from "../services/branchOwnershipDocument.service.js";
import { writeAuditLog } from "../services/auditLog.service.js";
import { getClientMeta } from "../utils/branchHelpers.js";

function ctx(req) {
  return {
    shopId: req.shopId,
    branchId: req.branchId,
    branchUuid: req.params.branchUuid,
    userId: req.authContext?.userId ?? req.user?.id,
    req,
    permissions: req.systemPermissions ?? {},
    auditContext: {
      userId: req.authContext?.userId ?? req.user?.id,
      ...getClientMeta(req),
    },
  };
}

export const BranchSystemController = {
  async getSystemSettings(req, res) {
    const data = await SystemSettingsService.getSystemSettings(ctx(req));
    res.json({
      success: true,
      data,
      availableActions: req.systemPermissions?.availableActions ?? {},
    });
  },

  async updateSystemSettings(req, res) {
    const data = await SystemSettingsService.updateSystemSettings({
      ...ctx(req),
      input: req.body,
    });
    res.json({ success: true, data });
  },

  async getDashboard(req, res) {
    const data = await SystemSettingsService.getDashboard(ctx(req));
    res.json({ success: true, data });
  },

  async getActivitySummary(req, res) {
    const data = await SystemSettingsService.getActivitySummary(ctx(req));
    res.json({ success: true, data });
  },

  async getSyncSummary(req, res) {
    const data = await SystemSettingsService.getSyncSummaryEndpoint(ctx(req));
    res.json({ success: true, data });
  },

  async getSecuritySummary(req, res) {
    const data = await SystemSettingsService.getSecuritySummary(ctx(req));
    res.json({ success: true, data });
  },

  async getOwnershipSummary(req, res) {
    const data = await SystemSettingsService.getOwnershipSummaryEndpoint(ctx(req));
    res.json({ success: true, data });
  },

  async listActivityLogs(req, res) {
    const { permissions } = ctx(req);
    const result = await ActivityLogService.listActivityLogs({
      ...ctx(req),
      query: req.query,
      permissions: {
        canViewSensitive: permissions.canViewSensitive,
        canExport: permissions.canExportActivity,
      },
    });
    res.json({ success: true, ...result });
  },

  async getActivityLog(req, res) {
    const c = ctx(req);
    const data = await ActivityLogService.getActivityLog({
      ...c,
      activityId: req.params.activityId,
      permissions: {
        canViewSensitive: c.permissions.canViewSensitive,
        canExport: c.permissions.canExportActivity,
      },
    });

    if (c.permissions.canViewSensitive) {
      await writeAuditLog({
        shopId: c.shopId,
        branchId: c.branchId,
        userId: c.userId,
        action: "branch_activity_log.viewed",
        entity: "audit_log",
        entityId: String(req.params.activityId),
        ...getClientMeta(req),
      });
    }

    res.json({ success: true, data });
  },

  async exportActivityLogs(req, res) {
    const c = ctx(req);
    const data = await ActivityLogService.exportActivityLogs({
      ...c,
      query: req.query,
      permissions: {
        canExport: c.permissions.canExportActivity,
        canViewSensitive: c.permissions.canViewSensitive,
      },
    });

    await writeAuditLog({
      shopId: c.shopId,
      branchId: c.branchId,
      userId: c.userId,
      action: "branch_activity_log.exported",
      entity: "audit_log",
      entityId: "export",
      newValues: { count: data.count },
      ...getClientMeta(req),
    });

    res.json({ success: true, data });
  },

  async getActivityLogSummary(req, res) {
    const data = await ActivityLogService.getActivitySummary(ctx(req));
    res.json({ success: true, data });
  },

  async listSyncConnections(req, res) {
    const c = ctx(req);
    const result = await SyncConnectionService.listConnections({
      ...c,
      query: req.query,
      permissions: {
        canStart: c.permissions.canStartSync,
        canPause: c.permissions.canPauseSync,
        canRetry: c.permissions.canRetrySync,
        canViewErrors: c.permissions.canViewSyncErrors,
      },
    });
    res.json({ success: true, ...result });
  },

  async createSyncConnection(req, res) {
    const data = await SyncConnectionService.createConnection({ ...ctx(req), input: req.body });
    res.status(201).json({ success: true, data });
  },

  async getSyncConnection(req, res) {
    const c = ctx(req);
    const data = await SyncConnectionService.getConnection({
      ...c,
      connectionUuid: req.params.connectionId,
      permissions: c.permissions,
    });
    res.json({ success: true, data });
  },

  async updateSyncConnection(req, res) {
    const data = await SyncConnectionService.updateConnection({
      ...ctx(req),
      connectionUuid: req.params.connectionId,
      input: req.body,
    });
    res.json({ success: true, data });
  },

  async startSync(req, res) {
    const data = await SyncConnectionService.startSync({
      ...ctx(req),
      connectionUuid: req.params.connectionId,
    });
    res.json({ success: true, data });
  },

  async pauseSync(req, res) {
    const data = await SyncConnectionService.pauseConnection({
      ...ctx(req),
      connectionUuid: req.params.connectionId,
    });
    res.json({ success: true, data });
  },

  async resumeSync(req, res) {
    const data = await SyncConnectionService.resumeConnection({
      ...ctx(req),
      connectionUuid: req.params.connectionId,
    });
    res.json({ success: true, data });
  },

  async testSync(req, res) {
    const data = await SyncConnectionService.testConnection({
      ...ctx(req),
      connectionUuid: req.params.connectionId,
    });
    res.json({ success: true, data });
  },

  async listSyncJobs(req, res) {
    const result = await SyncJobService.listJobs({ ...ctx(req), query: req.query });
    res.json({ success: true, ...result });
  },

  async getSyncJob(req, res) {
    const data = await SyncJobService.getJob({
      ...ctx(req),
      jobUuid: req.params.jobId,
    });
    res.json({ success: true, data });
  },

  async retrySyncJob(req, res) {
    const data = await SyncJobService.retryJob({ ...ctx(req), jobUuid: req.params.jobId });
    res.json({ success: true, data });
  },

  async cancelSyncJob(req, res) {
    const data = await SyncJobService.cancelJob({ ...ctx(req), jobUuid: req.params.jobId });
    res.json({ success: true, data });
  },

  async listSyncJobItems(req, res) {
    const result = await SyncJobService.listJobItems({
      ...ctx(req),
      jobUuid: req.params.jobId,
      query: req.query,
    });
    res.json({ success: true, ...result });
  },

  async resolveSyncConflict(req, res) {
    const data = await SyncConflictService.resolveConflict({
      ...ctx(req),
      jobUuid: req.params.jobId,
      itemUuid: req.params.itemId,
      resolution: req.body.resolution,
      reason: req.body.reason,
    });
    res.json({ success: true, data });
  },

  async getSettings(req, res) {
    const result = await SettingsService.getEffectiveSettings({
      ...ctx(req),
      namespace: req.query.namespace,
    });
    res.json({ success: true, ...result });
  },

  async getSettingsNamespace(req, res) {
    const result = await SettingsService.getEffectiveSettings({
      ...ctx(req),
      namespace: req.params.namespace,
    });
    res.json({ success: true, ...result });
  },

  async patchSettings(req, res) {
    const data = await SettingsService.bulkUpdateSettings({
      ...ctx(req),
      settings: req.body.settings,
    });
    res.json({ success: true, data });
  },

  async patchSetting(req, res) {
    const data = await SettingsService.updateBranchSetting({
      ...ctx(req),
      namespace: req.params.namespace,
      key: req.params.key,
      value: req.body.value,
      expectedVersion: req.body.version,
      changeReason: req.body.change_reason,
    });
    res.json({ success: true, data });
  },

  async resetSetting(req, res) {
    const data = await SettingsService.resetToInherited({
      ...ctx(req),
      namespace: req.params.namespace,
      key: req.params.key,
    });
    res.json({ success: true, data });
  },

  async getSettingsHistory(req, res) {
    const result = await SettingsService.getSettingsHistory({ ...ctx(req), query: req.query });
    res.json({ success: true, ...result });
  },

  async listSecurityRules(req, res) {
    const data = await SecurityPolicyService.getEffectiveRules(ctx(req).shopId, ctx(req).branchUuid);
    res.json({ success: true, data, hasData: data.length > 0 });
  },

  async getSecurityRule(req, res) {
    const data = await SecurityPolicyService.getRule(
      ctx(req).shopId,
      ctx(req).branchUuid,
      req.params.ruleKey,
    );
    res.json({ success: true, data });
  },

  async patchSecurityRule(req, res) {
    const data = await SecurityPolicyService.updateRule(
      ctx(req).shopId,
      ctx(req).branchUuid,
      req.params.ruleKey,
      req.body,
      ctx(req).auditContext,
    );
    res.json({ success: true, data });
  },

  async enableSecurityRule(req, res) {
    const data = await SecurityPolicyService.setRuleEnabled(
      ctx(req).shopId,
      ctx(req).branchUuid,
      req.params.ruleKey,
      true,
      ctx(req).auditContext,
    );
    res.json({ success: true, data });
  },

  async disableSecurityRule(req, res) {
    const data = await SecurityPolicyService.setRuleEnabled(
      ctx(req).shopId,
      ctx(req).branchUuid,
      req.params.ruleKey,
      false,
      ctx(req).auditContext,
    );
    res.json({ success: true, data });
  },

  async simulateSecurity(req, res) {
    const data = await SecurityPolicyService.simulateAction(ctx(req).shopId, ctx(req).branchUuid, req.body);
    res.json({ success: true, data });
  },

  async listSecurityEvents(req, res) {
    const result = await SecurityEventService.listEvents({ ...ctx(req), query: req.query });
    res.json({ success: true, ...result });
  },

  async getSecurityEvent(req, res) {
    const data = await SecurityEventService.getEvent({
      ...ctx(req),
      eventUuid: req.params.eventId,
    });
    res.json({ success: true, data });
  },

  async acknowledgeSecurityEvent(req, res) {
    const data = await SecurityEventService.acknowledgeEvent({
      ...ctx(req),
      eventUuid: req.params.eventId,
      notes: req.body.notes,
    });
    res.json({ success: true, data });
  },

  async resolveSecurityEvent(req, res) {
    const data = await SecurityEventService.resolveEvent({
      ...ctx(req),
      eventUuid: req.params.eventId,
      notes: req.body.notes,
    });
    res.json({ success: true, data });
  },

  async dismissSecurityEvent(req, res) {
    const data = await SecurityEventService.dismissEvent({
      ...ctx(req),
      eventUuid: req.params.eventId,
      notes: req.body.notes,
    });
    res.json({ success: true, data });
  },

  async listOwnership(req, res) {
    const result = await OwnershipService.listOwnership({ ...ctx(req), query: req.query });
    res.json({ success: true, ...result });
  },

  async createOwnership(req, res) {
    const data = await OwnershipService.createOwnership({ ...ctx(req), input: req.body });
    res.status(201).json({ success: true, data });
  },

  async getOwnership(req, res) {
    const data = await OwnershipService.getOwnership({
      ...ctx(req),
      ownershipUuid: req.params.ownershipId,
    });
    res.json({ success: true, data });
  },

  async updateOwnership(req, res) {
    const data = await OwnershipService.updateOwnership({
      ...ctx(req),
      ownershipUuid: req.params.ownershipId,
      input: req.body,
    });
    res.json({ success: true, data });
  },

  async activateOwnership(req, res) {
    const data = await OwnershipService.activateOwnership({
      ...ctx(req),
      ownershipUuid: req.params.ownershipId,
    });
    res.json({ success: true, data });
  },

  async suspendOwnership(req, res) {
    const data = await OwnershipService.suspendOwnership({
      ...ctx(req),
      ownershipUuid: req.params.ownershipId,
    });
    res.json({ success: true, data });
  },

  async terminateOwnership(req, res) {
    const data = await OwnershipService.terminateOwnership({
      ...ctx(req),
      ownershipUuid: req.params.ownershipId,
    });
    res.json({ success: true, data });
  },

  async restoreOwnership(req, res) {
    const data = await OwnershipService.restoreOwnership({
      ...ctx(req),
      ownershipUuid: req.params.ownershipId,
    });
    res.json({ success: true, data });
  },

  async listOwnershipHistory(req, res) {
    const result = await OwnershipService.listOwnershipHistory({ ...ctx(req), query: req.query });
    res.json({ success: true, ...result });
  },

  async uploadAgreement(req, res) {
    const data = await OwnershipDocumentService.uploadAgreement({
      ...ctx(req),
      ownershipUuid: req.params.ownershipId,
      file: req.file,
    });
    res.json({ success: true, data });
  },

  async getAgreementUrl(req, res) {
    const data = await OwnershipDocumentService.getAgreementSignedUrl({
      ...ctx(req),
      ownershipUuid: req.params.ownershipId,
    });
    res.json({ success: true, data });
  },
};
