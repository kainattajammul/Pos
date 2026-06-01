import { prisma } from "../config/database.js";
import { ShopModel } from "../models/shop.model.js";
import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";

async function ensureShopExists(shopId) {
  const shop = await ShopModel.findById(shopId);
  if (!shop) {
    throw new ApiError(HTTP.NOT_FOUND, "Shop not found");
  }
  return shop;
}

function normalizeSearchQuery(query) {
  return String(query ?? "")
    .trim()
    .replace(/\s+/g, " ");
}

function deviceMatchesQuery(device, normalizedQuery) {
  const q = normalizedQuery.toLowerCase();
  const haystack = [
    device.name,
    device.slug,
    device.repairManufacturer?.name,
    device.repairCategory?.name,
    ...device.issues.map((issue) => issue.name),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

function filterIssuesForQuery(issues, normalizedQuery) {
  const q = normalizedQuery.toLowerCase();
  const issueKeywordMatch = issues.some((issue) => issue.name.toLowerCase().includes(q));
  if (!issueKeywordMatch) return issues;
  return issues.filter((issue) => issue.name.toLowerCase().includes(q));
}

export async function searchRepairs(shopId, query) {
  await ensureShopExists(shopId);

  const normalizedQuery = normalizeSearchQuery(query);
  if (!normalizedQuery) {
    return [];
  }

  const devices = await prisma.repairDevice.findMany({
    where: { shopId: Number(shopId) },
    include: {
      repairCategory: { select: { slug: true, name: true } },
      repairManufacturer: { select: { slug: true, name: true } },
      issues: {
        where: { price: { gt: 0 } },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  const groups = [];
  for (const device of devices) {
    if (!deviceMatchesQuery(device, normalizedQuery)) continue;

    const repairs = filterIssuesForQuery(device.issues, normalizedQuery).map((issue) => ({
      repair_type_id: issue.id,
      repair_name: issue.name,
      price: Number(issue.price).toFixed(2),
      catalog_key: issue.slug,
    }));

    if (repairs.length === 0) continue;

    groups.push({
      device_id: device.id,
      device_name: device.name,
      device_catalog_key: device.slug,
      category_slug: device.repairCategory.slug,
      category_name: device.repairCategory.name,
      manufacturer_slug: device.repairManufacturer.slug,
      manufacturer_name: device.repairManufacturer.name,
      repairs,
    });
  }

  return groups;
}

export async function getRepairBookingContext(deviceId, repairTypeId, shopId = 1) {
  await ensureShopExists(shopId);

  const device = await prisma.repairDevice.findFirst({
    where: {
      id: Number(deviceId),
      shopId: Number(shopId),
    },
    include: {
      repairCategory: { select: { slug: true, name: true } },
      repairManufacturer: { select: { slug: true, name: true } },
      issues: {
        where: {
          id: Number(repairTypeId),
          price: { gt: 0 },
        },
      },
    },
  });

  if (!device || device.issues.length === 0) {
    throw new ApiError(HTTP.NOT_FOUND, "Repair booking context not found");
  }

  const issue = device.issues[0];

  return {
    device_id: device.id,
    device_name: device.name,
    device_catalog_key: device.slug,
    category_slug: device.repairCategory.slug,
    manufacturer_slug: device.repairManufacturer.slug,
    repair_type_id: issue.id,
    repair_name: issue.name,
    catalog_key: issue.slug,
    price: Number(issue.price).toFixed(2),
  };
}
