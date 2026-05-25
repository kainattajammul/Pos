import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { RepairCategoryModel } from "../models/repairCategory.model.js";
import { RepairManufacturerModel } from "../models/repairManufacturer.model.js";
import { RepairDeviceModel } from "../models/repairDevice.model.js";
import { ShopModel } from "../models/shop.model.js";
import { slugify } from "../utils/slugify.js";
import { getDefaultDeviceNames } from "../data/defaultRepairDevices.js";

const VALID_ICON_VARIANTS = new Set([
  "mobile",
  "tablet",
  "laptop",
  "desktop",
  "drone",
  "jewelry",
]);

function defaultIconVariantForCategory(categorySlug) {
  const slug = (categorySlug ?? "").toLowerCase();
  if (slug === "tablet") return "tablet";
  if (slug === "drone") return "drone";
  if (slug === "jewelry") return "jewelry";
  if (slug === "computer") return null;
  return "mobile";
}

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

async function ensureManufacturerExists(shopId, repairCategoryId, repairManufacturerId) {
  const manufacturer = await RepairManufacturerModel.findById(repairManufacturerId);
  if (
    !manufacturer ||
    manufacturer.shopId !== Number(shopId) ||
    manufacturer.repairCategoryId !== Number(repairCategoryId)
  ) {
    throw new ApiError(HTTP.NOT_FOUND, "Repair manufacturer not found for this category");
  }
  return manufacturer;
}

async function seedDefaultDevicesIfEmpty(
  shopId,
  repairCategoryId,
  repairManufacturerId,
  categorySlug,
  manufacturerSlug,
) {
  const count = await RepairDeviceModel.countByManufacturer(shopId, repairManufacturerId);
  if (count > 0) return;

  const names = getDefaultDeviceNames(categorySlug, manufacturerSlug);
  if (names.length === 0) return;

  const defaultVariant = defaultIconVariantForCategory(categorySlug);

  await RepairDeviceModel.createMany(
    names.map((name, index) => ({
      shopId: Number(shopId),
      repairCategoryId: Number(repairCategoryId),
      repairManufacturerId: Number(repairManufacturerId),
      name,
      slug: slugify(name),
      iconVariant: defaultVariant,
      sortOrder: index,
      isDefault: true,
    })),
  );
}

export async function listRepairDevices(
  shopId,
  repairCategoryId,
  repairManufacturerId,
) {
  await ensureShopExists(shopId);
  const category = await ensureCategoryExists(shopId, repairCategoryId);
  const manufacturer = await ensureManufacturerExists(
    shopId,
    repairCategoryId,
    repairManufacturerId,
  );

  await seedDefaultDevicesIfEmpty(
    shopId,
    repairCategoryId,
    repairManufacturerId,
    category.slug,
    manufacturer.slug,
  );

  return RepairDeviceModel.findByManufacturer(shopId, repairManufacturerId);
}

export async function createRepairDevice({
  shopId,
  repairCategoryId,
  repairManufacturerId,
  name,
  imageUrl,
  iconVariant,
  sortOrder,
}) {
  await ensureShopExists(shopId);
  const category = await ensureCategoryExists(shopId, repairCategoryId);
  await ensureManufacturerExists(shopId, repairCategoryId, repairManufacturerId);

  const trimmedName = String(name).trim();
  const slug = slugify(trimmedName);

  const existingName = await RepairDeviceModel.findByManufacturerAndName(
    shopId,
    repairManufacturerId,
    trimmedName,
  );
  if (existingName) {
    throw new ApiError(HTTP.CONFLICT, "A device with this name already exists");
  }

  const existingSlug = await RepairDeviceModel.findByManufacturerAndSlug(
    shopId,
    repairManufacturerId,
    slug,
  );
  if (existingSlug) {
    throw new ApiError(HTTP.CONFLICT, "A device with a similar name already exists");
  }

  let resolvedVariant = iconVariant ?? null;
  if (resolvedVariant != null && !VALID_ICON_VARIANTS.has(resolvedVariant)) {
    throw new ApiError(HTTP.BAD_REQUEST, "Invalid icon variant");
  }
  if (resolvedVariant == null) {
    resolvedVariant = defaultIconVariantForCategory(category.slug);
  }

  return RepairDeviceModel.create({
    shopId: Number(shopId),
    repairCategoryId: Number(repairCategoryId),
    repairManufacturerId: Number(repairManufacturerId),
    name: trimmedName,
    slug,
    imageUrl: imageUrl ?? null,
    iconVariant: resolvedVariant,
    sortOrder: sortOrder ?? 0,
    isDefault: false,
  });
}

export async function updateRepairDevice(id, payload) {
  const device = await RepairDeviceModel.findById(id);
  if (!device) {
    throw new ApiError(HTTP.NOT_FOUND, "Repair device not found");
  }

  const data = {};

  if (payload.name !== undefined) {
    const trimmedName = String(payload.name).trim();
    const existingName = await RepairDeviceModel.findByManufacturerAndName(
      device.shopId,
      device.repairManufacturerId,
      trimmedName,
      device.id,
    );
    if (existingName) {
      throw new ApiError(HTTP.CONFLICT, "A device with this name already exists");
    }
    data.name = trimmedName;
    data.slug = slugify(trimmedName);
  }

  if (payload.imageUrl !== undefined) {
    data.imageUrl = payload.imageUrl;
  }

  if (payload.iconVariant !== undefined) {
    if (
      payload.iconVariant != null &&
      !VALID_ICON_VARIANTS.has(payload.iconVariant)
    ) {
      throw new ApiError(HTTP.BAD_REQUEST, "Invalid icon variant");
    }
    data.iconVariant = payload.iconVariant;
  }

  if (payload.sortOrder !== undefined) {
    data.sortOrder = payload.sortOrder;
  }

  if (data.slug) {
    const existingSlug = await RepairDeviceModel.findByManufacturerAndSlug(
      device.shopId,
      device.repairManufacturerId,
      data.slug,
      device.id,
    );
    if (existingSlug) {
      throw new ApiError(HTTP.CONFLICT, "A device with a similar name already exists");
    }
  }

  return RepairDeviceModel.update(id, data);
}

export async function deleteRepairDevice(id) {
  const device = await RepairDeviceModel.findById(id);
  if (!device) {
    throw new ApiError(HTTP.NOT_FOUND, "Repair device not found");
  }
  await RepairDeviceModel.delete(id);
}
