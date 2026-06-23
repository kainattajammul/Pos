import { Prisma } from "@prisma/client";
import { prisma } from "../config/database.js";
import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { BranchFinanceModel } from "../models/branchFinance.model.js";
import { toPublicTaxProfile } from "../mappers/branchFinance.mapper.js";
import { ensureBranch } from "./branchFinanceSettings.service.js";
import { writeAuditLog } from "./auditLog.service.js";
import { getClientMeta } from "../utils/branchHelpers.js";
import { toDecimal } from "../utils/inventoryDecimal.js";

export async function getTaxProfile({ shopId, branchUuid }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const profile = await BranchFinanceModel.getTaxProfile(branch.id, shopId);
  return toPublicTaxProfile(profile);
}

export async function updateTaxProfile({ shopId, branchUuid, input, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  await BranchFinanceModel.getTaxProfile(branch.id, shopId);

  const data = {};
  if (input.tax_enabled != null) data.taxEnabled = Boolean(input.tax_enabled);
  if (input.tax_type != null) data.taxType = String(input.tax_type).toUpperCase();
  if (input.registration_name !== undefined) data.registrationName = input.registration_name;
  if (input.vat_number !== undefined) data.vatNumber = input.vat_number;
  if (input.registration_number !== undefined) data.registrationNumber = input.registration_number;
  if (input.default_tax_rate != null) data.defaultTaxRate = toDecimal(input.default_tax_rate);
  if (input.prices_include_tax != null) data.pricesIncludeTax = Boolean(input.prices_include_tax);
  if (input.tax_label != null) data.taxLabel = input.tax_label;
  if (input.rounding_method != null) data.roundingMethod = String(input.rounding_method).toUpperCase();
  if (input.country !== undefined) data.country = input.country;
  if (input.tax_region !== undefined) data.taxRegion = input.tax_region;

  const updated = await prisma.branchTaxProfile.update({
    where: { branchId: branch.id },
    data,
  });

  if (input.default_tax_rate != null || input.tax_label != null) {
    await prisma.branchFinanceSettings.update({
      where: { branchId: branch.id },
      data: {
        vatRate: updated.defaultTaxRate,
        vatRateLabel: `${updated.defaultTaxRate}%`,
      },
    });
  }

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_tax.profile.updated",
    entity: "branch_tax_profile",
    entityId: String(branch.id),
    newValues: input,
    ...getClientMeta(req),
  });

  return toPublicTaxProfile(updated);
}

export async function listTaxRates({ shopId, branchUuid }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const rows = await prisma.branchTaxRate.findMany({
    where: { branchId: branch.id, shopId: Number(shopId), isActive: true },
    orderBy: { name: "asc" },
  });
  return rows.map((r) => ({
    id: r.uuid,
    name: r.name,
    rate: r.rate.toFixed(2),
    applies_to: r.appliesTo,
    is_zero_rated: r.isZeroRated,
    is_exempt: r.isExempt,
  }));
}

export async function createTaxRate({ shopId, branchUuid, input, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const rate = await prisma.branchTaxRate.create({
    data: {
      shopId: Number(shopId),
      branchId: branch.id,
      name: input.name,
      rate: toDecimal(input.rate),
      appliesTo: input.applies_to,
      isZeroRated: Boolean(input.is_zero_rated),
      isExempt: Boolean(input.is_exempt),
    },
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_tax.rate.created",
    entity: "branch_tax_rate",
    entityId: rate.uuid,
    newValues: input,
    ...getClientMeta(req),
  });

  return { id: rate.uuid, name: rate.name, rate: rate.rate.toFixed(2) };
}
