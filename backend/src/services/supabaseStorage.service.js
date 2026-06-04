/**
 * Repair entity image uploads — delegates to storage abstraction (Supabase or local).
 * Kept for backward compatibility with existing repair upload-image routes.
 */
import { uploadImage } from "./storage/index.js";

export async function uploadRepairCategoryImage(file, shopId) {
  const result = await uploadImage(file, { prefix: `shop-${shopId}` });
  return { url: result.url, path: result.path };
}

export async function uploadRepairManufacturerImage(file, shopId, repairCategoryId) {
  const result = await uploadImage(file, {
    prefix: `shop-${shopId}/category-${repairCategoryId}/manufacturers`,
  });
  return { url: result.url, path: result.path };
}

export async function uploadRepairDeviceImage(
  file,
  shopId,
  repairCategoryId,
  repairManufacturerId,
) {
  const result = await uploadImage(file, {
    prefix: `shop-${shopId}/category-${repairCategoryId}/manufacturer-${repairManufacturerId}/devices`,
  });
  return { url: result.url, path: result.path };
}

export async function uploadRepairDeviceIssueImage(
  file,
  shopId,
  repairCategoryId,
  repairManufacturerId,
  repairDeviceId,
) {
  const result = await uploadImage(file, {
    prefix: `shop-${shopId}/category-${repairCategoryId}/manufacturer-${repairManufacturerId}/device-${repairDeviceId}/issues`,
  });
  return { url: result.url, path: result.path };
}

export async function uploadRepairDevicePartImage(
  file,
  shopId,
  repairCategoryId,
  repairManufacturerId,
  repairDeviceId,
) {
  const result = await uploadImage(file, {
    prefix: `shop-${shopId}/category-${repairCategoryId}/manufacturer-${repairManufacturerId}/device-${repairDeviceId}/parts`,
  });
  return { url: result.url, path: result.path };
}
