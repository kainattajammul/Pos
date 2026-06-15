export const BRANCH_FINANCE_PERMISSIONS = {
  REGISTERS_VIEW: "branch_registers.view",
  REGISTERS_MANAGE: "branch_registers.manage",

  REGISTER_SESSIONS_VIEW: "branch_register_sessions.view",
  REGISTER_SESSIONS_OPEN: "branch_register_sessions.open",
  REGISTER_SESSIONS_CLOSE: "branch_register_sessions.close",
  REGISTER_SESSIONS_FORCE_CLOSE: "branch_register_sessions.force_close",
  REGISTER_SESSIONS_CASH_IN: "branch_register_sessions.cash_in",
  REGISTER_SESSIONS_CASH_OUT: "branch_register_sessions.cash_out",

  PAYMENT_SETTINGS_VIEW: "branch_payment_settings.view",
  PAYMENT_SETTINGS_MANAGE: "branch_payment_settings.manage",

  PAYMENTS_VIEW: "branch_payments.view",
  PAYMENTS_CREATE: "branch_payments.create",
  PAYMENTS_CAPTURE: "branch_payments.capture",
  PAYMENTS_CANCEL: "branch_payments.cancel",
  PAYMENTS_VOID: "branch_payments.void",

  REFUNDS_VIEW: "branch_refunds.view",
  REFUNDS_REQUEST: "branch_refunds.request",
  REFUNDS_APPROVE: "branch_refunds.approve",
  REFUNDS_REJECT: "branch_refunds.reject",
  REFUNDS_PROCESS: "branch_refunds.process",

  INVOICES_VIEW: "branch_invoices.view",
  INVOICES_CREATE: "branch_invoices.create",
  INVOICES_UPDATE: "branch_invoices.update",
  INVOICES_ISSUE: "branch_invoices.issue",
  INVOICES_SEND: "branch_invoices.send",
  INVOICES_VOID: "branch_invoices.void",

  TAX_VIEW: "branch_tax.view",
  TAX_MANAGE: "branch_tax.manage",

  CURRENCY_VIEW: "branch_currency.view",
  CURRENCY_MANAGE: "branch_currency.manage",

  TIMEZONE_VIEW: "branch_timezone.view",
  TIMEZONE_MANAGE: "branch_timezone.manage",

  END_OF_DAY_VIEW: "branch_end_of_day.view",
  END_OF_DAY_GENERATE: "branch_end_of_day.generate",
  END_OF_DAY_REVIEW: "branch_end_of_day.review",
  END_OF_DAY_APPROVE: "branch_end_of_day.approve",
  END_OF_DAY_CLOSE: "branch_end_of_day.close",
  END_OF_DAY_REOPEN: "branch_end_of_day.reopen",

  CHECKLISTS_VIEW: "branch_checklists.view",
  CHECKLISTS_COMPLETE: "branch_checklists.complete",
  CHECKLISTS_APPROVE: "branch_checklists.approve",

  TARGETS_VIEW: "branch_targets.view",
  TARGETS_MANAGE: "branch_targets.manage",

  COMMISSIONS_VIEW: "branch_commissions.view",
  COMMISSIONS_MANAGE: "branch_commissions.manage",
  COMMISSIONS_APPROVE: "branch_commissions.approve",
  COMMISSIONS_MARK_PAID: "branch_commissions.mark_paid",

  EXPENSES_VIEW: "branch_expenses.view",
  EXPENSES_CREATE: "branch_expenses.create",
  EXPENSES_UPDATE: "branch_expenses.update",
  EXPENSES_APPROVE: "branch_expenses.approve",
  EXPENSES_REJECT: "branch_expenses.reject",
  EXPENSES_MARK_PAID: "branch_expenses.mark_paid",

  PROFIT_LOSS_VIEW: "branch_profit_loss.view",
  PROFIT_LOSS_EXPORT: "branch_profit_loss.export",

  FINANCE_VIEW: "branch_finance.view",
  FINANCE_MANAGE: "branch_finance.manage",
};

export const BRANCH_FINANCE_PERMISSION_SEED = Object.entries(BRANCH_FINANCE_PERMISSIONS).map(
  ([, key]) => ({ key, module: key.split(".")[0] }),
);
