import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { RepairCategoryModel } from "../models/repairCategory.model.js";
import { RepairManufacturerModel } from "../models/repairManufacturer.model.js";
import { RepairDeviceModel } from "../models/repairDevice.model.js";
import { RepairDeviceIssueModel } from "../models/repairDeviceIssue.model.js";
import { ShopModel } from "../models/shop.model.js";
import { slugify } from "../utils/slugify.js";
import {
  DEFAULT_REPAIR_DEVICE_ISSUES,
  REPAIR_DEVICE_ISSUE_ICON_KEYS,
  searchRepairDeviceIssueIcons,
} from "../data/defaultRepairDeviceIssues.js";

async function ensureShopExists(shopId) {
  const shop = await ShopModel.findById(shopId);
  if (!shop) {
    throw new ApiError(HTTP.NOT_FOUND, "Shop not found");
  }
  return shop;
}

async function ensureDeviceContext(shopId, repairCategoryId, repairManufacturerId, repairDeviceId) {
  const [category, manufacturer, device] = await Promise.all([
    RepairCategoryModel.findById(repairCategoryId),
    RepairManufacturerModel.findById(repairManufacturerId),
    RepairDeviceModel.findById(repairDeviceId),
  ]);

  if (!category || category.shopId !== Number(shopId)) {
    throw new ApiError(HTTP.NOT_FOUND, "Repair category not found for this shop");
  }
  if (
    !manufacturer ||
    manufacturer.shopId !== Number(shopId) ||
    manufacturer.repairCategoryId !== Number(repairCategoryId)
  ) {
    throw new ApiError(HTTP.NOT_FOUND, "Repair manufacturer not found for this category");
  }
  if (
    !device ||
    device.shopId !== Number(shopId) ||
    device.repairCategoryId !== Number(repairCategoryId) ||
    device.repairManufacturerId !== Number(repairManufacturerId)
  ) {
    throw new ApiError(HTTP.NOT_FOUND, "Repair device not found for this manufacturer");
  }

  return { category, manufacturer, device };
}

async function seedDefaultIssuesIfEmpty(
  shopId,
  repairCategoryId,
  repairManufacturerId,
  repairDeviceId,
) {
  const count = await RepairDeviceIssueModel.countByDevice(shopId, repairDeviceId);
  if (count > 0) return;

  await RepairDeviceIssueModel.createMany(
    DEFAULT_REPAIR_DEVICE_ISSUES.map((item) => ({
      shopId: Number(shopId),
      repairCategoryId: Number(repairCategoryId),
      repairManufacturerId: Number(repairManufacturerId),
      repairDeviceId: Number(repairDeviceId),
      name: item.name,
      slug: item.slug,
      price: item.price,
      iconKey: item.iconKey,
      sortOrder: item.sortOrder,
      isDefault: true,
    })),
  );
}

export async function listRepairDeviceIssues(
  shopId,
  repairCategoryId,
  repairManufacturerId,
  repairDeviceId,
) {
  await ensureShopExists(shopId);
  await ensureDeviceContext(shopId, repairCategoryId, repairManufacturerId, repairDeviceId);
  await seedDefaultIssuesIfEmpty(
    shopId,
    repairCategoryId,
    repairManufacturerId,
    repairDeviceId,
  );
  return RepairDeviceIssueModel.findByDevice(shopId, repairDeviceId);
}

export function searchIcons(query, limit) {
  return searchRepairDeviceIssueIcons(query, limit);
}

export async function createRepairDeviceIssue({
  shopId,
  repairCategoryId,
  repairManufacturerId,
  repairDeviceId,
  name,
  price,
  iconKey,
  imageUrl,
  sortOrder,
}) {
  await ensureShopExists(shopId);
  await ensureDeviceContext(shopId, repairCategoryId, repairManufacturerId, repairDeviceId);

  const trimmedName = String(name).trim();
  const slug = slugify(trimmedName);
  const resolvedIcon = iconKey ?? "diagnostic";

  if (!REPAIR_DEVICE_ISSUE_ICON_KEYS.includes(resolvedIcon)) {
    throw new ApiError(HTTP.BAD_REQUEST, "Invalid icon key");
  }

  const parsedPrice = Number(price);
  if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
    throw new ApiError(HTTP.BAD_REQUEST, "Price must be a non-negative number");
  }

  const existingName = await RepairDeviceIssueModel.findByDeviceAndName(
    shopId,
    repairDeviceId,
    trimmedName,
  );
  if (existingName) {
    throw new ApiError(HTTP.CONFLICT, "A device issue with this name already exists");
  }

  const existingSlug = await RepairDeviceIssueModel.findByDeviceAndSlug(
    shopId,
    repairDeviceId,
    slug,
  );
  if (existingSlug) {
    throw new ApiError(HTTP.CONFLICT, "A device issue with a similar name already exists");
  }

  const existing = await RepairDeviceIssueModel.findByDevice(shopId, repairDeviceId);
  const resolvedSortOrder = sortOrder ?? existing.length;

  return RepairDeviceIssueModel.create({
    shopId: Number(shopId),
    repairCategoryId: Number(repairCategoryId),
    repairManufacturerId: Number(repairManufacturerId),
    repairDeviceId: Number(repairDeviceId),
    name: trimmedName,
    slug,
    price: parsedPrice,
    iconKey: resolvedIcon,
    imageUrl: imageUrl ?? null,
    sortOrder: resolvedSortOrder,
    isDefault: false,
  });
}

export async function updateRepairDeviceIssue(id, payload) {
  const issue = await RepairDeviceIssueModel.findById(id);
  if (!issue) {
    throw new ApiError(HTTP.NOT_FOUND, "Repair device issue not found");
  }

  const data = {};

  if (payload.name !== undefined) {
    const trimmedName = String(payload.name).trim();
    const existingName = await RepairDeviceIssueModel.findByDeviceAndName(
      issue.shopId,
      issue.repairDeviceId,
      trimmedName,
      issue.id,
    );
    if (existingName) {
      throw new ApiError(HTTP.CONFLICT, "A device issue with this name already exists");
    }
    data.name = trimmedName;
    data.slug = slugify(trimmedName);
  }

  if (payload.price !== undefined) {
    const parsedPrice = Number(payload.price);
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      throw new ApiError(HTTP.BAD_REQUEST, "Price must be a non-negative number");
    }
    data.price = parsedPrice;
  }

  if (payload.iconKey !== undefined) {
    if (!REPAIR_DEVICE_ISSUE_ICON_KEYS.includes(payload.iconKey)) {
      throw new ApiError(HTTP.BAD_REQUEST, "Invalid icon key");
    }
    data.iconKey = payload.iconKey;
  }

  if (payload.imageUrl !== undefined) {
    data.imageUrl = payload.imageUrl;
  }

  if (payload.sortOrder !== undefined) {
    data.sortOrder = payload.sortOrder;
  }

  if (data.slug) {
    const existingSlug = await RepairDeviceIssueModel.findByDeviceAndSlug(
      issue.shopId,
      issue.repairDeviceId,
      data.slug,
      issue.id,
    );
    if (existingSlug) {
      throw new ApiError(HTTP.CONFLICT, "A device issue with a similar name already exists");
    }
  }

  return RepairDeviceIssueModel.update(id, data);
}

export async function deleteRepairDeviceIssue(id) {
  const issue = await RepairDeviceIssueModel.findById(id);
  if (!issue) {
    throw new ApiError(HTTP.NOT_FOUND, "Repair device issue not found");
  }
  await RepairDeviceIssueModel.delete(id);
}
