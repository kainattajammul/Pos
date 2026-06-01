import { createClient } from "@supabase/supabase-js";
import { env } from "./env.js";

let client = null;

export function getSupabaseAdmin() {
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    return null;
  }

  if (!client) {
    client = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  return client;
}

export function isSupabaseStorageConfigured() {
  return Boolean(
    env.supabaseUrl &&
      env.supabaseServiceRoleKey &&
      env.repairCategoryStorageBucket,
  );
}

/** Ensures the repair category bucket exists and is public so card images load in the browser. */
export async function ensureRepairCategoryStorageBucket() {
  const supabase = getSupabaseAdmin();
  if (!supabase || !env.repairCategoryStorageBucket) return false;

  const bucketName = env.repairCategoryStorageBucket;
  const { data: existing } = await supabase.storage.getBucket(bucketName);

  if (!existing) {
    const { error } = await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024,
    });
    if (error) {
      console.warn("Supabase storage: could not create bucket:", error.message);
      return false;
    }
    return true;
  }

  if (!existing.public) {
    const { error } = await supabase.storage.updateBucket(bucketName, { public: true });
    if (error) {
      console.warn("Supabase storage: could not make bucket public:", error.message);
      return false;
    }
  }

  return true;
}
