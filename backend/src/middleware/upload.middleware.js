import multer from "multer";
import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});

export const repairCategoryImageUpload = upload.single("image");

export function handleMulterError(err, _req, _res, next) {
  if (!err) return next();

  if (err.code === "LIMIT_FILE_SIZE") {
    return next(new ApiError(HTTP.BAD_REQUEST, "Image must be 5 MB or smaller"));
  }

  return next(
    err instanceof ApiError
      ? err
      : new ApiError(HTTP.BAD_REQUEST, err.message || "Invalid file upload"),
  );
}
