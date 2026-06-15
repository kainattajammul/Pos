import { resolveReportingPermissions } from "../services/branchReportAuthorization.service.js";

export async function attachReportingPermissions(req, _res, next) {
  try {
    if (!req.authContext) return next();
    if (req.authContext.devBypass) {
      req.reportingPermissions = {
        permissions: ["*"],
        viewFinancials: true,
        viewCosts: true,
        viewValuation: true,
        viewProviderDetails: true,
        viewDiscrepancies: true,
        viewAllStaff: true,
        canCompareBranches: true,
        availableActions: {
          canView: true,
          canExport: true,
          canViewCosts: true,
          canViewFinancials: true,
          canCompareBranches: true,
          canViewValuation: true,
          canViewDiscrepancies: true,
        },
      };
      return next();
    }

    req.reportingPermissions = await resolveReportingPermissions(
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
