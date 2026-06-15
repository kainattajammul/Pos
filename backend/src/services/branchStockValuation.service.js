import { prisma } from "../config/database.js";
import { quantityAvailable } from "../utils/inventoryQuantities.js";
import {
  decimalToString,
  multiplyDecimal,
  addDecimal,
  subtractDecimal,
} from "../utils/inventoryDecimal.js";
import { toApiValuationMethod } from "../mappers/branchInventory.mapper.js";
import { ensureBranch } from "./branchInventoryAllocation.service.js";
import { BranchInventorySettingsModel } from "../models/branchInventory.model.js";
import { writeAuditLog } from "./auditLog.service.js";
import { getClientMeta } from "../utils/branchHelpers.js";

function unitCostForMethod(inventory, method) {
  if (method === "LATEST_PURCHASE_COST") return inventory.latestPurchaseCost ?? inventory.averageCost;
  if (method === "STANDARD_COST") return inventory.product?.standardCost ?? inventory.averageCost;
  return inventory.averageCost ?? inventory.latestPurchaseCost ?? inventory.product?.standardCost;
}

export async function calculateBranchValuation({ shopId, branchUuid }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const settings = await BranchInventorySettingsModel.getOrCreate(branch.id, shopId);

  const inventories = await prisma.branchInventory.findMany({
    where: { shopId: Number(shopId), branchId: branch.id, archivedAt: null, isAllocated: true },
    include: { product: { include: { category: true } }, productVariant: true, reorderRule: true },
  });

  const method = settings.valuationMethod;
  let totalQuantity = 0;
  let availableQuantity = 0;
  let reservedQuantity = 0;
  let damagedQuantity = 0;
  let totalCostValue = null;
  let availableCostValue = null;
  let totalRetailValue = null;
  let lowStockCostValue = null;
  let damagedCostValue = null;

  const categoryMap = new Map();
  const productBreakdown = [];

  for (const inv of inventories) {
    const available = quantityAvailable(inv);
    const cost = unitCostForMethod(inv, method);
    const retail = inv.branchSellingPrice ?? inv.productVariant?.salePrice ?? inv.product?.salePrice;

    totalQuantity += inv.quantityOnHand;
    availableQuantity += available;
    reservedQuantity += inv.quantityReserved;
    damagedQuantity += inv.quantityDamaged;

    const itemCostValue = cost != null ? multiplyDecimal(cost, inv.quantityOnHand) : null;
    const itemAvailableCost = cost != null ? multiplyDecimal(cost, available) : null;
    const itemRetail = retail != null ? multiplyDecimal(retail, inv.quantityOnHand) : null;

    if (itemCostValue) totalCostValue = totalCostValue ? addDecimal(totalCostValue, itemCostValue) : itemCostValue;
    if (itemAvailableCost) {
      availableCostValue = availableCostValue ? addDecimal(availableCostValue, itemAvailableCost) : itemAvailableCost;
    }
    if (itemRetail) totalRetailValue = totalRetailValue ? addDecimal(totalRetailValue, itemRetail) : itemRetail;

    if (inv.reorderRule && available <= inv.reorderRule.reorderPoint && itemCostValue) {
      lowStockCostValue = lowStockCostValue ? addDecimal(lowStockCostValue, itemCostValue) : itemCostValue;
    }
    if (inv.quantityDamaged > 0 && cost != null) {
      const d = multiplyDecimal(cost, inv.quantityDamaged);
      damagedCostValue = damagedCostValue ? addDecimal(damagedCostValue, d) : d;
    }

    const catId = inv.product.categoryId ?? "uncategorized";
    const catName = inv.product.category?.name ?? "Uncategorized";
    const cat = categoryMap.get(catId) ?? { category_id: inv.product.category?.uuid ?? null, category_name: catName, quantity: 0, cost_value: null, retail_value: null };
    cat.quantity += inv.quantityOnHand;
    if (itemCostValue) cat.cost_value = cat.cost_value ? addDecimal(cat.cost_value, itemCostValue) : itemCostValue;
    if (itemRetail) cat.retail_value = cat.retail_value ? addDecimal(cat.retail_value, itemRetail) : itemRetail;
    categoryMap.set(catId, cat);

    productBreakdown.push({
      product_id: inv.product.uuid,
      product_name: inv.product.name,
      quantity: inv.quantityOnHand,
      available_quantity: available,
      cost_value: decimalToString(itemCostValue, 2),
      retail_value: decimalToString(itemRetail, 2),
    });
  }

  const potentialGrossMargin =
    totalCostValue && totalRetailValue ? subtractDecimal(totalRetailValue, totalCostValue) : null;

  return {
    success: true,
    data: {
      branch: { id: branch.uuid, name: branch.name },
      currency: settings.currency,
      valuation_method: toApiValuationMethod(method),
      summary: {
        total_products: inventories.length,
        total_quantity: totalQuantity,
        available_quantity: availableQuantity,
        reserved_quantity: reservedQuantity,
        damaged_quantity: damagedQuantity,
        total_cost_value: decimalToString(totalCostValue, 2),
        available_cost_value: decimalToString(availableCostValue, 2),
        total_retail_value: decimalToString(totalRetailValue, 2),
        potential_gross_margin: decimalToString(potentialGrossMargin, 2),
        low_stock_cost_value: decimalToString(lowStockCostValue, 2),
        damaged_stock_value: decimalToString(damagedCostValue, 2),
      },
      category_breakdown: [...categoryMap.values()].map((c) => ({
        category_id: c.category_id,
        category_name: c.category_name,
        quantity: c.quantity,
        cost_value: decimalToString(c.cost_value, 2),
        retail_value: decimalToString(c.retail_value, 2),
      })),
      product_breakdown: productBreakdown,
      calculated_at: new Date().toISOString(),
    },
  };
}

export async function createValuationSnapshot({ shopId, branchUuid, userId, req }) {
  const valuation = await calculateBranchValuation({ shopId, branchUuid });
  const branch = await ensureBranch(shopId, branchUuid);
  const settings = await BranchInventorySettingsModel.getOrCreate(branch.id, shopId);
  const summary = valuation.data.summary;

  const snapshot = await prisma.branchStockValuationSnapshot.create({
    data: {
      shopId: Number(shopId),
      branchId: branch.id,
      valuationDate: new Date(),
      valuationMethod: settings.valuationMethod,
      currency: settings.currency,
      totalQuantity: summary.total_quantity,
      availableQuantity: summary.available_quantity,
      reservedQuantity: summary.reserved_quantity,
      damagedQuantity: summary.damaged_quantity,
      totalCostValue: summary.total_cost_value ?? "0",
      availableCostValue: summary.available_cost_value ?? "0",
      totalRetailValue: summary.total_retail_value ?? "0",
      potentialMargin: summary.potential_gross_margin ?? "0",
      breakdown: {
        category_breakdown: valuation.data.category_breakdown,
        product_breakdown: valuation.data.product_breakdown,
      },
    },
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_inventory.valuation.snapshot",
    entity: "branch_stock_valuation_snapshot",
    entityId: snapshot.uuid,
    ...getClientMeta(req),
  });

  return { id: snapshot.uuid, valuation_date: snapshot.valuationDate.toISOString() };
}

export async function valuationHistory({ shopId, branchUuid, query }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const rows = await prisma.branchStockValuationSnapshot.findMany({
    where: { branchId: branch.id },
    orderBy: { valuationDate: "desc" },
    take: Math.min(100, Number(query.limit) || 30),
  });

  return {
    data: rows.map((r) => ({
      id: r.uuid,
      valuation_date: r.valuationDate.toISOString(),
      valuation_method: toApiValuationMethod(r.valuationMethod),
      total_cost_value: decimalToString(r.totalCostValue, 2),
      total_retail_value: decimalToString(r.totalRetailValue, 2),
      potential_margin: decimalToString(r.potentialMargin, 2),
    })),
  };
}
