import * as ReportingSettingsService from "../services/branchReportingSettings.service.js";
import * as ReportRegistryService from "../services/branchReportRegistry.service.js";
import * as DashboardService from "../services/branchPerformanceDashboard.service.js";
import * as SalesReportService from "../services/branchSalesReport.service.js";
import * as RepairReportService from "../services/branchRepairReport.service.js";
import * as InventoryReportService from "../services/branchInventoryReport.service.js";
import * as PaymentReportService from "../services/branchPaymentReport.service.js";
import * as CashDrawerReportService from "../services/branchCashDrawerReport.service.js";
import * as StaffPerformanceService from "../services/branchStaffPerformanceReport.service.js";
import * as ExportService from "../services/branchReportExport.service.js";
import { getProfitLoss } from "../services/branchProfitLoss.service.js";
import { writeAuditLog } from "../services/auditLog.service.js";
import { getClientMeta } from "../utils/branchHelpers.js";
import { listReportsForPermissions } from "../services/branchReportAuthorization.service.js";

function ctx(req) {
  return {
    shopId: req.shopId,
    branchId: req.branchId,
    branchUuid: req.params.branchUuid,
    userId: req.authContext?.userId ?? req.user?.id,
    req,
  };
}

async function auditReportView(req, reportCode) {
  const { shopId, branchId, userId, req: httpReq } = ctx(req);
  await writeAuditLog({
    shopId,
    branchId,
    userId,
    action: "branch_report.viewed",
    entity: "branch_report",
    entityId: reportCode,
    newValues: { filters: httpReq.query },
    ...getClientMeta(httpReq),
  });
}

export const BranchReportingController = {
  async getReportingSettings(req, res) {
    const data = await ReportingSettingsService.getReportingSettings(ctx(req));
    res.json({ success: true, data });
  },

  async updateReportingSettings(req, res) {
    const data = await ReportingSettingsService.updateReportingSettings({
      ...ctx(req),
      input: req.body,
    });
    res.json({ success: true, data });
  },

  async listReports(req, res) {
    const permMap = listReportsForPermissions(req.reportingPermissions ?? {});
    const data = ReportRegistryService.listAvailableReports(permMap);
    res.json({
      success: true,
      data,
      availableActions: req.reportingPermissions?.availableActions ?? {},
    });
  },

  async getReportFilters(req, res) {
    const data = ReportRegistryService.getReportFilters();
    res.json({ success: true, data });
  },

  async getPerformanceDashboard(req, res) {
    await auditReportView(req, "BRANCH_PERFORMANCE");
    const includeFinancials = Boolean(req.reportingPermissions?.viewFinancials);
    const data = await DashboardService.getPerformanceDashboard({
      ...ctx(req),
      query: req.query,
      includeFinancials,
    });
    res.json({
      success: true,
      data,
      warnings: data.warnings ?? [],
      availableActions: req.reportingPermissions?.availableActions ?? {},
    });
  },

  async getPerformanceDashboardCharts(req, res) {
    const data = await DashboardService.getPerformanceDashboardCharts({ ...ctx(req), query: req.query });
    res.json({ success: true, data, warnings: data.warnings ?? [] });
  },

  async getPerformanceDashboardComparison(req, res) {
    const data = await DashboardService.getPerformanceDashboardComparison({ ...ctx(req), query: req.query });
    res.json({ success: true, data, warnings: data.warnings ?? [] });
  },

  async getSalesReport(req, res) {
    await auditReportView(req, "BRANCH_SALES");
    const includeCosts = Boolean(req.reportingPermissions?.viewCosts);
    const result = await SalesReportService.getSalesReport({
      ...ctx(req),
      query: req.query,
      includeCosts,
    });
    res.json({ success: true, ...result });
  },

  async getSalesTrend(req, res) {
    const data = await SalesReportService.getSalesTrend({ ...ctx(req), query: req.query });
    res.json({ success: true, data });
  },

  async getSalesByProduct(req, res) {
    const result = await SalesReportService.getSalesByProduct({ ...ctx(req), query: req.query });
    res.json({ success: true, ...result });
  },

  async getSalesSummary(req, res) {
    const result = await SalesReportService.getSalesReportSummary({
      ...ctx(req),
      query: req.query,
      includeCosts: Boolean(req.reportingPermissions?.viewCosts),
    });
    res.json({ success: true, ...result });
  },

  async getSalesByChannel(req, res) {
    const result = await SalesReportService.getSalesByChannel({ ...ctx(req), query: req.query });
    res.json({ success: true, ...result });
  },

  async getSalesByStaff(req, res) {
    const result = await SalesReportService.getSalesByStaff({ ...ctx(req), query: req.query });
    res.json({ success: true, ...result });
  },

  async getRepairReport(req, res) {
    await auditReportView(req, "BRANCH_REPAIRS");
    const result = await RepairReportService.getRepairReport({ ...ctx(req), query: req.query });
    res.json({ success: true, ...result });
  },

  async getRepairsByTechnician(req, res) {
    const result = await RepairReportService.getRepairsByTechnician({ ...ctx(req), query: req.query });
    res.json({ success: true, ...result });
  },

  async getRepairSummary(req, res) {
    const result = await RepairReportService.getRepairSummary({ ...ctx(req), query: req.query });
    res.json({ success: true, ...result });
  },

  async getRepairTrend(req, res) {
    const result = await RepairReportService.getRepairTrend({ ...ctx(req), query: req.query });
    res.json({ success: true, ...result });
  },

  async getRepairsByStatus(req, res) {
    const result = await RepairReportService.getRepairsByStatus({ ...ctx(req), query: req.query });
    res.json({ success: true, ...result });
  },

  async getInventoryReport(req, res) {
    await auditReportView(req, "BRANCH_INVENTORY");
    const includeValuation = Boolean(req.reportingPermissions?.viewValuation);
    const result = await InventoryReportService.getInventoryReport({
      ...ctx(req),
      query: req.query,
      includeValuation,
    });
    res.json({ success: true, ...result });
  },

  async getInventoryValuation(req, res) {
    const result = await InventoryReportService.getInventoryValuation({ ...ctx(req) });
    res.json({ success: true, ...result });
  },

  async getLowStockReport(req, res) {
    const result = await InventoryReportService.getLowStockReport({ ...ctx(req), query: req.query });
    res.json({ success: true, ...result });
  },

  async getInventorySummary(req, res) {
    const result = await InventoryReportService.getInventorySummary({
      ...ctx(req),
      query: req.query,
      includeValuation: Boolean(req.reportingPermissions?.viewValuation),
    });
    res.json({ success: true, ...result });
  },

  async getInventoryByCategory(req, res) {
    const result = await InventoryReportService.getInventoryByCategory({ ...ctx(req) });
    res.json({ success: true, ...result });
  },

  async getInventoryMovements(req, res) {
    const result = await InventoryReportService.getInventoryMovements({ ...ctx(req), query: req.query });
    res.json({ success: true, ...result });
  },

  async getPaymentReport(req, res) {
    await auditReportView(req, "BRANCH_PAYMENTS");
    const result = await PaymentReportService.getPaymentReport({ ...ctx(req), query: req.query });
    res.json({ success: true, ...result });
  },

  async getPaymentRefunds(req, res) {
    const result = await PaymentReportService.getPaymentRefunds({ ...ctx(req), query: req.query });
    res.json({ success: true, ...result });
  },

  async getOutstandingPayments(req, res) {
    const result = await PaymentReportService.getOutstandingPayments({ ...ctx(req) });
    res.json({ success: true, ...result });
  },

  async getPaymentSummary(req, res) {
    const result = await PaymentReportService.getPaymentSummary({ ...ctx(req), query: req.query });
    res.json({ success: true, ...result });
  },

  async getPaymentsByMethod(req, res) {
    const result = await PaymentReportService.getPaymentsByMethod({ ...ctx(req), query: req.query });
    res.json({ success: true, ...result });
  },

  async getPaymentsByStatus(req, res) {
    const result = await PaymentReportService.getPaymentsByStatus({ ...ctx(req), query: req.query });
    res.json({ success: true, ...result });
  },

  async getCashDrawerReport(req, res) {
    await auditReportView(req, "BRANCH_CASH_DRAWER");
    const result = await CashDrawerReportService.getCashDrawerReport({ ...ctx(req), query: req.query });
    res.json({ success: true, ...result });
  },

  async getCashDrawerDiscrepancies(req, res) {
    const result = await CashDrawerReportService.getCashDrawerDiscrepancies({ ...ctx(req), query: req.query });
    res.json({ success: true, ...result });
  },

  async getEndOfDayReport(req, res) {
    const result = await CashDrawerReportService.getEndOfDayReport({ ...ctx(req), query: req.query });
    res.json({ success: true, ...result });
  },

  async getCashDrawerSummary(req, res) {
    const result = await CashDrawerReportService.getCashDrawerReport({ ...ctx(req), query: req.query });
    res.json({ success: true, hasData: result.hasData, summary: result.summary, meta: result.meta, warnings: result.warnings });
  },

  async getCashDrawerSessions(req, res) {
    const result = await CashDrawerReportService.getCashDrawerReport({ ...ctx(req), query: req.query });
    res.json({ success: true, hasData: result.hasData, records: result.records, meta: result.meta, warnings: result.warnings });
  },

  async getStaffPerformanceReport(req, res) {
    await auditReportView(req, "BRANCH_STAFF_PERFORMANCE");
    const result = await StaffPerformanceService.getStaffPerformanceReport({ ...ctx(req), query: req.query });
    res.json({ success: true, ...result });
  },

  async getStaffPerformanceRanking(req, res) {
    const result = await StaffPerformanceService.getStaffPerformanceRanking({ ...ctx(req), query: req.query });
    res.json({ success: true, ...result });
  },

  async getStaffPerformanceSummary(req, res) {
    const result = await StaffPerformanceService.getStaffPerformanceReport({ ...ctx(req), query: req.query });
    res.json({ success: true, hasData: result.hasData, summary: result.summary, meta: result.meta, warnings: result.warnings });
  },

  async getProfitLossReport(req, res) {
    await auditReportView(req, "BRANCH_PROFIT_LOSS");
    const data = await getProfitLoss({ ...ctx(req), query: req.query });
    res.json({ success: true, data });
  },

  async createExport(req, res) {
    const data = await ExportService.createReportExport({ ...ctx(req), input: req.body });
    res.status(201).json({ success: true, data });
  },

  async listExports(req, res) {
    const result = await ExportService.listReportExports({ ...ctx(req), query: req.query });
    res.json({ success: true, ...result });
  },

  async getExport(req, res) {
    const data = await ExportService.getReportExport({
      ...ctx(req),
      exportUuid: req.params.exportUuid,
    });
    res.json({ success: true, data });
  },

  async downloadExport(req, res) {
    const data = await ExportService.downloadReportExport({
      ...ctx(req),
      exportUuid: req.params.exportUuid,
    });
    res.json({ success: true, data });
  },
};
