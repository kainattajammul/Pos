import dotenv from "dotenv";

dotenv.config();

function requireEnv(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  jwtSecret: requireEnv("JWT_SECRET", "dev-only-change-in-production"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  jwtRefreshSecret: requireEnv("JWT_REFRESH_SECRET", "dev-only-refresh-secret"),
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "30d",
  isProduction: process.env.NODE_ENV === "production",
  /** Allows login without DB when Postgres is not configured (development only). */
  devAuthBypass: process.env.ENABLE_DEV_AUTH_BYPASS === "true" && process.env.NODE_ENV !== "production",
  supabaseUrl: process.env.SUPABASE_URL ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  /** Bucket for STORAGE_DRIVER=supabase (SUPABASE_BUCKET aliases legacy name). */
  supabaseBucket:
    process.env.SUPABASE_BUCKET ??
    process.env.REPAIR_CATEGORY_STORAGE_BUCKET ??
    "repair-category-images",
  repairCategoryStorageBucket:
    process.env.REPAIR_CATEGORY_STORAGE_BUCKET ??
    process.env.SUPABASE_BUCKET ??
    "repair-category-images",
  /** supabase | local (cPanel) */
  storageDriver: (process.env.STORAGE_DRIVER ?? "supabase").toLowerCase(),
  /** Absolute path for local uploads, e.g. /home/user/public_html/uploads */
  uploadDir: process.env.UPLOAD_DIR ?? "",
  /** Public base URL for local files, e.g. https://yourdomain.com/uploads */
  publicUploadUrl: process.env.PUBLIC_UPLOAD_URL ?? "",
};
