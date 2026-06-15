import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { verifyAccessToken } from "../utils/jwt.js";
/**
 * Protects routes — requires Authorization: Bearer <accessToken>
 * Validates JWT; loads user from DB when available.
 */
export async function authenticate(req, _res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new ApiError(HTTP.UNAUTHORIZED, "Access token required");
    }

    const token = header.slice(7);
    const decoded = verifyAccessToken(token);

    if (decoded.devBypass) {
      req.user = {
        id: decoded.userId,
        fullName: decoded.name ?? "Dev User",
        email: decoded.email,
        roleId: 1,
        shopId: null,
        status: "active",
      };
      return next();
    }

    const { prisma, isDatabaseConnected } = await import("../config/database.js");
    if (!isDatabaseConnected()) {
      throw new ApiError(HTTP.SERVICE_UNAVAILABLE, "Database is not connected");
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      throw new ApiError(HTTP.UNAUTHORIZED, "Invalid or inactive user");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) return next(error);
    next(new ApiError(HTTP.UNAUTHORIZED, "Invalid or expired token"));
  }
}
