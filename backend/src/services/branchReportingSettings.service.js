import { prisma } from "../config/database.js";
import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { BranchReportingModel } from "../models/branchReporting.model.js";
import { toPublicReportingSettings } from "../mappers/branchReporting.mapper.js";
import { writeAuditLog } from "./auditLog.service.js";
import { getClientMeta } from "../utils/branchHelpers.js";
import { toDecimal } from "../utils/inventoryDecimal.js";

export async function ensureBranch(shopId, branchUuid) {
  const branch = await BranchReportingModel.ensureBranch(shopId, branchUuid);
  if (!branch) throw new ApiError(HTTP.NOT_FOUND, "Branch not found");
  return branch;
}

export async function getReportingSettings({ shopId, branchUuid }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const settings = await BranchReportingModel.getReportingSettings(branch.id, shopId);
  return toPublicReportingSettings(settings);
}

export async function updateReportingSettings({ shopId, branchUuid, input, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  await BranchReportingModel.getReportingSettings(branch.id, shopId);

  const data = { updatedById: userId ?? null };
  if (input.sales_target_monthly != null) {
    data.salesTargetMonthly = toDecimal(input.sales_target_monthly);
  }
  if (input.repair_target_monthly != null) {
    data.repairTargetMonthly = Number(input.repair_target_monthly) || 0;
  }
  if (input.commission_rules != null) {
    data.commissionRules = String(input.commission_rules);
  }
  if (input.default_comparison_period != null) {
    data.defaultComparisonPeriod = String(input.default_comparison_period);
  }

  const updated = await prisma.branchReportingSettings.update({
    where: { branchId: branch.id },
    data,
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_reporting.settings.updated",
    entity: "branch_reporting_settings",
    entityId: String(branch.id),
    newValues: input,
    ...getClientMeta(req),
  });

  return toPublicReportingSettings(updated);
}

export async function touchLastReportGenerated(branchId, shopId) {
  await prisma.branchReportingSettings.updateMany({
    where: { branchId: Number(branchId), shopId: Number(shopId) },
    data: { lastReportGeneratedAt: new Date() },
  });
}
