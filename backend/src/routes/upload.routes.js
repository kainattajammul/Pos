import { Router } from "express";
import { UploadController } from "../controllers/upload.controller.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  imageUpload,
  handleMulterError,
} from "../middleware/upload.middleware.js";
import { uploadImageRules } from "../validators/upload.validator.js";

const router = Router();

/** POST /api/v1/upload — multipart field "image", optional body "prefix" */
router.post(
  "/",
  imageUpload,
  handleMulterError,
  uploadImageRules,
  validateRequest,
  asyncHandler(UploadController.upload),
);

export default router;
