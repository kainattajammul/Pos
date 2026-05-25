import { randomUUID } from "crypto";
import { env } from "../config/env.js";
import { getSupabaseAdmin, isSupabaseStorageConfigured } from "../config/supabase.js";
import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

const MAX_BYTES = 5 * 1024 * 1024;

function extensionFromMime(mime) {
  switch (mime) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    case "image/svg+xml":
      return "svg";
    default:
      return "bin";
  }
}

/**
 * Uploads a category image to Supabase Storage and returns the public URL.
 */
export async function uploadRepairCategoryImage(file, shopId) {
  if (!file?.buffer?.length) {
    throw new ApiError(HTTP.BAD_REQUEST, "Image file is required");
  }

  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    throw new ApiError(
      HTTP.BAD_REQUEST,
      "Invalid image type. Use JPEG, PNG, WebP, GIF, or SVG.",
    );
  }

  if (file.size > MAX_BYTES) {
    throw new ApiError(HTTP.BAD_REQUEST, "Image must be 5 MB or smaller");
  }

  if (!isSupabaseStorageConfigured()) {
    throw new ApiError(
      HTTP.SERVICE_UNAVAILABLE,
      "Image storage is not configured. Set SUPABASE_SERVICE_ROLE_KEY and create the storage bucket in Supabase.",
    );
  }

  const supabase = getSupabaseAdmin();
  const ext = extensionFromMime(file.mimetype);
  const path = `shop-${shopId}/${randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(env.repairCategoryStorageBucket)
    .upload(path, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    throw new ApiError(HTTP.BAD_REQUEST, `Image upload failed: ${error.message}`);
  }

  const { data } = supabase.storage
    .from(env.repairCategoryStorageBucket)
    .getPublicUrl(path);

  return { url: data.publicUrl, path };
}

/**
 * Uploads a manufacturer image to Supabase Storage and returns the public URL.
 */
export async function uploadRepairManufacturerImage(file, shopId, repairCategoryId) {
  if (!file?.buffer?.length) {
    throw new ApiError(HTTP.BAD_REQUEST, "Image file is required");
  }

  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    throw new ApiError(
      HTTP.BAD_REQUEST,
      "Invalid image type. Use JPEG, PNG, WebP, GIF, or SVG.",
    );
  }

  if (file.size > MAX_BYTES) {
    throw new ApiError(HTTP.BAD_REQUEST, "Image must be 5 MB or smaller");
  }

  if (!isSupabaseStorageConfigured()) {
    throw new ApiError(
      HTTP.SERVICE_UNAVAILABLE,
      "Image storage is not configured. Set SUPABASE_SERVICE_ROLE_KEY and create the storage bucket in Supabase.",
    );
  }

  const supabase = getSupabaseAdmin();
  const ext = extensionFromMime(file.mimetype);
  const path = `shop-${shopId}/category-${repairCategoryId}/manufacturers/${randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(env.repairCategoryStorageBucket)
    .upload(path, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    throw new ApiError(HTTP.BAD_REQUEST, `Image upload failed: ${error.message}`);
  }

  const { data } = supabase.storage
    .from(env.repairCategoryStorageBucket)
    .getPublicUrl(path);

  return { url: data.publicUrl, path };
}

/**
 * Uploads a device image to Supabase Storage and returns the public URL.
 */
export async function uploadRepairDeviceImage(
  file,
  shopId,
  repairCategoryId,
  repairManufacturerId,
) {
  if (!file?.buffer?.length) {
    throw new ApiError(HTTP.BAD_REQUEST, "Image file is required");
  }

  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    throw new ApiError(
      HTTP.BAD_REQUEST,
      "Invalid image type. Use JPEG, PNG, WebP, GIF, or SVG.",
    );
  }

  if (file.size > MAX_BYTES) {
    throw new ApiError(HTTP.BAD_REQUEST, "Image must be 5 MB or smaller");
  }

  if (!isSupabaseStorageConfigured()) {
    throw new ApiError(
      HTTP.SERVICE_UNAVAILABLE,
      "Image storage is not configured. Set SUPABASE_SERVICE_ROLE_KEY and create the storage bucket in Supabase.",
    );
  }

  const supabase = getSupabaseAdmin();
  const ext = extensionFromMime(file.mimetype);
  const path = `shop-${shopId}/category-${repairCategoryId}/manufacturer-${repairManufacturerId}/devices/${randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(env.repairCategoryStorageBucket)
    .upload(path, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    throw new ApiError(HTTP.BAD_REQUEST, `Image upload failed: ${error.message}`);
  }

  const { data } = supabase.storage
    .from(env.repairCategoryStorageBucket)
    .getPublicUrl(path);

  return { url: data.publicUrl, path };
}
