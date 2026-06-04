import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { RepairCategoryModel } from "../models/repairCategory.model.js";
import { ShopModel } from "../models/shop.model.js";
import { slugify } from "../utils/slugify.js";
import { searchRepairCategoryIcons } from "../data/repairCategoryIcons.js";
import { deleteStoredImageIfReplaced } from "./storage/deleteImage.js";
import { purgeRepairCategoryImages } from "./storage/repairImageCleanup.js";

const DEFAULT_CATEGORIES = [
  { name: "Mobile Repair", slug: "mobile", iconKey: "smartphone", sortOrder: 1, isDefault: true },
  { name: "Tablet Repair", slug: "tablet", iconKey: "tablet", sortOrder: 2, isDefault: true },
  { name: "Computer Repair", slug: "computer", iconKey: "laptop", sortOrder: 3, isDefault: true },
  { name: "Drone Repair", slug: "drone", iconKey: "radio", sortOrder: 4, isDefault: true },
  { name: "Jewelry Repair", slug: "jewelry", iconKey: "gem", sortOrder: 5, isDefault: true },
];

async function ensureShopExists(shopId) {
  const shop = await ShopModel.findById(shopId);
  if (!shop) {
    throw new ApiError(HTTP.NOT_FOUND, "Shop not found");
  }
  return shop;
}

async function seedDefaultCategoriesIfEmpty(shopId) {
  const count = await RepairCategoryModel.countByShop(shopId);
  if (count > 0) return;

  await RepairCategoryModel.createMany(
    DEFAULT_CATEGORIES.map((item) => ({
      shopId: Number(shopId),
      ...item,
    })),
  );
}

export async function listRepairCategories(shopId) {
  await ensureShopExists(shopId);
  await seedDefaultCategoriesIfEmpty(shopId);
  return RepairCategoryModel.findByShop(shopId);
}

export function searchIcons(query, limit) {
  return searchRepairCategoryIcons(query, limit);
}

export async function createRepairCategory({
  shopId,
  name,
  iconKey,
  imageUrl,
  sortOrder,
}) {
  const trimmedName = String(name).trim();

  if (trimmedName.length < 2) {
    throw new ApiError(HTTP.BAD_REQUEST, "Category name must be at least 2 characters");
  }

  await ensureShopExists(shopId);

  const slug = slugify(trimmedName);
  if (!slug) {
    throw new ApiError(HTTP.BAD_REQUEST, "Category name must contain letters or numbers");
  }

  const duplicateSlug = await RepairCategoryModel.findByShopAndSlug(shopId, slug);
  if (duplicateSlug) {
    throw new ApiError(HTTP.CONFLICT, "A category with a similar name already exists");
  }

  const duplicateName = await RepairCategoryModel.findByShopAndName(shopId, trimmedName);
  if (duplicateName) {
    throw new ApiError(HTTP.CONFLICT, "A category with this name already exists");
  }

  const normalizedIconKey = String(iconKey ?? "wrench").trim().toLowerCase() || "wrench";

  const maxSort = await RepairCategoryModel.findByShop(shopId);
  const nextSort =
    sortOrder != null
      ? Number(sortOrder)
      : maxSort.length > 0
        ? Math.max(...maxSort.map((c) => c.sortOrder)) + 1
        : 0;

  return RepairCategoryModel.create({
    shopId: Number(shopId),
    name: trimmedName,
    slug,
    iconKey: normalizedIconKey,
    imageUrl: imageUrl?.trim() || null,
    sortOrder: nextSort,
    isDefault: false,
  });
}

export async function updateRepairCategory(id, { name, iconKey, imageUrl, sortOrder }) {
  const category = await RepairCategoryModel.findById(id);
  if (!category) {
    throw new ApiError(HTTP.NOT_FOUND, "Repair category not found");
  }

  const data = {};

  if (name !== undefined) {
    const trimmedName = String(name).trim();
    if (trimmedName.length < 2) {
      throw new ApiError(HTTP.BAD_REQUEST, "Category name must be at least 2 characters");
    }
    const slug = slugify(trimmedName);
    const duplicateSlug = await RepairCategoryModel.findByShopAndSlug(
      category.shopId,
      slug,
      id,
    );
    if (duplicateSlug) {
      throw new ApiError(HTTP.CONFLICT, "A category with a similar name already exists");
    }
    const duplicateName = await RepairCategoryModel.findByShopAndName(
      category.shopId,
      trimmedName,
      id,
    );
    if (duplicateName) {
      throw new ApiError(HTTP.CONFLICT, "A category with this name already exists");
    }
    data.name = trimmedName;
    data.slug = slug;
  }

  if (iconKey !== undefined) {
    data.iconKey = String(iconKey).trim().toLowerCase() || "wrench";
  }

  if (imageUrl !== undefined) {
    const nextImageUrl = imageUrl?.trim() || null;
    await deleteStoredImageIfReplaced(category.imageUrl, nextImageUrl);
    data.imageUrl = nextImageUrl;
  }

  if (sortOrder !== undefined) {
    data.sortOrder = Number(sortOrder);
  }

  if (Object.keys(data).length === 0) {
    throw new ApiError(HTTP.BAD_REQUEST, "At least one field is required to update");
  }

  return RepairCategoryModel.update(id, data);
}

export async function deleteRepairCategory(id) {
  const category = await RepairCategoryModel.findById(id);
  if (!category) {
    throw new ApiError(HTTP.NOT_FOUND, "Repair category not found");
  }

  await purgeRepairCategoryImages(id);
  await RepairCategoryModel.delete(id);
}
