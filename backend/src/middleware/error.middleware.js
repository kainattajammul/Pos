import { Prisma } from "@prisma/client";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { HTTP } from "../constants/httpStatus.js";

export function notFoundHandler(_req, res) {
  return ApiResponse.error(res, {
    statusCode: HTTP.NOT_FOUND,
    message: "Route not found",
  });
}

export function errorHandler(err, _req, res, _next) {
  if (err instanceof ApiError) {
    return ApiResponse.error(res, {
      statusCode: err.statusCode,
      message: err.message,
      errors: err.errors,
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return ApiResponse.error(res, {
        statusCode: HTTP.CONFLICT,
        message: "A record with this value already exists",
      });
    }
  }

  console.error(err);
  return ApiResponse.error(res, {
    statusCode: HTTP.INTERNAL,
    message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
}
