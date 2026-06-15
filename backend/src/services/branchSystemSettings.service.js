import { prisma } from "../config/database.js";
import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { BranchSystemModel } from "../models/branchSystem.model.js";
import { toPublicSystemSettings, toPublicSystemDashboard } from "../mappers/branchSystem.mapper.js";
import { getSyncSummary } from "./branchSyncConnection.service.js";
import { getTwoFactorRequired, setTwoFactorRequired } from "./branchSecurityPolicy.service.js";
import {
  getPrimaryOwnerName,
  setFranchiseOwnerDisplay,
  getOwnershipSummary,
} from "./branchOwnership.service.js";
import { countSettingsSummary } from "./branchSettingsResolution.service.js";
import { countOpenEvents } from "./branchSecurityEvent.service.js";
import { countSecurityRulesSummary } from "./branchSecurityPolicy.service.js";
import { ensureBranch } from "./branchSyncConnection.service.js";
import { writeAuditLog } from "./auditLog.service.js";
import { getClientMeta } from "../utils/branchHelpers.js";

export async function getSystemSettings({ shopId, branchUuid }) {
  const branch = await ensureBranch(shopId, branchUuid);

  const [auditCount, syncSummary, franchiseOwner, twoFactorRequired] = await Promise.all([
    BranchSystemModel.countAuditLogs(branch.id, shopId),
    getSyncSummary(shopId, branch.id),
    getPrimaryOwnerName(branch.id, shopId),
    getTwoFactorRequired(branch.id, shopId),
  ]);

  return toPublicSystemSettings({
    auditCount,
    syncSummary,
    franchiseOwner,
    twoFactorRequired,
  });
}

export async function updateSystemSettings({ shopId, branchUuid, input, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);

  if (input.franchise_owner != null) {
    await setFranchiseOwnerDisplay({
      shopId,
      branchUuid,
      franchiseOwner: input.franchise_owner,
      userId,
      req,
    });
  }

  if (input.two_factor_required != null) {
    await setTwoFactorRequired(branch.id, shopId, input.two_factor_required, {
      userId,
      ...getClientMeta(req),
    });
  }

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_system.settings.updated",
    entity: "branch_system_settings",
    entityId: String(branch.id),
    newValues: input,
    ...getClientMeta(req),
  });

  return getSystemSettings({ shopId, branchUuid });
}

export async function getDashboard({ shopId, branchUuid }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    totalToday,
    syncSummary,
    securityRules,
    securityEvents,
    settings,
    ownership,
  ] = await Promise.all([
    prisma.auditLog.count({
      where: { shopId: Number(shopId), branchId: branch.id, createdAt: { gte: todayStart } },
    }),
    getSyncSummary(shopId, branch.id),
    countSecurityRulesSummary(branch.id, shopId),
    countOpenEvents(branch.id, shopId),
    countSettingsSummary(branch.id, shopId),
    getOwnershipSummary(branch.id, shopId),
  ]);

  return toPublicSystemDashboard({
    branch,
    activity: {
      totalToday,
      failedToday: 0,
      criticalToday: securityEvents.criticalEvents,
    },
    sync: {
      connections: syncSummary.connectionCount,
      running: syncSummary.running,
      failed: syncSummary.failed,
      lastSuccessfulSyncAt: syncSummary.lastSyncAt,
    },
    security: {
      activeRules: securityRules.activeRules,
      disabledRules: securityRules.disabledRules,
      openEvents: securityEvents.openEvents,
      criticalEvents: securityEvents.criticalEvents,
    },
    settings: {
      branchOverrides: settings.branchOverrides,
      inheritedSettings: settings.inheritedSettings,
    },
    ownership,
  });
}

export async function getActivitySummary({ shopId, branchUuid }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [total, today] = await Promise.all([
    BranchSystemModel.countAuditLogs(branch.id, shopId),
    prisma.auditLog.count({
      where: { shopId: Number(shopId), branchId: branch.id, createdAt: { gte: todayStart } },
    }),
  ]);

  return {
    total,
    today,
    has_data: total > 0,
  };
}

export async function getSyncSummaryEndpoint({ shopId, branchUuid }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const summary = await getSyncSummary(shopId, branch.id);
  return { ...summary, has_data: summary.connectionCount > 0 };
}

export async function getSecuritySummary({ shopId, branchUuid }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const [rules, events] = await Promise.all([
    countSecurityRulesSummary(branch.id, shopId),
    countOpenEvents(branch.id, shopId),
  ]);
  return { ...rules, ...events, has_data: rules.activeRules > 0 || events.openEvents > 0 };
}

export async function getOwnershipSummaryEndpoint({ shopId, branchUuid }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const summary = await getOwnershipSummary(branch.id, shopId);
  return { ...summary, has_data: Boolean(summary.primaryOwner) };
}
