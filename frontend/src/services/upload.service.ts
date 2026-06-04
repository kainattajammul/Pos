import { apiClient } from "@/lib/axios";
import type { ApiSuccessResponse } from "@/types/api";
import type { UploadedFile, UploadImageResponse } from "@/types/upload";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

/**
 * Upload image via backend API (never direct to Supabase from browser).
 * POST /api/v1/upload with multipart field "image".
 */
export async function uploadImage(
  file: File,
  options?: { prefix?: string },
): Promise<UploadedFile> {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Invalid image type. Use JPEG, PNG, or WebP.");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Image must be 5 MB or smaller.");
  }

  const form = new FormData();
  form.append("image", file);
  if (options?.prefix) {
    form.append("prefix", options.prefix);
  }

  const { data } = await apiClient.post<ApiSuccessResponse<UploadImageResponse>>(
    "/upload",
    form,
    { headers: { "Content-Type": "multipart/form-data" } },
  );

  return data.data.file;
}
