import fs from "fs/promises";
import path from "path";
import { env } from "../../config/env.js";
import { ApiError } from "../../utils/ApiError.js";
import { HTTP } from "../../constants/httpStatus.js";

/**
 * Save file to UPLOAD_DIR (cPanel public folder or local ./uploads).
 * @param {{ buffer: Buffer; mimetype: string; size: number }} file
 * @param {string} storagePath - relative path under UPLOAD_DIR
 */
export async function uploadToLocal(file, storagePath) {
  const uploadRoot =
    env.uploadDir || path.join(process.cwd(), "uploads");
  const publicBase =
    env.publicUploadUrl?.replace(/\/$/, "") ||
    "http://localhost:4000/uploads";

  const normalized = storagePath.replace(/\\/g, "/").replace(/^\/+/, "");
  const fullPath = path.join(uploadRoot, normalized);

  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, file.buffer);

  const url = `${publicBase}/${normalized}`;

  return {
    url,
    path: normalized,
    provider: "local",
    mimeType: file.mimetype,
    size: file.size,
  };
}
