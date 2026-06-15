import { Prisma } from "@prisma/client";
import { prisma } from "../config/database.js";
import { ensureBranch } from "./branchOperationsSettings.service.js";
import { decimalToString } from "../utils/inventoryDecimal.js";

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export async function getSalesSummary({ shopId, branchUuid, query }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const from = query.from ? new Date(query.from) : startOfDay(new Date());
  const to = query.to ? new Date(query.to) : endOfDay(new Date());

  const where = {
    shopId: Number(shopId),
    branchId: branch.id,
    status: "COMPLETED",
    completedAt: { gte: from, lte: to },
  };

  const [agg, count, byChannel, topProducts] = await Promise.all([
    prisma.branchSale.aggregate({
      where,
      _sum: { subtotal: true, taxTotal: true, discountTotal: true, total: true, costTotal: true },
      _avg: { total: true },
    }),
    prisma.branchSale.count({ where }),
    prisma.branchSale.groupBy({
      by: ["channel"],
      where,
      _sum: { total: true },
      _count: true,
    }),
    prisma.branchSaleLineItem.groupBy({
      by: ["name"],
      where: { sale: where },
      _sum: { quantity: true, lineTotal: true },
      orderBy: { _sum: { lineTotal: "desc" } },
      take: 5,
    }),
  ]);

  const grossProfit = agg._sum.total && agg._sum.costTotal
    ? new Prisma.Decimal(agg._sum.total).sub(agg._sum.costTotal)
    : new Prisma.Decimal(0);

  return {
    period: { from: from.toISOString(), to: to.toISOString() },
    sales_count: count,
    subtotal: decimalToString(agg._sum.subtotal, 2) ?? "0.00",
    tax_total: decimalToString(agg._sum.taxTotal, 2) ?? "0.00",
    discount_total: decimalToString(agg._sum.discountTotal, 2) ?? "0.00",
    total_revenue: decimalToString(agg._sum.total, 2) ?? "0.00",
    total_cost: decimalToString(agg._sum.costTotal, 2) ?? "0.00",
    gross_profit: decimalToString(grossProfit, 2),
    average_sale_value: decimalToString(agg._avg.total, 2) ?? "0.00",
    by_channel: byChannel.map((c) => ({
      channel: c.channel.toLowerCase(),
      count: c._count,
      total: decimalToString(c._sum.total, 2) ?? "0.00",
    })),
    top_products: topProducts.map((p) => ({
      name: p.name,
      quantity_sold: p._sum.quantity ?? 0,
      revenue: decimalToString(p._sum.lineTotal, 2) ?? "0.00",
    })),
  };
}

export async function getTodaySalesSummary({ shopId, branchUuid }) {
  return getSalesSummary({
    shopId,
    branchUuid,
    query: { from: startOfDay(new Date()).toISOString(), to: endOfDay(new Date()).toISOString() },
  });
}
