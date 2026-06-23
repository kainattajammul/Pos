import { Router } from "express";
import multer from "multer";
import { BranchSystemController as C } from "../controllers/branchSystem.controller.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  authenticateRequest,
  requireBranchContext,
  requireBranchPermission,
} from "../middleware/branchStaffAccess.middleware.js";
import { attachSystemPermissions } from "../middleware/branchSystemAccess.middleware.js";
import { BRANCH_SYSTEM_PERMISSIONS as P } from "../constants/branchSystemPermissions.js";
import {
  activityIdParam,
  activityLogQueryRules,
  branchSystemContextRules,
  bulkSettingsUpdateRules,
  connectionUuidParam,
  createConnectionRules,
  createOwnershipRules,
  jobItemResolveRules,
  jobUuidParam,
  listQueryRules,
  ownershipUuidParam,
  patchSecurityRuleRules,
  patchSettingRules,
  resolveEventRules,
  securityEventUuidParam,
  securityRuleKeyParam,
  settingsKeyParam,
  settingsNamespaceParam,
  simulateSecurityRules,
  systemSettingsUpdateRules,
  updateConnectionRules,
  updateOwnershipRules,
} from "../validators/branchSystem.validator.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const router = Router({ mergeParams: true });
router.use(authenticateRequest, requireBranchContext, attachSystemPermissions);

router.get("/system-settings", requireBranchPermission(P.SYSTEM_VIEW), branchSystemContextRules, validateRequest, asyncHandler(C.getSystemSettings));
router.patch("/system-settings", requireBranchPermission(P.SYSTEM_MANAGE), systemSettingsUpdateRules, validateRequest, asyncHandler(C.updateSystemSettings));

router.get("/system/dashboard", requireBranchPermission(P.DASHBOARD_VIEW), branchSystemContextRules, validateRequest, asyncHandler(C.getDashboard));
router.get("/system/activity-summary", requireBranchPermission(P.ACTIVITY_LOGS_VIEW), branchSystemContextRules, validateRequest, asyncHandler(C.getActivitySummary));
router.get("/system/sync-summary", requireBranchPermission(P.SYNC_VIEW), branchSystemContextRules, validateRequest, asyncHandler(C.getSyncSummary));
router.get("/system/security-summary", requireBranchPermission(P.SECURITY_EVENTS_VIEW), branchSystemContextRules, validateRequest, asyncHandler(C.getSecuritySummary));
router.get("/system/ownership-summary", requireBranchPermission(P.FRANCHISE_VIEW), branchSystemContextRules, validateRequest, asyncHandler(C.getOwnershipSummary));

router.get("/activity-logs", requireBranchPermission(P.ACTIVITY_LOGS_VIEW), activityLogQueryRules, validateRequest, asyncHandler(C.listActivityLogs));
router.get("/activity-logs/summary", requireBranchPermission(P.ACTIVITY_LOGS_VIEW), branchSystemContextRules, validateRequest, asyncHandler(C.getActivityLogSummary));
router.get("/activity-logs/export", requireBranchPermission(P.ACTIVITY_LOGS_EXPORT), activityLogQueryRules, validateRequest, asyncHandler(C.exportActivityLogs));
router.get("/activity-logs/:activityId", requireBranchPermission(P.ACTIVITY_LOGS_VIEW), activityIdParam, validateRequest, asyncHandler(C.getActivityLog));

router.get("/sync-connections", requireBranchPermission(P.SYNC_VIEW), listQueryRules, validateRequest, asyncHandler(C.listSyncConnections));
router.post("/sync-connections", requireBranchPermission(P.SYNC_MANAGE_CONNECTIONS), createConnectionRules, validateRequest, asyncHandler(C.createSyncConnection));
router.get("/sync-connections/:connectionId", requireBranchPermission(P.SYNC_VIEW), connectionUuidParam, validateRequest, asyncHandler(C.getSyncConnection));
router.patch("/sync-connections/:connectionId", requireBranchPermission(P.SYNC_MANAGE_CONNECTIONS), updateConnectionRules, validateRequest, asyncHandler(C.updateSyncConnection));
router.post("/sync-connections/:connectionId/start", requireBranchPermission(P.SYNC_START), connectionUuidParam, validateRequest, asyncHandler(C.startSync));
router.post("/sync-connections/:connectionId/pause", requireBranchPermission(P.SYNC_PAUSE), connectionUuidParam, validateRequest, asyncHandler(C.pauseSync));
router.post("/sync-connections/:connectionId/resume", requireBranchPermission(P.SYNC_PAUSE), connectionUuidParam, validateRequest, asyncHandler(C.resumeSync));
router.post("/sync-connections/:connectionId/test", requireBranchPermission(P.SYNC_VIEW), connectionUuidParam, validateRequest, asyncHandler(C.testSync));

router.get("/sync-jobs", requireBranchPermission(P.SYNC_VIEW), listQueryRules, validateRequest, asyncHandler(C.listSyncJobs));
router.get("/sync-jobs/:jobId", requireBranchPermission(P.SYNC_VIEW), jobUuidParam, validateRequest, asyncHandler(C.getSyncJob));
router.post("/sync-jobs/:jobId/retry", requireBranchPermission(P.SYNC_RETRY), jobUuidParam, validateRequest, asyncHandler(C.retrySyncJob));
router.post("/sync-jobs/:jobId/cancel", requireBranchPermission(P.SYNC_CANCEL), jobUuidParam, validateRequest, asyncHandler(C.cancelSyncJob));
router.get("/sync-jobs/:jobId/items", requireBranchPermission(P.SYNC_VIEW_ERRORS), jobUuidParam, validateRequest, asyncHandler(C.listSyncJobItems));
router.post("/sync-jobs/:jobId/conflicts/:itemId/resolve", requireBranchPermission(P.SYNC_RESOLVE_CONFLICTS), jobItemResolveRules, validateRequest, asyncHandler(C.resolveSyncConflict));

router.get("/settings", requireBranchPermission(P.SETTINGS_VIEW), listQueryRules, validateRequest, asyncHandler(C.getSettings));
router.get("/settings/history", requireBranchPermission(P.SETTINGS_VIEW_HISTORY), listQueryRules, validateRequest, asyncHandler(C.getSettingsHistory));
router.get("/settings/:namespace", requireBranchPermission(P.SETTINGS_VIEW), settingsNamespaceParam, validateRequest, asyncHandler(C.getSettingsNamespace));
router.patch("/settings", requireBranchPermission(P.SETTINGS_MANAGE), bulkSettingsUpdateRules, validateRequest, asyncHandler(C.patchSettings));
router.patch("/settings/:namespace/:key", requireBranchPermission(P.SETTINGS_MANAGE), patchSettingRules, validateRequest, asyncHandler(C.patchSetting));
router.post("/settings/:namespace/:key/reset", requireBranchPermission(P.SETTINGS_RESET), settingsKeyParam, validateRequest, asyncHandler(C.resetSetting));

router.get("/security-rules", requireBranchPermission(P.SECURITY_RULES_VIEW), branchSystemContextRules, validateRequest, asyncHandler(C.listSecurityRules));
router.get("/security-rules/:ruleKey", requireBranchPermission(P.SECURITY_RULES_VIEW), securityRuleKeyParam, validateRequest, asyncHandler(C.getSecurityRule));
router.patch("/security-rules/:ruleKey", requireBranchPermission(P.SECURITY_RULES_MANAGE), patchSecurityRuleRules, validateRequest, asyncHandler(C.patchSecurityRule));
router.post("/security-rules/:ruleKey/enable", requireBranchPermission(P.SECURITY_RULES_MANAGE), securityRuleKeyParam, validateRequest, asyncHandler(C.enableSecurityRule));
router.post("/security-rules/:ruleKey/disable", requireBranchPermission(P.SECURITY_RULES_MANAGE), securityRuleKeyParam, validateRequest, asyncHandler(C.disableSecurityRule));
router.post("/security-rules/simulate", requireBranchPermission(P.SECURITY_RULES_SIMULATE), simulateSecurityRules, validateRequest, asyncHandler(C.simulateSecurity));

router.get("/security-events", requireBranchPermission(P.SECURITY_EVENTS_VIEW), listQueryRules, validateRequest, asyncHandler(C.listSecurityEvents));
router.get("/security-events/:eventId", requireBranchPermission(P.SECURITY_EVENTS_VIEW), securityEventUuidParam, validateRequest, asyncHandler(C.getSecurityEvent));
router.post("/security-events/:eventId/acknowledge", requireBranchPermission(P.SECURITY_EVENTS_RESOLVE), resolveEventRules, validateRequest, asyncHandler(C.acknowledgeSecurityEvent));
router.post("/security-events/:eventId/resolve", requireBranchPermission(P.SECURITY_EVENTS_RESOLVE), resolveEventRules, validateRequest, asyncHandler(C.resolveSecurityEvent));
router.post("/security-events/:eventId/dismiss", requireBranchPermission(P.SECURITY_EVENTS_RESOLVE), resolveEventRules, validateRequest, asyncHandler(C.dismissSecurityEvent));

router.get("/ownership", requireBranchPermission(P.FRANCHISE_VIEW), listQueryRules, validateRequest, asyncHandler(C.listOwnership));
router.post("/ownership", requireBranchPermission(P.FRANCHISE_CREATE), createOwnershipRules, validateRequest, asyncHandler(C.createOwnership));
router.get("/ownership/history", requireBranchPermission(P.FRANCHISE_VIEW), listQueryRules, validateRequest, asyncHandler(C.listOwnershipHistory));
router.get("/ownership/:ownershipId", requireBranchPermission(P.FRANCHISE_VIEW), ownershipUuidParam, validateRequest, asyncHandler(C.getOwnership));
router.patch("/ownership/:ownershipId", requireBranchPermission(P.FRANCHISE_UPDATE), updateOwnershipRules, validateRequest, asyncHandler(C.updateOwnership));
router.post("/ownership/:ownershipId/activate", requireBranchPermission(P.FRANCHISE_ACTIVATE), ownershipUuidParam, validateRequest, asyncHandler(C.activateOwnership));
router.post("/ownership/:ownershipId/suspend", requireBranchPermission(P.FRANCHISE_SUSPEND), ownershipUuidParam, validateRequest, asyncHandler(C.suspendOwnership));
router.post("/ownership/:ownershipId/terminate", requireBranchPermission(P.FRANCHISE_TERMINATE), ownershipUuidParam, validateRequest, asyncHandler(C.terminateOwnership));
router.post("/ownership/:ownershipId/restore", requireBranchPermission(P.FRANCHISE_ACTIVATE), ownershipUuidParam, validateRequest, asyncHandler(C.restoreOwnership));
router.post("/ownership/:ownershipId/agreement", requireBranchPermission(P.FRANCHISE_UPLOAD_DOCUMENTS), upload.single("agreement"), ownershipUuidParam, validateRequest, asyncHandler(C.uploadAgreement));
router.get("/ownership/:ownershipId/agreement-url", requireBranchPermission(P.FRANCHISE_VIEW_DOCUMENTS), ownershipUuidParam, validateRequest, asyncHandler(C.getAgreementUrl));

export default router;
