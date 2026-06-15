import { Router } from "express";
import { BranchFinanceController as C } from "../controllers/branchFinance.controller.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  authenticateRequest,
  requireBranchContext,
  requireBranchPermission,
} from "../middleware/branchStaffAccess.middleware.js";
import { BRANCH_FINANCE_PERMISSIONS as P } from "../constants/branchFinancePermissions.js";
import {
  branchFinanceContextRules,
  cashMovementRules,
  closeSessionRules,
  createExpenseRules,
  createInvoiceRules,
  createPaymentRules,
  createRefundRules,
  createRegisterRules,
  financeSettingsUpdateRules,
  listQueryRules,
  openSessionRules,
  uuidParam,
} from "../validators/branchFinance.validator.js";

const router = Router({ mergeParams: true });
router.use(authenticateRequest, requireBranchContext);

router.get("/finance-settings", requireBranchPermission(P.FINANCE_VIEW), branchFinanceContextRules, validateRequest, asyncHandler(C.getFinanceSettings));
router.patch("/finance-settings", requireBranchPermission(P.FINANCE_MANAGE), financeSettingsUpdateRules, validateRequest, asyncHandler(C.updateFinanceSettings));

router.get("/registers", requireBranchPermission(P.REGISTERS_VIEW), listQueryRules, validateRequest, asyncHandler(C.listRegisters));
router.post("/registers", requireBranchPermission(P.REGISTERS_MANAGE), createRegisterRules, validateRequest, asyncHandler(C.createRegister));
router.patch("/registers/:registerUuid", requireBranchPermission(P.REGISTERS_MANAGE), uuidParam("registerUuid"), validateRequest, asyncHandler(C.updateRegister));
router.post("/registers/:registerUuid/archive", requireBranchPermission(P.REGISTERS_MANAGE), uuidParam("registerUuid"), validateRequest, asyncHandler(C.archiveRegister));

router.get("/register-sessions", requireBranchPermission(P.REGISTER_SESSIONS_VIEW), listQueryRules, validateRequest, asyncHandler(C.listRegisterSessions));
router.get("/register-sessions/current", requireBranchPermission(P.REGISTER_SESSIONS_VIEW), branchFinanceContextRules, validateRequest, asyncHandler(C.getCurrentSessions));
router.post("/register-sessions/open", requireBranchPermission(P.REGISTER_SESSIONS_OPEN), openSessionRules, validateRequest, asyncHandler(C.openRegisterSession));
router.post("/register-sessions/:sessionUuid/close", requireBranchPermission(P.REGISTER_SESSIONS_CLOSE), closeSessionRules, validateRequest, asyncHandler(C.closeRegisterSession));
router.post("/register-sessions/:sessionUuid/force-close", requireBranchPermission(P.REGISTER_SESSIONS_FORCE_CLOSE), closeSessionRules, validateRequest, asyncHandler(C.forceCloseRegisterSession));
router.post("/register-sessions/:sessionUuid/cash-in", requireBranchPermission(P.REGISTER_SESSIONS_CASH_IN), cashMovementRules, validateRequest, asyncHandler(C.recordCashMovement));
router.post("/register-sessions/:sessionUuid/cash-out", requireBranchPermission(P.REGISTER_SESSIONS_CASH_OUT), cashMovementRules, validateRequest, asyncHandler(C.recordCashMovement));
router.post("/register-sessions/:sessionUuid/safe-drop", requireBranchPermission(P.REGISTER_SESSIONS_CASH_OUT), cashMovementRules, validateRequest, asyncHandler(C.recordCashMovement));

router.get("/payment-settings", requireBranchPermission(P.PAYMENT_SETTINGS_VIEW), branchFinanceContextRules, validateRequest, asyncHandler(C.getPaymentSettings));
router.patch("/payment-settings", requireBranchPermission(P.PAYMENT_SETTINGS_MANAGE), branchFinanceContextRules, validateRequest, asyncHandler(C.updatePaymentSettings));

router.get("/payments", requireBranchPermission(P.PAYMENTS_VIEW), listQueryRules, validateRequest, asyncHandler(C.listPayments));
router.post("/payments", requireBranchPermission(P.PAYMENTS_CREATE), createPaymentRules, validateRequest, asyncHandler(C.createPayment));
router.post("/payments/:paymentUuid/void", requireBranchPermission(P.PAYMENTS_VOID), uuidParam("paymentUuid"), validateRequest, asyncHandler(C.voidPayment));

router.get("/refunds", requireBranchPermission(P.REFUNDS_VIEW), listQueryRules, validateRequest, asyncHandler(C.listRefunds));
router.post("/refunds", requireBranchPermission(P.REFUNDS_REQUEST), createRefundRules, validateRequest, asyncHandler(C.createRefund));
router.post("/refunds/:refundUuid/approve", requireBranchPermission(P.REFUNDS_APPROVE), uuidParam("refundUuid"), validateRequest, asyncHandler(C.approveRefund));
router.post("/refunds/:refundUuid/reject", requireBranchPermission(P.REFUNDS_REJECT), uuidParam("refundUuid"), validateRequest, asyncHandler(C.rejectRefund));
router.post("/refunds/:refundUuid/process", requireBranchPermission(P.REFUNDS_PROCESS), uuidParam("refundUuid"), validateRequest, asyncHandler(C.processRefund));

router.get("/invoices", requireBranchPermission(P.INVOICES_VIEW), listQueryRules, validateRequest, asyncHandler(C.listInvoices));
router.post("/invoices", requireBranchPermission(P.INVOICES_CREATE), createInvoiceRules, validateRequest, asyncHandler(C.createInvoice));
router.get("/invoices/:invoiceUuid", requireBranchPermission(P.INVOICES_VIEW), uuidParam("invoiceUuid"), validateRequest, asyncHandler(C.getInvoice));
router.post("/invoices/:invoiceUuid/issue", requireBranchPermission(P.INVOICES_ISSUE), uuidParam("invoiceUuid"), validateRequest, asyncHandler(C.issueInvoice));
router.post("/invoices/:invoiceUuid/void", requireBranchPermission(P.INVOICES_VOID), uuidParam("invoiceUuid"), validateRequest, asyncHandler(C.voidInvoice));

router.get("/tax-profile", requireBranchPermission(P.TAX_VIEW), branchFinanceContextRules, validateRequest, asyncHandler(C.getTaxProfile));
router.patch("/tax-profile", requireBranchPermission(P.TAX_MANAGE), branchFinanceContextRules, validateRequest, asyncHandler(C.updateTaxProfile));
router.get("/tax-rates", requireBranchPermission(P.TAX_VIEW), branchFinanceContextRules, validateRequest, asyncHandler(C.listTaxRates));
router.post("/tax-rates", requireBranchPermission(P.TAX_MANAGE), branchFinanceContextRules, validateRequest, asyncHandler(C.createTaxRate));

router.get("/end-of-day", requireBranchPermission(P.END_OF_DAY_VIEW), listQueryRules, validateRequest, asyncHandler(C.listEndOfDay));
router.post("/end-of-day/generate", requireBranchPermission(P.END_OF_DAY_GENERATE), branchFinanceContextRules, validateRequest, asyncHandler(C.generateEndOfDay));
router.post("/end-of-day/:closingUuid/close", requireBranchPermission(P.END_OF_DAY_CLOSE), uuidParam("closingUuid"), validateRequest, asyncHandler(C.closeEndOfDay));

router.get("/expenses", requireBranchPermission(P.EXPENSES_VIEW), listQueryRules, validateRequest, asyncHandler(C.listExpenses));
router.post("/expenses", requireBranchPermission(P.EXPENSES_CREATE), createExpenseRules, validateRequest, asyncHandler(C.createExpense));
router.post("/expenses/:expenseUuid/submit", requireBranchPermission(P.EXPENSES_UPDATE), uuidParam("expenseUuid"), validateRequest, asyncHandler(C.submitExpense));
router.post("/expenses/:expenseUuid/approve", requireBranchPermission(P.EXPENSES_APPROVE), uuidParam("expenseUuid"), validateRequest, asyncHandler(C.approveExpense));

router.get("/profit-loss", requireBranchPermission(P.PROFIT_LOSS_VIEW), branchFinanceContextRules, validateRequest, asyncHandler(C.getProfitLoss));

export default router;
