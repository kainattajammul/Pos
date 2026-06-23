import { BRANCH_REPORTING_PERMISSIONS as P } from "../constants/branchReportingPermissions.js";
import { getEffectivePermissions } from "./branchAuthorization.service.js";

function has(permissions, key) {
  return permissions.includes("*") || permissions.includes(key);
}

export async function resolveReportingPermissions(userId, branchId, shopId, authContext = {}) {
  const effective = await getEffectivePermissions(userId, branchId, shopId, {
    shopPermissions: authContext.shopPermissions,
    isSuperAdmin: authContext.isSuperAdmin,
  });
  const perms = effective.permissions;

  return {
    permissions: perms,
    viewFinancials: has(perms, P.PERFORMANCE_DASHBOARD_VIEW_FINANCIALS) || has(perms, P.PROFIT_REPORTS_VIEW),
    viewCosts: has(perms, P.SALES_REPORTS_VIEW_COSTS),
    viewValuation: has(perms, P.INVENTORY_REPORTS_VIEW_VALUATION),
    viewProviderDetails: has(perms, P.PAYMENT_REPORTS_VIEW_PROVIDER),
    viewDiscrepancies: has(perms, P.CASH_DRAWER_REPORTS_VIEW_DISCREPANCIES),
    viewAllStaff: has(perms, P.STAFF_PERFORMANCE_REPORTS_VIEW_ALL),
    canCompareBranches: has(perms, P.COMPARISON_REPORTS_VIEW),
    availableActions: {
      canView: has(perms, P.REPORTS_VIEW),
      canExport: has(perms, P.REPORTS_EXPORT),
      canViewCosts: has(perms, P.SALES_REPORTS_VIEW_COSTS),
      canViewFinancials: has(perms, P.PERFORMANCE_DASHBOARD_VIEW_FINANCIALS),
      canCompareBranches: has(perms, P.COMPARISON_REPORTS_VIEW),
      canViewValuation: has(perms, P.INVENTORY_REPORTS_VIEW_VALUATION),
      canViewDiscrepancies: has(perms, P.CASH_DRAWER_REPORTS_VIEW_DISCREPANCIES),
    },
  };
}

export function listReportsForPermissions(reportingPermissions) {
  const perms = reportingPermissions.permissions ?? [];
  const map = {};
  for (const key of Object.values(P)) {
    map[key] = has(perms, key);
  }
  map.all = perms.includes("*");
  return map;
}
