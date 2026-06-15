import { authenticate } from "./auth.middleware.js";
import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { ShopModel } from "../models/shop.model.js";
import { ShopMemberModel } from "../models/branch.model.js";
import { env } from "../config/env.js";

/**
 * Dev bypass skips JWT; production requires authenticate first.
 */
export function authenticateUnlessDev(req, res, next) {
  if (env.devAuthBypass) {
    req.user = req.user ?? { id: null, devBypass: true };
    return next();
  }
  return authenticate(req, res, next);
}

/**
 * Ensures shop exists and user has active membership (unless dev bypass).
 */
export async function requireShopAccess(req, _res, next) {
  try {
    const shopId = Number(req.params.shopId);
    if (!Number.isInteger(shopId) || shopId < 1) {
      throw new ApiError(HTTP.BAD_REQUEST, "Invalid shop id");
    }

    const shop = await ShopModel.findById(shopId);
    if (!shop) throw new ApiError(HTTP.NOT_FOUND, "Shop not found");

    req.shopId = shopId;

    if (req.user?.devBypass || env.devAuthBypass) {
      req.shopPermissions = null;
      return next();
    }

    if (!req.user?.id) {
      throw new ApiError(HTTP.UNAUTHORIZED, "Authentication required");
    }

    const membership = await ShopMemberModel.findActiveMembership(req.user.id, shopId);
    if (!membership) {
      throw new ApiError(HTTP.FORBIDDEN, "You do not have access to this shop");
    }

    req.shopMembership = membership;
    req.shopPermissions = await ShopMemberModel.userPermissionKeys(req.user.id, shopId);
    next();
  } catch (error) {
    next(error);
  }
}

export function requirePermission(permissionKey) {
  return (req, _res, next) => {
    if (req.user?.devBypass || env.devAuthBypass) return next();
    if (!req.shopPermissions?.includes(permissionKey)) {
      return next(new ApiError(HTTP.FORBIDDEN, "Insufficient permissions"));
    }
    return next();
  };
}
