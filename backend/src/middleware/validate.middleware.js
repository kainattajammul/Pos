import { validationResult } from "express-validator";
import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";

export function validateRequest(req, _res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const errors = result.array().map((item) => ({
      path: item.path,
      message: item.msg,
    }));
    return next(new ApiError(HTTP.BAD_REQUEST, "Validation failed", errors));
  }
  next();
}
