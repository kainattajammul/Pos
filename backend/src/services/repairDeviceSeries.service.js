import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { RepairCategoryModel } from "../models/repairCategory.model.js";
import { RepairManufacturerModel } from "../models/repairManufacturer.model.js";
import { RepairDeviceSeriesModel } from "../models/repairDeviceSeries.model.js";
import { ShopModel } from "../models/shop.model.js";
import { slugify } from "../utils/slugify.js";

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

export async function ensureSeriesExists(shopId, repairCategoryId, repairManufacturerId, seriesId) {
  const series = await RepairDeviceSeriesModel.findById(seriesId);
  if (
    !series ||
    series.shopId !== Number(shopId) ||
    series.repairCategoryId !== Number(repairCategoryId) ||
    series.repairManufacturerId !== Number(repairManufacturerId)
  ) {
    throw new ApiError(HTTP.NOT_FOUND, "Repair device series not found for this manufacturer");
  }
  return series;
}

export async function listRepairDeviceSeries(
  shopId,
  repairCategoryId,
  repairManufacturerId,
) {
  await Promise.all([
    ensureShopExists(shopId),
    ensureCategoryExists(shopId, repairCategoryId),
    ensureManufacturerExists(shopId, repairCategoryId, repairManufacturerId),
  ]);

  return RepairDeviceSeriesModel.findByManufacturer(shopId, repairManufacturerId);
}

export async function createRepairDeviceSeries({
  shopId,
  repairCategoryId,
  repairManufacturerId,
  name,
  sortOrder,
}) {
  const trimmedName = String(name).trim();
  if (trimmedName.length < 2) {
    throw new ApiError(HTTP.BAD_REQUEST, "Series name must be at least 2 characters");
  }

  await ensureShopExists(shopId);
  await ensureCategoryExists(shopId, repairCategoryId);
  await ensureManufacturerExists(shopId, repairCategoryId, repairManufacturerId);

  const slug = slugify(trimmedName);
  if (!slug) {
    throw new ApiError(HTTP.BAD_REQUEST, "Series name must contain letters or numbers");
  }

  const duplicateSlug = await RepairDeviceSeriesModel.findByManufacturerAndSlug(
    shopId,
    repairManufacturerId,
    slug,
  );
  if (duplicateSlug) {
    throw new ApiError(HTTP.CONFLICT, "A series with a similar name already exists");
  }

  const duplicateName = await RepairDeviceSeriesModel.findByManufacturerAndName(
    shopId,
    repairManufacturerId,
    trimmedName,
  );
  if (duplicateName) {
    throw new ApiError(HTTP.CONFLICT, "A series with this name already exists");
  }

  const existing = await RepairDeviceSeriesModel.findByManufacturer(
    shopId,
    repairManufacturerId,
  );
  const nextSort =
    sortOrder ??
    existing.reduce((max, item) => Math.max(max, item.sortOrder), -1) + 1;

  return RepairDeviceSeriesModel.create({
    shopId: Number(shopId),
    repairCategoryId: Number(repairCategoryId),
    repairManufacturerId: Number(repairManufacturerId),
    name: trimmedName,
    slug,
    sortOrder: nextSort,
  });
}

export async function updateRepairDeviceSeries(id, payload) {
  const series = await RepairDeviceSeriesModel.findById(id);
  if (!series) {
    throw new ApiError(HTTP.NOT_FOUND, "Repair device series not found");
  }

  const data = {};

  if (payload.name !== undefined) {
    const trimmedName = String(payload.name).trim();
    if (trimmedName.length < 2) {
      throw new ApiError(HTTP.BAD_REQUEST, "Series name must be at least 2 characters");
    }

    const duplicateName = await RepairDeviceSeriesModel.findByManufacturerAndName(
      series.shopId,
      series.repairManufacturerId,
      trimmedName,
      series.id,
    );
    if (duplicateName) {
      throw new ApiError(HTTP.CONFLICT, "A series with this name already exists");
    }

    const slug = slugify(trimmedName);
    const duplicateSlug = await RepairDeviceSeriesModel.findByManufacturerAndSlug(
      series.shopId,
      series.repairManufacturerId,
      slug,
      series.id,
    );
    if (duplicateSlug) {
      throw new ApiError(HTTP.CONFLICT, "A series with a similar name already exists");
    }

    data.name = trimmedName;
    data.slug = slug;
  }

  if (payload.sortOrder !== undefined) {
    data.sortOrder = payload.sortOrder;
  }

  if (Object.keys(data).length === 0) {
    throw new ApiError(HTTP.BAD_REQUEST, "At least one field is required to update");
  }

  return RepairDeviceSeriesModel.update(id, data);
}

export async function deleteRepairDeviceSeries(id) {
  const series = await RepairDeviceSeriesModel.findById(id);
  if (!series) {
    throw new ApiError(HTTP.NOT_FOUND, "Repair device series not found");
  }
  await RepairDeviceSeriesModel.delete(id);
}
