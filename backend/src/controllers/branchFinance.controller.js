import * as FinanceSettingsService from "../services/branchFinanceSettings.service.js";
import * as RegisterService from "../services/branchRegister.service.js";
import * as PaymentService from "../services/branchPayment.service.js";
import * as RefundService from "../services/branchRefund.service.js";
import * as InvoiceService from "../services/branchInvoice.service.js";
import * as TaxService from "../services/branchTax.service.js";
import * as EndOfDayService from "../services/branchEndOfDay.service.js";
import * as ExpenseService from "../services/branchExpense.service.js";
import * as ProfitLossService from "../services/branchProfitLoss.service.js";

function ctx(req) {
  return {
    shopId: req.shopId,
    branchUuid: req.params.branchUuid,
    userId: req.authContext?.userId ?? req.user?.id,
    req,
    permissions: req.financePermissions ?? {},
  };
}

export const BranchFinanceController = {
  async getFinanceSettings(req, res) {
    const data = await FinanceSettingsService.getFinanceSettings(ctx(req));
    res.json({ success: true, data });
  },

  async updateFinanceSettings(req, res) {
    const data = await FinanceSettingsService.updateFinanceSettings({ ...ctx(req), input: req.body });
    res.json({ success: true, data });
  },

  async listRegisters(req, res) {
    const result = await RegisterService.listRegisters({ ...ctx(req), query: req.query });
    res.json({ success: true, ...result });
  },

  async createRegister(req, res) {
    const data = await RegisterService.createRegister({ ...ctx(req), input: req.body });
    res.status(201).json({ success: true, data });
  },

  async updateRegister(req, res) {
    const data = await RegisterService.updateRegister({
      ...ctx(req),
      registerUuid: req.params.registerUuid,
      input: req.body,
    });
    res.json({ success: true, data });
  },

  async archiveRegister(req, res) {
    const data = await RegisterService.archiveRegister({
      ...ctx(req),
      registerUuid: req.params.registerUuid,
    });
    res.json({ success: true, data });
  },

  async listRegisterSessions(req, res) {
    const result = await RegisterService.listRegisterSessions({ ...ctx(req), query: req.query });
    res.json({ success: true, ...result });
  },

  async getCurrentSessions(req, res) {
    const data = await RegisterService.getCurrentSessions(ctx(req));
    res.json({ success: true, data });
  },

  async openRegisterSession(req, res) {
    const data = await RegisterService.openRegisterSession({ ...ctx(req), input: req.body });
    res.status(201).json({ success: true, data });
  },

  async closeRegisterSession(req, res) {
    const data = await RegisterService.closeRegisterSession({
      ...ctx(req),
      sessionUuid: req.params.sessionUuid,
      input: req.body,
    });
    res.json({ success: true, data });
  },

  async forceCloseRegisterSession(req, res) {
    const data = await RegisterService.closeRegisterSession({
      ...ctx(req),
      sessionUuid: req.params.sessionUuid,
      input: req.body,
      force: true,
    });
    res.json({ success: true, data });
  },

  async recordCashMovement(req, res) {
    const data = await RegisterService.recordCashMovement({
      ...ctx(req),
      sessionUuid: req.params.sessionUuid,
      input: req.body,
    });
    res.status(201).json({ success: true, data });
  },

  async getPaymentSettings(req, res) {
    const data = await PaymentService.getPaymentSettings(ctx(req));
    res.json({ success: true, data });
  },

  async updatePaymentSettings(req, res) {
    const data = await PaymentService.updatePaymentSettings({ ...ctx(req), input: req.body });
    res.json({ success: true, data });
  },

  async listPayments(req, res) {
    const result = await PaymentService.listPayments({ ...ctx(req), query: req.query });
    res.json({ success: true, ...result });
  },

  async createPayment(req, res) {
    const data = await PaymentService.createPayment({ ...ctx(req), input: req.body });
    res.status(201).json({ success: true, data });
  },

  async voidPayment(req, res) {
    const data = await PaymentService.voidPayment({
      ...ctx(req),
      paymentUuid: req.params.paymentUuid,
      input: req.body,
    });
    res.json({ success: true, data });
  },

  async listRefunds(req, res) {
    const result = await RefundService.listRefunds({ ...ctx(req), query: req.query });
    res.json({ success: true, ...result });
  },

  async createRefund(req, res) {
    const data = await RefundService.createRefund({ ...ctx(req), input: req.body });
    res.status(201).json({ success: true, data });
  },

  async approveRefund(req, res) {
    const data = await RefundService.approveRefund({
      ...ctx(req),
      refundUuid: req.params.refundUuid,
    });
    res.json({ success: true, data });
  },

  async rejectRefund(req, res) {
    const data = await RefundService.rejectRefund({
      ...ctx(req),
      refundUuid: req.params.refundUuid,
      input: req.body,
    });
    res.json({ success: true, data });
  },

  async processRefund(req, res) {
    const data = await RefundService.processRefund({
      ...ctx(req),
      refundUuid: req.params.refundUuid,
      input: req.body,
    });
    res.json({ success: true, data });
  },

  async listInvoices(req, res) {
    const result = await InvoiceService.listInvoices({ ...ctx(req), query: req.query });
    res.json({ success: true, ...result });
  },

  async createInvoice(req, res) {
    const data = await InvoiceService.createInvoice({ ...ctx(req), input: req.body });
    res.status(201).json({ success: true, data });
  },

  async getInvoice(req, res) {
    const data = await InvoiceService.getInvoice({
      ...ctx(req),
      invoiceUuid: req.params.invoiceUuid,
    });
    res.json({ success: true, data });
  },

  async issueInvoice(req, res) {
    const data = await InvoiceService.issueInvoice({
      ...ctx(req),
      invoiceUuid: req.params.invoiceUuid,
    });
    res.json({ success: true, data });
  },

  async voidInvoice(req, res) {
    const data = await InvoiceService.voidInvoice({
      ...ctx(req),
      invoiceUuid: req.params.invoiceUuid,
      input: req.body,
    });
    res.json({ success: true, data });
  },

  async getTaxProfile(req, res) {
    const data = await TaxService.getTaxProfile(ctx(req));
    res.json({ success: true, data });
  },

  async updateTaxProfile(req, res) {
    const data = await TaxService.updateTaxProfile({ ...ctx(req), input: req.body });
    res.json({ success: true, data });
  },

  async listTaxRates(req, res) {
    const data = await TaxService.listTaxRates(ctx(req));
    res.json({ success: true, data });
  },

  async createTaxRate(req, res) {
    const data = await TaxService.createTaxRate({ ...ctx(req), input: req.body });
    res.status(201).json({ success: true, data });
  },

  async listEndOfDay(req, res) {
    const result = await EndOfDayService.listEndOfDay({ ...ctx(req), query: req.query });
    res.json({ success: true, ...result });
  },

  async generateEndOfDay(req, res) {
    const data = await EndOfDayService.generateEndOfDay({ ...ctx(req), input: req.body });
    res.status(201).json({ success: true, data });
  },

  async closeEndOfDay(req, res) {
    const data = await EndOfDayService.closeEndOfDay({
      ...ctx(req),
      closingUuid: req.params.closingUuid,
      input: req.body,
    });
    res.json({ success: true, data });
  },

  async listExpenses(req, res) {
    const result = await ExpenseService.listExpenses({ ...ctx(req), query: req.query });
    res.json({ success: true, ...result });
  },

  async createExpense(req, res) {
    const data = await ExpenseService.createExpense({ ...ctx(req), input: req.body });
    res.status(201).json({ success: true, data });
  },

  async submitExpense(req, res) {
    const data = await ExpenseService.submitExpense({
      ...ctx(req),
      expenseUuid: req.params.expenseUuid,
    });
    res.json({ success: true, data });
  },

  async approveExpense(req, res) {
    const data = await ExpenseService.approveExpense({
      ...ctx(req),
      expenseUuid: req.params.expenseUuid,
    });
    res.json({ success: true, data });
  },

  async getProfitLoss(req, res) {
    const data = await ProfitLossService.getProfitLoss({ ...ctx(req), query: req.query });
    res.json({ success: true, data });
  },
};
