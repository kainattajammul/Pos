import { authenticateUnlessDev } from "./branchAccess.middleware.js";
import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { env } from "../config/env.js";
import { resolveBranchContext } from "./supabaseAuth.middleware.js";
import { authorize } from "../services/branchAuthorization.service.js";

export function authenticateRequest(req, res, next) {
  return authenticateUnlessDev(req, res, next);
}

export async function requireBranchContext(req, _res, next) {
  try {
    await resolveBranchContext(req);
    next();
  } catch (error) {
    next(error);
  }
}

export function requireBranchPermission(permissionKey) {
  return async (req, _res, next) => {
    try {
      if (!req.authContext) await resolveBranchContext(req);
      if (req.authContext.devBypass || env.devAuthBypass) return next();

      await authorize(req.authContext.userId, req.branchId, req.shopId, permissionKey, {
        shopPermissions: req.authContext.shopPermissions,
      });
      next();
    } catch (error) {
      next(error);
    }
  };
}

