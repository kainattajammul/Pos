import { Router } from "express";
import { BranchReportingController as C } from "../controllers/branchReporting.controller.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  authenticateRequest,
  requireBranchContext,
  requireBranchPermission,
} from "../middleware/branchStaffAccess.middleware.js";
import { attachReportingPermissions } from "../middleware/branchReportingAccess.middleware.js";
import { BRANCH_REPORTING_PERMISSIONS as P } from "../constants/branchReportingPermissions.js";
import {
  branchReportingContextRules,
  createExportRules,
  exportUuidParam,
  reportQueryRules,
  reportingSettingsUpdateRules,
} from "../validators/branchReporting.validator.js";

const router = Router({ mergeParams: true });
router.use(authenticateRequest, requireBranchContext, attachReportingPermissions);

router.get("/reporting-settings", requireBranchPermission(P.REPORTING_VIEW), branchReportingContextRules, validateRequest, asyncHandler(C.getReportingSettings));
router.patch("/reporting-settings", requireBranchPermission(P.REPORTING_MANAGE), reportingSettingsUpdateRules, validateRequest, asyncHandler(C.updateReportingSettings));

router.get("/reports", requireBranchPermission(P.REPORTS_VIEW), branchReportingContextRules, validateRequest, asyncHandler(C.listReports));
router.get("/reports/filters", requireBranchPermission(P.REPORTS_VIEW), branchReportingContextRules, validateRequest, asyncHandler(C.getReportFilters));

router.get("/reports/performance-dashboard", requireBranchPermission(P.PERFORMANCE_DASHBOARD_VIEW), reportQueryRules, validateRequest, asyncHandler(C.getPerformanceDashboard));
router.get("/reports/performance-dashboard/charts", requireBranchPermission(P.PERFORMANCE_DASHBOARD_VIEW), reportQueryRules, validateRequest, asyncHandler(C.getPerformanceDashboardCharts));
router.get("/reports/performance-dashboard/comparison", requireBranchPermission(P.PERFORMANCE_DASHBOARD_VIEW), reportQueryRules, validateRequest, asyncHandler(C.getPerformanceDashboardComparison));

router.get("/reports/sales", requireBranchPermission(P.SALES_REPORTS_VIEW), reportQueryRules, validateRequest, asyncHandler(C.getSalesReport));
router.get("/reports/sales/summary", requireBranchPermission(P.SALES_REPORTS_VIEW), reportQueryRules, validateRequest, asyncHandler(C.getSalesSummary));
router.get("/reports/sales/trend", requireBranchPermission(P.SALES_REPORTS_VIEW), reportQueryRules, validateRequest, asyncHandler(C.getSalesTrend));
router.get("/reports/sales/by-product", requireBranchPermission(P.SALES_REPORTS_VIEW), reportQueryRules, validateRequest, asyncHandler(C.getSalesByProduct));
router.get("/reports/sales/by-channel", requireBranchPermission(P.SALES_REPORTS_VIEW), reportQueryRules, validateRequest, asyncHandler(C.getSalesByChannel));
router.get("/reports/sales/by-staff", requireBranchPermission(P.SALES_REPORTS_VIEW), reportQueryRules, validateRequest, asyncHandler(C.getSalesByStaff));

router.get("/reports/repairs", requireBranchPermission(P.REPAIR_REPORTS_VIEW), reportQueryRules, validateRequest, asyncHandler(C.getRepairReport));
router.get("/reports/repairs/summary", requireBranchPermission(P.REPAIR_REPORTS_VIEW), reportQueryRules, validateRequest, asyncHandler(C.getRepairSummary));
router.get("/reports/repairs/trend", requireBranchPermission(P.REPAIR_REPORTS_VIEW), reportQueryRules, validateRequest, asyncHandler(C.getRepairTrend));
router.get("/reports/repairs/by-status", requireBranchPermission(P.REPAIR_REPORTS_VIEW), reportQueryRules, validateRequest, asyncHandler(C.getRepairsByStatus));
router.get("/reports/repairs/by-technician", requireBranchPermission(P.REPAIR_REPORTS_VIEW), reportQueryRules, validateRequest, asyncHandler(C.getRepairsByTechnician));

router.get("/reports/inventory", requireBranchPermission(P.INVENTORY_REPORTS_VIEW), reportQueryRules, validateRequest, asyncHandler(C.getInventoryReport));
router.get("/reports/inventory/summary", requireBranchPermission(P.INVENTORY_REPORTS_VIEW), reportQueryRules, validateRequest, asyncHandler(C.getInventorySummary));
router.get("/reports/inventory/valuation", requireBranchPermission(P.INVENTORY_REPORTS_VIEW_VALUATION), branchReportingContextRules, validateRequest, asyncHandler(C.getInventoryValuation));
router.get("/reports/inventory/by-category", requireBranchPermission(P.INVENTORY_REPORTS_VIEW), branchReportingContextRules, validateRequest, asyncHandler(C.getInventoryByCategory));
router.get("/reports/inventory/low-stock", requireBranchPermission(P.INVENTORY_REPORTS_VIEW), reportQueryRules, validateRequest, asyncHandler(C.getLowStockReport));
router.get("/reports/inventory/movements", requireBranchPermission(P.INVENTORY_REPORTS_VIEW), reportQueryRules, validateRequest, asyncHandler(C.getInventoryMovements));

router.get("/reports/payments", requireBranchPermission(P.PAYMENT_REPORTS_VIEW), reportQueryRules, validateRequest, asyncHandler(C.getPaymentReport));
router.get("/reports/payments/summary", requireBranchPermission(P.PAYMENT_REPORTS_VIEW), reportQueryRules, validateRequest, asyncHandler(C.getPaymentSummary));
router.get("/reports/payments/by-method", requireBranchPermission(P.PAYMENT_REPORTS_VIEW), reportQueryRules, validateRequest, asyncHandler(C.getPaymentsByMethod));
router.get("/reports/payments/by-status", requireBranchPermission(P.PAYMENT_REPORTS_VIEW), reportQueryRules, validateRequest, asyncHandler(C.getPaymentsByStatus));
router.get("/reports/payments/refunds", requireBranchPermission(P.PAYMENT_REPORTS_VIEW), reportQueryRules, validateRequest, asyncHandler(C.getPaymentRefunds));
router.get("/reports/payments/outstanding", requireBranchPermission(P.PAYMENT_REPORTS_VIEW), branchReportingContextRules, validateRequest, asyncHandler(C.getOutstandingPayments));

router.get("/reports/cash-drawers", requireBranchPermission(P.CASH_DRAWER_REPORTS_VIEW), reportQueryRules, validateRequest, asyncHandler(C.getCashDrawerReport));
router.get("/reports/cash-drawers/summary", requireBranchPermission(P.CASH_DRAWER_REPORTS_VIEW), reportQueryRules, validateRequest, asyncHandler(C.getCashDrawerSummary));
router.get("/reports/cash-drawers/sessions", requireBranchPermission(P.CASH_DRAWER_REPORTS_VIEW), reportQueryRules, validateRequest, asyncHandler(C.getCashDrawerSessions));
router.get("/reports/cash-drawers/discrepancies", requireBranchPermission(P.CASH_DRAWER_REPORTS_VIEW_DISCREPANCIES), reportQueryRules, validateRequest, asyncHandler(C.getCashDrawerDiscrepancies));
router.get("/reports/cash-drawers/end-of-day", requireBranchPermission(P.CASH_DRAWER_REPORTS_VIEW), reportQueryRules, validateRequest, asyncHandler(C.getEndOfDayReport));

router.get("/reports/staff-performance", requireBranchPermission(P.STAFF_PERFORMANCE_REPORTS_VIEW), reportQueryRules, validateRequest, asyncHandler(C.getStaffPerformanceReport));
router.get("/reports/staff-performance/summary", requireBranchPermission(P.STAFF_PERFORMANCE_REPORTS_VIEW), reportQueryRules, validateRequest, asyncHandler(C.getStaffPerformanceSummary));
router.get("/reports/staff-performance/ranking", requireBranchPermission(P.STAFF_PERFORMANCE_REPORTS_VIEW), reportQueryRules, validateRequest, asyncHandler(C.getStaffPerformanceRanking));

router.get("/reports/profit-loss", requireBranchPermission(P.PROFIT_REPORTS_VIEW), reportQueryRules, validateRequest, asyncHandler(C.getProfitLossReport));

router.post("/reports/exports", requireBranchPermission(P.REPORTS_EXPORT), createExportRules, validateRequest, asyncHandler(C.createExport));
router.get("/reports/exports", requireBranchPermission(P.REPORTS_EXPORT), reportQueryRules, validateRequest, asyncHandler(C.listExports));
router.get("/reports/exports/:exportUuid", requireBranchPermission(P.REPORTS_EXPORT), exportUuidParam, validateRequest, asyncHandler(C.getExport));
router.get("/reports/exports/:exportUuid/download", requireBranchPermission(P.REPORTS_EXPORT), exportUuidParam, validateRequest, asyncHandler(C.downloadExport));

export default router;
