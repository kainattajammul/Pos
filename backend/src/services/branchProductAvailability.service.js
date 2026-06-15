import { prisma } from "../config/database.js";
import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { quantityAvailable } from "../utils/inventoryQuantities.js";
import { ensureBranch } from "./branchInventoryAllocation.service.js";
import { BranchInventoryModel } from "../models/branchInventory.model.js";

function evaluateDateRange(record, now = new Date()) {
  if (record.availableFrom && now < record.availableFrom) {
    return { blocked: true, reason: "Product is not yet available", code: "BEFORE_AVAILABLE_FROM" };
  }
  if (record.availableUntil && now > record.availableUntil) {
    return { blocked: true, reason: "Product availability has ended", code: "AFTER_AVAILABLE_UNTIL" };
  }
  return { blocked: false };
}

export async function getAvailability({ shopId, branchUuid, productUuid, variantUuid }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const product = await prisma.product.findFirst({
    where: { uuid: productUuid, shopId: Number(shopId) },
  });
  if (!product) throw new ApiError(HTTP.NOT_FOUND, "Product not found");

  let variant = null;
  if (variantUuid) {
    variant = await prisma.productVariant.findFirst({
      where: { uuid: variantUuid, productId: product.id },
    });
  }

  const record = await prisma.branchProductAvailability.findFirst({
    where: {
      branchId: branch.id,
      productId: product.id,
      productVariantId: variant?.id ?? null,
    },
  });

  const inventory = await BranchInventoryModel.findAllocation(branch.id, product.id, variant?.id ?? null);
  return evaluateAvailability(branch.id, product.id, variant?.id ?? null, record, inventory);
}

export async function evaluateAvailability(branchId, productId, productVariantId, record, inventory) {
  const availableQty = inventory ? quantityAvailable(inventory) : 0;
  const base = record ?? {
    status: "AVAILABLE",
    isVisible: true,
    isSellable: true,
    allowBackorder: false,
    allowClickAndCollect: false,
    allowDelivery: false,
    allowInStoreSale: true,
  };

  const rules = await prisma.branchProductAvailabilityRule.findMany({
    where: {
      branchId: Number(branchId),
      isEnabled: true,
      OR: [
        { productId: null, productVariantId: null },
        { productId: Number(productId), productVariantId: productVariantId ?? null },
      ],
    },
    orderBy: { priority: "asc" },
  });

  let status = base.status;
  let isVisible = base.isVisible;
  let isSellable = base.isSellable;
  let reasonCode = null;
  let reason = base.unavailableReason ?? null;

  const dateCheck = evaluateDateRange(base);
  if (dateCheck.blocked) {
    return {
      status: "temporarily_unavailable",
      is_visible: isVisible,
      is_sellable: false,
      reason_code: dateCheck.code,
      reason: dateCheck.reason,
    };
  }

  for (const rule of rules) {
    const applied = applyRule(rule, { availableQty, base });
    if (applied) {
      status = applied.status ?? status;
      isVisible = applied.isVisible ?? isVisible;
      isSellable = applied.isSellable ?? isSellable;
      reasonCode = applied.reasonCode ?? reasonCode;
      reason = applied.reason ?? reason;
    }
  }

  if (availableQty <= 0 && !base.allowBackorder) {
    isSellable = false;
    reasonCode = reasonCode ?? "OUT_OF_STOCK";
    reason = reason ?? "No available stock at this branch";
  }

  return {
    status: status.toLowerCase(),
    is_visible: isVisible,
    is_sellable: isSellable,
    allow_backorder: base.allowBackorder,
    reason_code: reasonCode,
    reason,
    quantity_available: availableQty,
  };
}

function applyRule(rule, { availableQty, base }) {
  const conditions = rule.conditions ?? {};
  const actions = rule.actions ?? {};

  if (rule.ruleType === "hide_when_zero" && availableQty <= 0) {
    return { isVisible: false, reasonCode: "ZERO_STOCK", reason: "Hidden when stock is zero" };
  }
  if (rule.ruleType === "backorder_when_zero" && availableQty <= 0) {
    return { isSellable: true, status: "BACKORDER", reasonCode: "BACKORDER", reason: "Available on backorder" };
  }
  if (rule.ruleType === "min_quantity_click_collect") {
    const min = conditions.min_quantity ?? 0;
    if (availableQty < min) {
      return { reasonCode: "BELOW_MIN_CNC", reason: "Below minimum for click and collect" };
    }
  }
  if (rule.ruleType === "min_safety_stock") {
    const min = conditions.safety_stock ?? 0;
    if (availableQty < min) {
      return {
        isSellable: actions.is_sellable ?? false,
        reasonCode: "BELOW_SAFETY_STOCK",
        reason: "Available stock is below the branch safety-stock level.",
      };
    }
  }
  if (actions.status) return { status: actions.status, reasonCode: rule.ruleType };
  return null;
}

export async function updateAvailability({ shopId, branchUuid, productUuid, variantUuid, input, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const product = await prisma.product.findFirst({
    where: { uuid: productUuid, shopId: Number(shopId) },
  });
  if (!product) throw new ApiError(HTTP.NOT_FOUND, "Product not found");

  let variantId = null;
  if (variantUuid) {
    const variant = await prisma.productVariant.findFirst({ where: { uuid: variantUuid, productId: product.id } });
    variantId = variant?.id ?? null;
  }

  const existing = await prisma.branchProductAvailability.findFirst({
    where: { branchId: branch.id, productId: product.id, productVariantId: variantId },
  });

  const data = {
    status: input.status?.toUpperCase() ?? "AVAILABLE",
    isVisible: input.is_visible ?? true,
    isSellable: input.is_sellable ?? true,
    allowBackorder: input.allow_backorder ?? false,
    allowClickAndCollect: input.allow_click_and_collect ?? false,
    allowDelivery: input.allow_delivery ?? false,
    allowInStoreSale: input.allow_in_store_sale ?? true,
    availableFrom: input.available_from ? new Date(input.available_from) : null,
    availableUntil: input.available_until ? new Date(input.available_until) : null,
    unavailableReason: input.unavailable_reason ?? null,
  };

  const record = existing
    ? await prisma.branchProductAvailability.update({ where: { id: existing.id }, data })
    : await prisma.branchProductAvailability.create({
        data: { shopId: Number(shopId), branchId: branch.id, productId: product.id, productVariantId: variantId, ...data },
      });

  const { writeAuditLog } = await import("./auditLog.service.js");
  const { getClientMeta } = await import("../utils/branchHelpers.js");
  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_inventory.product_availability.changed",
    entity: "branch_product_availability",
    entityId: record.uuid,
    newValues: input,
    ...getClientMeta(req),
  });

  const inventory = await BranchInventoryModel.findAllocation(branch.id, product.id, variantId);
  return evaluateAvailability(branch.id, product.id, variantId, record, inventory);
}

export async function listProductAvailability({ shopId, branchUuid, query }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const rows = await prisma.branchProductAvailability.findMany({
    where: { shopId: Number(shopId), branchId: branch.id },
    include: { product: true, productVariant: true },
    take: Math.min(100, Number(query.limit) || 50),
  });

  const data = [];
  for (const row of rows) {
    const inventory = await BranchInventoryModel.findAllocation(
      branch.id,
      row.productId,
      row.productVariantId,
    );
    data.push({
      id: row.uuid,
      product_id: row.product.uuid,
      product_name: row.product.name,
      ...(await evaluateAvailability(branch.id, row.productId, row.productVariantId, row, inventory)),
    });
  }
  return { data };
}

export async function listRules({ shopId, branchUuid }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const rules = await prisma.branchProductAvailabilityRule.findMany({
    where: { shopId: Number(shopId), branchId: branch.id },
    orderBy: { priority: "asc" },
  });
  return {
    data: rules.map((r) => ({
      id: r.uuid,
      rule_type: r.ruleType,
      priority: r.priority,
      conditions: r.conditions,
      actions: r.actions,
      is_enabled: r.isEnabled,
    })),
  };
}

export async function createRule({ shopId, branchUuid, input, userId }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const rule = await prisma.branchProductAvailabilityRule.create({
    data: {
      shopId: Number(shopId),
      branchId: branch.id,
      productId: input.product_id ? (await prisma.product.findFirst({ where: { uuid: input.product_id } }))?.id : null,
      ruleType: input.rule_type,
      priority: input.priority ?? 100,
      conditions: input.conditions ?? {},
      actions: input.actions ?? {},
      isEnabled: input.is_enabled ?? true,
      createdById: userId,
    },
  });
  return { id: rule.uuid };
}

export async function updateRule({ shopId, branchUuid, ruleUuid, input, userId }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const existing = await prisma.branchProductAvailabilityRule.findFirst({
    where: { uuid: ruleUuid, branchId: branch.id },
  });
  if (!existing) throw new ApiError(HTTP.NOT_FOUND, "Rule not found");

  const rule = await prisma.branchProductAvailabilityRule.update({
    where: { id: existing.id },
    data: {
      ruleType: input.rule_type ?? existing.ruleType,
      priority: input.priority ?? existing.priority,
      conditions: input.conditions ?? existing.conditions,
      actions: input.actions ?? existing.actions,
      isEnabled: input.is_enabled ?? existing.isEnabled,
      updatedById: userId,
    },
  });
  return { id: rule.uuid };
}

export async function deleteRule({ shopId, branchUuid, ruleUuid }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const existing = await prisma.branchProductAvailabilityRule.findFirst({
    where: { uuid: ruleUuid, branchId: branch.id },
  });
  if (!existing) throw new ApiError(HTTP.NOT_FOUND, "Rule not found");
  await prisma.branchProductAvailabilityRule.delete({ where: { id: existing.id } });
  return { deleted: true };
}
