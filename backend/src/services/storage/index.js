import { randomUUID } from "crypto";
import { env } from "../../config/env.js";
import { ApiError } from "../../utils/ApiError.js";
import { HTTP } from "../../constants/httpStatus.js";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_BYTES,
  extensionFromMime,
} from "./constants.js";
import { uploadToSupabase } from "./supabase.storage.js";
import { uploadToLocal } from "./local.storage.js";

/**
 * Validates multer file before upload.
 */
export function validateImageFile(file) {
  if (!file?.buffer?.length) {
    throw new ApiError(HTTP.BAD_REQUEST, "Image file is required");
  }

  if (!ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype)) {
    throw new ApiError(
      HTTP.BAD_REQUEST,
      "Invalid image type. Use JPEG, PNG, or WebP.",
    );
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new ApiError(HTTP.BAD_REQUEST, "Image must be 5 MB or smaller");
  }
}

/**
 * Environment-based storage: supabase (dev) or local (cPanel production).
 *
 * @param {{ buffer: Buffer; mimetype: string; size: number; originalname?: string }} file - multer memory file
 * @param {{ prefix?: string }} [options] - folder prefix, e.g. "shop-1/products"
 */
export async function uploadImage(file, options = {}) {
  validateImageFile(file);

  const prefix = (options.prefix ?? "uploads")
    .replace(/\\/g, "/")
    .replace(/^\/+|\/+$/g, "");
  const ext = extensionFromMime(file.mimetype);
  const storagePath = `${prefix}/${randomUUID()}.${ext}`;

  const driver = env.storageDriver;

  if (driver === "local") {
    return uploadToLocal(file, storagePath);
  }

  if (driver === "supabase") {
    return uploadToSupabase(file, storagePath);
  }

  throw new ApiError(
    HTTP.SERVICE_UNAVAILABLE,
    `Unknown STORAGE_DRIVER "${driver}". Use "supabase" or "local".`,
  );
}

export function getActiveStorageProvider() {
  return env.storageDriver;
}

export {
  deleteStoredImage,
  deleteStoredImages,
  deleteStoredImageIfReplaced,
} from "./deleteImage.js";
export { resolveStorageLocation } from "./pathFromUrl.js";
