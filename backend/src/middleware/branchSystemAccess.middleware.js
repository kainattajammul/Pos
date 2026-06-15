import { resolveSystemPermissions } from "../services/branchSystemAuthorization.service.js";

export async function attachSystemPermissions(req, _res, next) {
  try {
    if (!req.authContext) return next();
    req.systemPermissions = await resolveSystemPermissions(
      req.authContext.userId,
      req.branchId,
      req.shopId,
      req.authContext,
    );
    next();
  } catch (error) {
    next(error);
  }
}
