import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { RepairCategoryModel } from "../models/repairCategory.model.js";
import { RepairManufacturerModel } from "../models/repairManufacturer.model.js";
import { ShopModel } from "../models/shop.model.js";
import { slugify } from "../utils/slugify.js";
import { searchRepairManufacturerBrands } from "../data/repairManufacturerBrands.js";
import { DEFAULT_REPAIR_MANUFACTURERS } from "../data/defaultRepairManufacturers.js";
import { deleteStoredImageIfReplaced } from "./storage/deleteImage.js";
import { purgeRepairManufacturerImages } from "./storage/repairImageCleanup.js";

async function ensureShopExists(shopId) {
  const shop = await ShopModel.findById(shopId);
  if (!shop) {
    throw new ApiError(HTTP.NOT_FOUND, "Shop not found");
  }
  return shop;
}

async function ensureCategoryExists(shopId, repairCategoryId) {
  const category = await RepairCategoryModel.findById(repairCategoryId);
  if (!category || category.shopId !== Number(shopId)) {
    throw new ApiError(HTTP.NOT_FOUND, "Repair category not found for this shop");
  }
  return category;
}

async function seedDefaultManufacturersIfEmpty(shopId, repairCategoryId) {
  const count = await RepairManufacturerModel.countByCategory(shopId, repairCategoryId);
  if (count > 0) return;

  await RepairManufacturerModel.createMany(
    DEFAULT_REPAIR_MANUFACTURERS.map((item) => ({
      shopId: Number(shopId),
      repairCategoryId: Number(repairCategoryId),
      ...item,
    })),
  );
}

export async function listRepairManufacturers(shopId, repairCategoryId) {
  await Promise.all([
    ensureShopExists(shopId),
    ensureCategoryExists(shopId, repairCategoryId),
  ]);
  await seedDefaultManufacturersIfEmpty(shopId, repairCategoryId);
  return RepairManufacturerModel.findByCategory(shopId, repairCategoryId);
}

export function searchIcons(query, limit) {
  return searchRepairManufacturerBrands(query, limit);
}

export async function createRepairManufacturer({
  shopId,
  repairCategoryId,
  name,
  iconKey,
  imageUrl,
  logoSlug,
  sortOrder,
}) {
  const trimmedName = String(name).trim();

  if (trimmedName.length < 2) {
    throw new ApiError(HTTP.BAD_REQUEST, "Manufacturer name must be at least 2 characters");
  }

  await ensureShopExists(shopId);
  await ensureCategoryExists(shopId, repairCategoryId);

  const slug = slugify(trimmedName);
  if (!slug) {
    throw new ApiError(HTTP.BAD_REQUEST, "Manufacturer name must contain letters or numbers");
  }

  const duplicateSlug = await RepairManufacturerModel.findByCategoryAndSlug(
    shopId,
    repairCategoryId,
    slug,
  );
  if (duplicateSlug) {
    throw new ApiError(HTTP.CONFLICT, "A manufacturer with a similar name already exists");
  }

  const duplicateName = await RepairManufacturerModel.findByCategoryAndName(
    shopId,
    repairCategoryId,
    trimmedName,
  );
  if (duplicateName) {
    throw new ApiError(HTTP.CONFLICT, "A manufacturer with this name already exists");
  }

  const normalizedLogoSlug = imageUrl?.trim()
    ? logoSlug?.trim() || slug
    : logoSlug?.trim() || slug;
  const normalizedIconKey =
    String(iconKey ?? normalizedLogoSlug).trim().toLowerCase() || normalizedLogoSlug;

  const existing = await RepairManufacturerModel.findByCategory(shopId, repairCategoryId);
  const nextSort =
    sortOrder != null
      ? Number(sortOrder)
      : existing.length > 0
        ? Math.max(...existing.map((m) => m.sortOrder)) + 1
        : 0;

  return RepairManufacturerModel.create({
    shopId: Number(shopId),
    repairCategoryId: Number(repairCategoryId),
    name: trimmedName,
    slug,
    iconKey: normalizedIconKey,
    imageUrl: imageUrl?.trim() || null,
    logoSlug: normalizedLogoSlug,
    sortOrder: nextSort,
    isDefault: false,
  });
}

export async function updateRepairManufacturer(
  id,
  { name, iconKey, imageUrl, logoSlug, sortOrder },
) {
  const manufacturer = await RepairManufacturerModel.findById(id);
  if (!manufacturer) {
    throw new ApiError(HTTP.NOT_FOUND, "Repair manufacturer not found");
  }

  const data = {};

  if (name !== undefined) {
    const trimmedName = String(name).trim();
    if (trimmedName.length < 2) {
      throw new ApiError(HTTP.BAD_REQUEST, "Manufacturer name must be at least 2 characters");
    }
    const slug = slugify(trimmedName);
    const duplicateSlug = await RepairManufacturerModel.findByCategoryAndSlug(
      manufacturer.shopId,
      manufacturer.repairCategoryId,
      slug,
      id,
    );
    if (duplicateSlug) {
      throw new ApiError(HTTP.CONFLICT, "A manufacturer with a similar name already exists");
    }
    const duplicateName = await RepairManufacturerModel.findByCategoryAndName(
      manufacturer.shopId,
      manufacturer.repairCategoryId,
      trimmedName,
      id,
    );
    if (duplicateName) {
      throw new ApiError(HTTP.CONFLICT, "A manufacturer with this name already exists");
    }
    data.name = trimmedName;
    data.slug = slug;
    if (logoSlug === undefined) {
      data.logoSlug = slug;
    }
  }

  if (iconKey !== undefined) {
    data.iconKey = String(iconKey).trim().toLowerCase() || "smartphone";
  }

  if (imageUrl !== undefined) {
    const nextImageUrl = imageUrl?.trim() || null;
    await deleteStoredImageIfReplaced(manufacturer.imageUrl, nextImageUrl);
    data.imageUrl = nextImageUrl;
  }

  if (logoSlug !== undefined) {
    data.logoSlug = logoSlug?.trim() || manufacturer.slug;
  }

  if (sortOrder !== undefined) {
    data.sortOrder = Number(sortOrder);
  }

  if (Object.keys(data).length === 0) {
    throw new ApiError(HTTP.BAD_REQUEST, "At least one field is required to update");
  }

  return RepairManufacturerModel.update(id, data);
}

export async function deleteRepairManufacturer(id) {
  const manufacturer = await RepairManufacturerModel.findById(id);
  if (!manufacturer) {
    throw new ApiError(HTTP.NOT_FOUND, "Repair manufacturer not found");
  }

  await purgeRepairManufacturerImages(id);
  await RepairManufacturerModel.delete(id);
}
