import { ApiResponse } from "../utils/ApiResponse.js";
import { HTTP } from "../constants/httpStatus.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadImage } from "../services/storage/index.js";

/**
 * Unified image upload: Frontend → Express → Supabase or local disk.
 * POST /api/v1/upload  (field: image, optional body: prefix)
 */
export const UploadController = {
  async upload(req, res) {
    if (!req.file) {
      throw new ApiError(HTTP.BAD_REQUEST, "Image file is required (field name: image)");
    }

    const prefix =
      typeof req.body?.prefix === "string" && req.body.prefix.trim()
        ? req.body.prefix.trim()
        : "uploads";

    const file = await uploadImage(req.file, { prefix });

    return ApiResponse.success(res, {
      statusCode: HTTP.CREATED,
      message: "Image uploaded successfully",
      data: {
        file,
      },
    });
  },
};
