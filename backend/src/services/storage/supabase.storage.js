import { getSupabaseAdmin } from "../../config/supabase.js";
import { env } from "../../config/env.js";
import { ApiError } from "../../utils/ApiError.js";
import { HTTP } from "../../constants/httpStatus.js";

/**
 * Upload buffer to Supabase Storage bucket.
 * @param {{ buffer: Buffer; mimetype: string; size: number }} file
 * @param {string} storagePath - object key inside the bucket
 */
export async function uploadToSupabase(file, storagePath) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    throw new ApiError(
      HTTP.SERVICE_UNAVAILABLE,
      "Supabase storage is not configured. Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and SUPABASE_BUCKET.",
    );
  }

  const bucket = env.supabaseBucket;
  const { error } = await supabase.storage.from(bucket).upload(storagePath, file.buffer, {
    contentType: file.mimetype,
    upsert: false,
  });

  if (error) {
    throw new ApiError(HTTP.BAD_REQUEST, `Image upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);

  return {
    url: data.publicUrl,
    path: storagePath,
    provider: "supabase",
    mimeType: file.mimetype,
    size: file.size,
  };
}
