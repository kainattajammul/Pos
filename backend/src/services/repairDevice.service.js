import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { RepairCategoryModel } from "../models/repairCategory.model.js";
import { RepairManufacturerModel } from "../models/repairManufacturer.model.js";
import { RepairDeviceModel } from "../models/repairDevice.model.js";
import { ensureSeriesExists } from "./repairDeviceSeries.service.js";
import { ShopModel } from "../models/shop.model.js";
import { slugify } from "../utils/slugify.js";
import { getDefaultDeviceNames } from "../data/defaultRepairDevices.js";
import {
  sortOrderForDeviceName,
  sortRepairDevices,
} from "../utils/repairDeviceSort.js";

async function syncManufacturerDeviceSortOrders(shopId, repairManufacturerId) {
  const devices = await RepairDeviceModel.findByManufacturer(
    shopId,
    repairManufacturerId,
  );
  const sorted = sortRepairDevices(devices);
  const { prisma } = await import("../config/database.js");
  const updates = sorted
    .map((device, index) =>
      device.sortOrder !== index
        ? prisma.repairDevice.update({
            where: { id: device.id },
            data: { sortOrder: index },
          })
        : null,
    )
    .filter(Boolean);
  if (updates.length > 0) {
    await prisma.$transaction(updates);
  }
  return sorted;
}

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

  const names = getDefaultDeviceNames(categorySlug, manufacturerSlug).filter(Boolean);
  if (names.length === 0) return;

  const defaultVariant = defaultIconVariantForCategory(categorySlug);
  const sortedNames = sortRepairDevices(names.map((name) => ({ name }))).map((d) => d.name);

  await RepairDeviceModel.createMany(
    sortedNames.map((name, index) => ({
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
  const [, category, manufacturer] = await Promise.all([
    ensureShopExists(shopId),
    ensureCategoryExists(shopId, repairCategoryId),
    ensureManufacturerExists(shopId, repairCategoryId, repairManufacturerId),
  ]);

  await seedDefaultDevicesIfEmpty(
    shopId,
    repairCategoryId,
    repairManufacturerId,
    category.slug,
    manufacturer.slug,
  );

  const devices = await RepairDeviceModel.findByManufacturer(
    shopId,
    repairManufacturerId,
  );
  return sortRepairDevices(devices);
}

export async function createRepairDevice({
  shopId,
  repairCategoryId,
  repairManufacturerId,
  repairDeviceSeriesId,
  name,
  imageUrl,
  iconVariant,
  sortOrder,
}) {
  await ensureShopExists(shopId);
  const category = await ensureCategoryExists(shopId, repairCategoryId);
  await ensureManufacturerExists(shopId, repairCategoryId, repairManufacturerId);

  if (repairDeviceSeriesId != null) {
    await ensureSeriesExists(
      shopId,
      repairCategoryId,
      repairManufacturerId,
      repairDeviceSeriesId,
    );
  }

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

  const existing = await RepairDeviceModel.findByManufacturer(
    shopId,
    repairManufacturerId,
  );
  const resolvedSortOrder =
    sortOrder ??
    sortOrderForDeviceName(existing, trimmedName);

  const created = await RepairDeviceModel.create({
    shopId: Number(shopId),
    repairCategoryId: Number(repairCategoryId),
    repairManufacturerId: Number(repairManufacturerId),
    repairDeviceSeriesId:
      repairDeviceSeriesId != null ? Number(repairDeviceSeriesId) : null,
    name: trimmedName,
    slug,
    imageUrl: imageUrl ?? null,
    iconVariant: resolvedVariant,
    sortOrder: resolvedSortOrder,
    isDefault: false,
  });

  await syncManufacturerDeviceSortOrders(shopId, repairManufacturerId);
  return RepairDeviceModel.findById(created.id);
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

  if (payload.repairDeviceSeriesId !== undefined) {
    if (payload.repairDeviceSeriesId === null) {
      data.repairDeviceSeriesId = null;
    } else {
      await ensureSeriesExists(
        device.shopId,
        device.repairCategoryId,
        device.repairManufacturerId,
        payload.repairDeviceSeriesId,
      );
      data.repairDeviceSeriesId = Number(payload.repairDeviceSeriesId);
    }
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

  const updated = await RepairDeviceModel.update(id, data);

  if (data.name !== undefined) {
    await syncManufacturerDeviceSortOrders(
      updated.shopId,
      updated.repairManufacturerId,
    );
    return RepairDeviceModel.findById(updated.id);
  }

  return updated;
}

export async function deleteRepairDevice(id) {
  const device = await RepairDeviceModel.findById(id);
  if (!device) {
    throw new ApiError(HTTP.NOT_FOUND, "Repair device not found");
  }
  const { shopId, repairManufacturerId } = device;
  await RepairDeviceModel.delete(id);
  await syncManufacturerDeviceSortOrders(shopId, repairManufacturerId);
}
