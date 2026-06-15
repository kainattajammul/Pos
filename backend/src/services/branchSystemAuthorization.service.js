import { BRANCH_SYSTEM_PERMISSIONS as P } from "../constants/branchSystemPermissions.js";
import { ShopMemberModel } from "../models/branch.model.js";
import { prisma } from "../config/database.js";

async function branchPermissionKeys(userId, branchId, shopId) {
  const assignment = await prisma.branchStaffAssignment.findFirst({
    where: {
      userId: Number(userId),
      branchId: Number(branchId),
      shopId: Number(shopId),
      status: "ACTIVE",
    },
    include: {
      roleAssignments: {
        include: {
          role: {
            include: { permissions: { include: { permission: true } } },
          },
        },
      },
      userPermissions: { include: { permission: true } },
    },
  });

  const keys = new Set();
  if (assignment) {
    for (const ra of assignment.roleAssignments) {
      for (const rp of ra.role.permissions) keys.add(rp.permission.key);
    }
    for (const up of assignment.userPermissions) keys.add(up.permission.key);
  }

  const shopKeys = await ShopMemberModel.userPermissionKeys(userId, shopId);
  for (const k of shopKeys) keys.add(k);

  return [...keys];
}

function has(keys, perm) {
  return keys.includes("*") || keys.includes(perm);
}

export async function resolveSystemPermissions(userId, branchId, shopId, authContext) {
  if (authContext?.devBypass) {
    return buildPermissionMap(["*"]);
  }
  const keys = await branchPermissionKeys(userId, branchId, shopId);
  return buildPermissionMap(keys);
}

function buildPermissionMap(keys) {
  const all = keys.includes("*");
  return {
    permissions: keys,
    canViewActivity: all || has(keys, P.ACTIVITY_LOGS_VIEW),
    canViewSensitive: all || has(keys, P.ACTIVITY_LOGS_VIEW_SENSITIVE),
    canExportActivity: all || has(keys, P.ACTIVITY_LOGS_EXPORT),
    canViewSync: all || has(keys, P.SYNC_VIEW),
    canManageConnections: all || has(keys, P.SYNC_MANAGE_CONNECTIONS),
    canStartSync: all || has(keys, P.SYNC_START),
    canPauseSync: all || has(keys, P.SYNC_PAUSE),
    canRetrySync: all || has(keys, P.SYNC_RETRY),
    canCancelSync: all || has(keys, P.SYNC_CANCEL),
    canResolveConflicts: all || has(keys, P.SYNC_RESOLVE_CONFLICTS),
    canViewSyncErrors: all || has(keys, P.SYNC_VIEW_ERRORS),
    canViewSettings: all || has(keys, P.SETTINGS_VIEW),
    canManageSettings: all || has(keys, P.SETTINGS_MANAGE),
    canResetSettings: all || has(keys, P.SETTINGS_RESET),
    canViewSettingsHistory: all || has(keys, P.SETTINGS_VIEW_HISTORY),
    canViewSecurityRules: all || has(keys, P.SECURITY_RULES_VIEW),
    canManageSecurityRules: all || has(keys, P.SECURITY_RULES_MANAGE),
    canSimulateSecurity: all || has(keys, P.SECURITY_RULES_SIMULATE),
    canViewSecurityEvents: all || has(keys, P.SECURITY_EVENTS_VIEW),
    canResolveSecurityEvents: all || has(keys, P.SECURITY_EVENTS_RESOLVE),
    canViewFranchise: all || has(keys, P.FRANCHISE_VIEW),
    canManageFranchise: all || has(keys, P.FRANCHISE_CREATE) || has(keys, P.FRANCHISE_UPDATE),
    canViewDocuments: all || has(keys, P.FRANCHISE_VIEW_DOCUMENTS),
    canUploadDocuments: all || has(keys, P.FRANCHISE_UPLOAD_DOCUMENTS),
    canViewDashboard: all || has(keys, P.DASHBOARD_VIEW),
    canViewSystem: all || has(keys, P.SYSTEM_VIEW),
    canManageSystem: all || has(keys, P.SYSTEM_MANAGE),
    availableActions: {
      canView: all || has(keys, P.SYSTEM_VIEW),
      canManage: all || has(keys, P.SYSTEM_MANAGE),
      canExportActivity: all || has(keys, P.ACTIVITY_LOGS_EXPORT),
      canStartSync: all || has(keys, P.SYNC_START),
      canPauseSync: all || has(keys, P.SYNC_PAUSE),
      canRetrySync: all || has(keys, P.SYNC_RETRY),
      canViewDashboard: all || has(keys, P.DASHBOARD_VIEW),
    },
  };
}
