import fs from "fs/promises";
import path from "path";
import { env } from "../../config/env.js";
import { getSupabaseAdmin } from "../../config/supabase.js";
import { resolveStorageLocation } from "./pathFromUrl.js";

async function deleteFromSupabase(storagePath, bucket) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    console.warn("[storage] Supabase not configured — skip delete:", storagePath);
    return false;
  }

  const bucketName = bucket || env.supabaseBucket;
  const { error } = await supabase.storage.from(bucketName).remove([storagePath]);

  if (error) {
    console.warn("[storage] Supabase delete failed:", storagePath, error.message);
    return false;
  }

  return true;
}

async function deleteFromLocal(storagePath) {
  const uploadRoot = env.uploadDir || path.join(process.cwd(), "uploads");
  const normalized = storagePath.replace(/\\/g, "/").replace(/^\/+/, "");
  const fullPath = path.join(uploadRoot, normalized);

  try {
    await fs.unlink(fullPath);
    return true;
  } catch (err) {
    if (err.code === "ENOENT") return true;
    console.warn("[storage] Local delete failed:", fullPath, err.message);
    return false;
  }
}

/**
 * Delete one stored image by public URL or storage path.
 * Never throws — logs warnings so DB deletes still succeed.
 *
 * @param {string | null | undefined} imageUrlOrPath
 */
export async function deleteStoredImage(imageUrlOrPath) {
  if (!imageUrlOrPath?.trim()) return;

  const input = imageUrlOrPath.trim();
  let location = resolveStorageLocation(input);

  // Caller may pass raw storage path (no URL)
  if (!location && !input.includes("://")) {
    location = {
      provider: env.storageDriver === "local" ? "local" : "supabase",
      path: input.replace(/^\/+/, ""),
    };
  }

  if (!location?.path) {
    console.warn("[storage] Could not resolve path for delete:", input);
    return;
  }

  if (location.provider === "local") {
    await deleteFromLocal(location.path);
    return;
  }

  if (location.provider === "supabase") {
    await deleteFromSupabase(location.path, location.bucket);
  }
}

/**
 * Delete many images (deduplicated). Used when removing parent records with cascaded children.
 */
export async function deleteStoredImages(imageUrls) {
  const unique = [...new Set((imageUrls || []).filter((u) => u?.trim()))];
  await Promise.all(unique.map((url) => deleteStoredImage(url)));
}

/**
 * When replacing an image, remove the previous file from storage.
 */
export async function deleteStoredImageIfReplaced(oldUrl, newUrl) {
  const oldTrimmed = oldUrl?.trim() || null;
  const newTrimmed = newUrl?.trim() || null;
  if (!oldTrimmed) return;
  if (oldTrimmed === newTrimmed) return;
  await deleteStoredImage(oldTrimmed);
}
