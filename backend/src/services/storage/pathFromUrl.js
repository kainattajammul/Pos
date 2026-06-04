import { env } from "../../config/env.js";

/**
 * Parse a public image URL into storage provider + object path.
 * Works across STORAGE_DRIVER switches (detects host, not only current env).
 */
export function resolveStorageLocation(imageUrl) {
  if (!imageUrl || typeof imageUrl !== "string") return null;

  const trimmed = imageUrl.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);

    // Supabase public URL: .../storage/v1/object/public/{bucket}/{path}
    if (parsed.pathname.includes("/storage/v1/object/public/")) {
      const idx = parsed.pathname.indexOf("/storage/v1/object/public/");
      const after = parsed.pathname.slice(idx + "/storage/v1/object/public/".length);
      const slash = after.indexOf("/");
      if (slash <= 0) return null;
      const bucket = after.slice(0, slash);
      const objectPath = after.slice(slash + 1);
      if (!objectPath) return null;
      return { provider: "supabase", path: objectPath, bucket };
    }

    // Local / cPanel: PUBLIC_UPLOAD_URL + relative path
    const localPath = resolveLocalPathFromUrl(parsed);
    if (localPath) {
      return { provider: "local", path: localPath };
    }
  } catch {
    return null;
  }

  return null;
}

function resolveLocalPathFromUrl(parsed) {
  if (env.publicUploadUrl) {
    try {
      const base = new URL(env.publicUploadUrl.replace(/\/$/, ""));
      if (parsed.origin === base.origin) {
        const basePath = base.pathname.replace(/\/$/, "") || "";
        const fullPath = parsed.pathname.replace(/\/$/, "");
        if (basePath && fullPath.startsWith(`${basePath}/`)) {
          return fullPath.slice(basePath.length + 1);
        }
        if (!basePath && fullPath.startsWith("/")) {
          return fullPath.replace(/^\//, "");
        }
      }
    } catch {
      /* ignore invalid PUBLIC_UPLOAD_URL */
    }
  }

  // Dev default: http://localhost:4000/uploads/...
  const match = parsed.pathname.match(/^\/uploads\/(.+)$/);
  if (match) return match[1];

  return null;
}
