import { prisma } from "../config/database.js";
import { BranchFinanceModel } from "../models/branchFinance.model.js";
import { ensureBranch } from "./branchReportingSettings.service.js";
import { parsePagination, paginationMeta } from "../utils/financeHelpers.js";
import { money, noDataWarning, reportMeta, resolveReportPeriod } from "../utils/reportHelpers.js";
import { calculateBranchValuation } from "./branchStockValuation.service.js";
import { quantityAvailable } from "../utils/inventoryQuantities.js";
import { touchLastReportGenerated } from "./branchReportingSettings.service.js";

export async function getInventoryReport({ shopId, branchUuid, query, includeValuation = true }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const financeSettings = await BranchFinanceModel.getFinanceSettings(branch.id, shopId);
  const period = resolveReportPeriod(query, financeSettings.timezone);
  const { page, limit, skip } = parsePagination(query);

  const valuation = includeValuation ? await calculateBranchValuation({ shopId, branchUuid }) : null;
  const valuationData = valuation?.data ?? null;

  const movementWhere = {
    shopId: Number(shopId),
    branchId: branch.id,
    createdAt: { gte: period.start, lte: period.end },
  };

  const [movements, movementTotal, inventories] = await Promise.all([
    prisma.branchStockMovement.findMany({
      where: movementWhere,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        branchInventory: {
          include: { product: { select: { name: true, sku: true } } },
        },
      },
    }),
    prisma.branchStockMovement.count({ where: movementWhere }),
    prisma.branchInventory.findMany({
      where: { shopId: Number(shopId), branchId: branch.id, archivedAt: null, isAllocated: true },
      include: { product: { include: { category: true } }, reorderRule: true },
    }),
  ]);

  let lowStock = 0;
  let outOfStock = 0;
  let totalPhysical = 0;
  let totalAvailable = 0;

  for (const inv of inventories) {
    const available = quantityAvailable(inv);
    totalPhysical += inv.quantityOnHand;
    totalAvailable += available;
    if (available <= 0) outOfStock += 1;
    else if (inv.reorderRule && available <= inv.reorderRule.reorderPoint) lowStock += 1;
  }

  const hasData = inventories.length > 0 || movementTotal > 0;
  const summary = {
    totalAllocatedProducts: inventories.length,
    totalPhysicalQuantity: totalPhysical,
    totalAvailableQuantity: totalAvailable,
    lowStockProductCount: lowStock,
    outOfStockProductCount: outOfStock,
    stockMovementCount: movementTotal,
    totalStockCostValue: valuationData?.summary?.total_cost_value ?? "0.00",
    totalAvailableStockValue: valuationData?.summary?.available_cost_value ?? "0.00",
    totalRetailValue: valuationData?.summary?.total_retail_value ?? "0.00",
    potentialGrossMargin: valuationData?.summary?.potential_gross_margin ?? null,
  };

  await touchLastReportGenerated(branch.id, shopId);

  return {
    hasData,
    summary,
    chart: {
      code: "INVENTORY_BY_CATEGORY",
      labels: (valuationData?.category_breakdown ?? []).map((c) => c.category_name),
      series: [
        { name: "Cost value", data: (valuationData?.category_breakdown ?? []).map((c) => c.cost_value ?? "0.00") },
      ],
      currency: financeSettings.currency,
      hasData: (valuationData?.category_breakdown ?? []).length > 0,
    },
    records: movements.map((m) => ({
      id: m.uuid,
      movement_type: m.movementType.toLowerCase(),
      product: m.branchInventory?.product?.name ?? null,
      sku: m.branchInventory?.product?.sku ?? null,
      quantity_before: m.quantityBefore,
      quantity: m.quantity,
      quantity_after: m.quantityAfter,
      unit_cost: m.unitCost != null ? money(m.unitCost) : null,
      total_cost: m.totalCost != null ? money(m.totalCost) : null,
      reference_type: m.referenceType,
      reference_id: m.referenceId,
      created_at: m.createdAt.toISOString(),
    })),
    meta: reportMeta(period, financeSettings.currency, paginationMeta(page, limit, movementTotal)),
    warnings: hasData ? [] : noDataWarning(),
  };
}

export async function getInventoryValuation({ shopId, branchUuid }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const financeSettings = await BranchFinanceModel.getFinanceSettings(branch.id, shopId);
  const valuation = await calculateBranchValuation({ shopId, branchUuid });
  const data = valuation.data;
  return {
    hasData: (data?.product_breakdown?.length ?? 0) > 0,
    summary: data.summary,
    by_category: data.category_breakdown,
    products: data.product_breakdown,
    meta: { currency: financeSettings.currency, calculatedAt: new Date().toISOString() },
    warnings: (data?.product_breakdown?.length ?? 0) === 0 ? noDataWarning() : [],
  };
}

export async function getInventoryMovements(ctx) {
  const report = await getInventoryReport({ ...ctx, includeValuation: false });
  return {
    hasData: report.hasData,
    records: report.records,
    meta: report.meta,
    warnings: report.warnings,
  };
}

export async function getInventorySummary(ctx) {
  const report = await getInventoryReport(ctx);
  return { hasData: report.hasData, summary: report.summary, meta: report.meta, warnings: report.warnings };
}

export async function getInventoryByCategory({ shopId, branchUuid }) {
  const result = await getInventoryValuation({ shopId, branchUuid });
  return {
    hasData: result.hasData,
    records: result.by_category ?? [],
    meta: result.meta,
    warnings: result.warnings,
  };
}

export async function getLowStockReport({ shopId, branchUuid, query }) {
  const result = await getInventoryReport({ shopId, branchUuid, query });
  const branch = await ensureBranch(shopId, branchUuid);
  const inventories = await prisma.branchInventory.findMany({
    where: { shopId: Number(shopId), branchId: branch.id, archivedAt: null, isAllocated: true },
    include: { product: true, reorderRule: true },
  });

  const lowStockItems = inventories
    .filter((inv) => {
      const available = quantityAvailable(inv);
      return inv.reorderRule && available <= inv.reorderRule.reorderPoint;
    })
    .map((inv) => ({
      product: inv.product.name,
      sku: inv.product.sku,
      available: quantityAvailable(inv),
      reorder_point: inv.reorderRule.reorderPoint,
    }));

  return {
    hasData: lowStockItems.length > 0,
    records: lowStockItems,
    meta: result.meta,
    warnings: lowStockItems.length === 0 ? noDataWarning() : [],
  };
}
