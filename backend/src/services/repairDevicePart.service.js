import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { RepairCategoryModel } from "../models/repairCategory.model.js";
import { RepairManufacturerModel } from "../models/repairManufacturer.model.js";
import { RepairDeviceModel } from "../models/repairDevice.model.js";
import { RepairDevicePartModel } from "../models/repairDevicePart.model.js";
import { ShopModel } from "../models/shop.model.js";
import { slugify } from "../utils/slugify.js";
import { DEFAULT_REPAIR_DEVICE_PARTS, REPAIR_PART_IMAGE_VARIANTS,
} from "../data/defaultRepairDeviceParts.js";
import { deleteStoredImage, deleteStoredImageIfReplaced } from "./storage/deleteImage.js";

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

async function seedDefaultPartsIfEmpty(
  shopId,
  repairCategoryId,
  repairManufacturerId,
  repairDeviceId,
) {
  const count = await RepairDevicePartModel.countByDevice(shopId, repairDeviceId);
  if (count > 0) return;

  await RepairDevicePartModel.createMany(
    DEFAULT_REPAIR_DEVICE_PARTS.map((item) => ({
      shopId: Number(shopId),
      repairCategoryId: Number(repairCategoryId),
      repairManufacturerId: Number(repairManufacturerId),
      repairDeviceId: Number(repairDeviceId),
      name: item.name,
      slug: item.slug,
      price: item.price,
      onHand: item.onHand,
      imageVariant: item.imageVariant,
      sortOrder: item.sortOrder,
      isDefault: true,
    })),
  );
}

export async function listRepairDeviceParts(
  shopId,
  repairCategoryId,
  repairManufacturerId,
  repairDeviceId,
) {
  await ensureShopExists(shopId);
  await ensureDeviceContext(shopId, repairCategoryId, repairManufacturerId, repairDeviceId);
  await seedDefaultPartsIfEmpty(
    shopId,
    repairCategoryId,
    repairManufacturerId,
    repairDeviceId,
  );
  return RepairDevicePartModel.findByDevice(shopId, repairDeviceId);
}

export async function createRepairDevicePart({
  shopId,
  repairCategoryId,
  repairManufacturerId,
  repairDeviceId,
  name,
  price,
  onHand,
  imageVariant,
  imageUrl,
  sortOrder,
}) {
  await ensureShopExists(shopId);
  await ensureDeviceContext(shopId, repairCategoryId, repairManufacturerId, repairDeviceId);

  const trimmedName = String(name).trim();
  const slug = slugify(trimmedName);
  const resolvedVariant = imageVariant ?? "screen";

  if (!REPAIR_PART_IMAGE_VARIANTS.includes(resolvedVariant)) {
    throw new ApiError(HTTP.BAD_REQUEST, "Invalid image variant");
  }

  const parsedPrice = Number(price);
  if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
    throw new ApiError(HTTP.BAD_REQUEST, "Price must be a non-negative number");
  }

  const parsedOnHand = Number(onHand ?? 0);
  if (!Number.isInteger(parsedOnHand) || parsedOnHand < 0) {
    throw new ApiError(HTTP.BAD_REQUEST, "On hand must be a non-negative integer");
  }

  const existingName = await RepairDevicePartModel.findByDeviceAndName(
    shopId,
    repairDeviceId,
    trimmedName,
  );
  if (existingName) {
    throw new ApiError(HTTP.CONFLICT, "A part with this name already exists for this device");
  }

  const existingSlug = await RepairDevicePartModel.findByDeviceAndSlug(
    shopId,
    repairDeviceId,
    slug,
  );
  if (existingSlug) {
    throw new ApiError(HTTP.CONFLICT, "A part with a similar name already exists");
  }

  const existing = await RepairDevicePartModel.findByDevice(shopId, repairDeviceId);
  const resolvedSortOrder = sortOrder ?? existing.length;

  return RepairDevicePartModel.create({
    shopId: Number(shopId),
    repairCategoryId: Number(repairCategoryId),
    repairManufacturerId: Number(repairManufacturerId),
    repairDeviceId: Number(repairDeviceId),
    name: trimmedName,
    slug,
    price: parsedPrice,
    onHand: parsedOnHand,
    imageVariant: resolvedVariant,
    imageUrl: imageUrl ?? null,
    sortOrder: resolvedSortOrder,
    isDefault: false,
  });
}

export async function updateRepairDevicePart(id, payload) {
  const part = await RepairDevicePartModel.findById(id);
  if (!part) {
    throw new ApiError(HTTP.NOT_FOUND, "Repair device part not found");
  }

  const data = {};

  if (payload.name !== undefined) {
    const trimmedName = String(payload.name).trim();
    const existingName = await RepairDevicePartModel.findByDeviceAndName(
      part.shopId,
      part.repairDeviceId,
      trimmedName,
      part.id,
    );
    if (existingName) {
      throw new ApiError(HTTP.CONFLICT, "A part with this name already exists for this device");
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

  if (payload.onHand !== undefined) {
    const parsedOnHand = Number(payload.onHand);
    if (!Number.isInteger(parsedOnHand) || parsedOnHand < 0) {
      throw new ApiError(HTTP.BAD_REQUEST, "On hand must be a non-negative integer");
    }
    data.onHand = parsedOnHand;
  }

  if (payload.imageVariant !== undefined) {
    if (!REPAIR_PART_IMAGE_VARIANTS.includes(payload.imageVariant)) {
      throw new ApiError(HTTP.BAD_REQUEST, "Invalid image variant");
    }
    data.imageVariant = payload.imageVariant;
  }

  if (payload.imageUrl !== undefined) {
    const nextImageUrl = payload.imageUrl?.trim() || null;
    await deleteStoredImageIfReplaced(part.imageUrl, nextImageUrl);
    data.imageUrl = nextImageUrl;
  }

  if (payload.sortOrder !== undefined) {
    data.sortOrder = payload.sortOrder;
  }

  if (data.slug) {
    const existingSlug = await RepairDevicePartModel.findByDeviceAndSlug(
      part.shopId,
      part.repairDeviceId,
      data.slug,
      part.id,
    );
    if (existingSlug) {
      throw new ApiError(HTTP.CONFLICT, "A part with a similar name already exists");
    }
  }

  return RepairDevicePartModel.update(id, data);
}

export async function deleteRepairDevicePart(id) {
  const part = await RepairDevicePartModel.findById(id);
  if (!part) {
    throw new ApiError(HTTP.NOT_FOUND, "Repair device part not found");
  }
  if (part.imageUrl) {
    await deleteStoredImage(part.imageUrl);
  }
  await RepairDevicePartModel.delete(id);
}
