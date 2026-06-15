import {
  EXPENSE_STATUS_LABELS,
  INVOICE_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  REFUND_STATUS_LABELS,
  REGISTER_SESSION_STATUS_LABELS,
} from "../constants/financeEnums.js";
import { decimalToString } from "../utils/inventoryDecimal.js";

function toApiStatus(status, labels) {
  const value = status.toLowerCase();
  return { value, label: labels[status] ?? status };
}

export function toPublicFinanceSettings(settings, stats, register) {
  return {
    register_id: register?.registerCode ?? "",
    register_uuid: register?.uuid ?? null,
    cash_drawer_assigned: stats.cashDrawerAssigned,
    payments_today: decimalToString(stats.paymentsToday, 2) ?? "0.00",
    refunds_today: decimalToString(stats.refundsToday, 2) ?? "0.00",
    open_invoices: stats.openInvoices,
    vat_rate: settings.vatRateLabel,
    currency: settings.currency,
    timezone: settings.timezone,
    end_of_day_required: settings.endOfDayRequired,
  };
}

export function toPublicRegister(register) {
  const activeSession = register.sessions?.[0] ?? null;
  return {
    id: register.uuid,
    register_code: register.registerCode,
    name: register.name,
    description: register.description,
    location: register.location,
    status: register.status.toLowerCase(),
    is_default: register.isDefault,
    device_identifier: register.deviceIdentifier,
    supported_payment_methods: register.supportedPaymentMethods,
    active_session: activeSession
      ? {
          id: activeSession.uuid,
          status: toApiStatus(activeSession.status, REGISTER_SESSION_STATUS_LABELS),
          opened_at: activeSession.openedAt.toISOString(),
        }
      : null,
    cash_drawers: (register.cashDrawers ?? []).map((d) => ({
      id: d.uuid,
      drawer_code: d.drawerCode,
      name: d.name,
      status: d.status.toLowerCase(),
    })),
    created_at: register.createdAt.toISOString(),
    updated_at: register.updatedAt.toISOString(),
  };
}

export function toPublicRegisterSession(session) {
  return {
    id: session.uuid,
    register: session.register
      ? { id: session.register.uuid, code: session.register.registerCode, name: session.register.name }
      : null,
    cash_drawer: session.cashDrawer
      ? { id: session.cashDrawer.uuid, code: session.cashDrawer.drawerCode, name: session.cashDrawer.name }
      : null,
    status: toApiStatus(session.status, REGISTER_SESSION_STATUS_LABELS),
    opening_float: decimalToString(session.openingFloat, 2),
    expected_cash: decimalToString(session.expectedCash, 2),
    counted_cash: decimalToString(session.countedCash, 2),
    cash_difference: decimalToString(session.cashDifference, 2),
    opening_notes: session.openingNotes,
    closing_notes: session.closingNotes,
    discrepancy_reason: session.discrepancyReason,
    opened_at: session.openedAt.toISOString(),
    closed_at: session.closedAt?.toISOString() ?? null,
  };
}

export function toPublicPayment(payment) {
  return {
    id: payment.uuid,
    payment_number: payment.paymentNumber,
    payment_method: {
      value: payment.paymentMethod.toLowerCase(),
      label: PAYMENT_METHOD_LABELS[payment.paymentMethod] ?? payment.paymentMethod,
    },
    status: toApiStatus(payment.status, PAYMENT_STATUS_LABELS),
    amount: decimalToString(payment.amount, 2),
    currency: payment.currency,
    customer: payment.customer
      ? { id: payment.customer.uuid, name: payment.customer.displayName }
      : null,
    sale_id: payment.sale?.uuid ?? null,
    invoice_id: payment.invoice?.uuid ?? null,
    paid_at: payment.paidAt?.toISOString() ?? null,
    created_at: payment.createdAt.toISOString(),
  };
}

export function toPublicRefund(refund) {
  return {
    id: refund.uuid,
    refund_number: refund.refundNumber,
    payment_id: refund.payment?.uuid ?? null,
    refund_method: {
      value: refund.refundMethod.toLowerCase(),
      label: PAYMENT_METHOD_LABELS[refund.refundMethod] ?? refund.refundMethod,
    },
    status: toApiStatus(refund.status, REFUND_STATUS_LABELS),
    amount: decimalToString(refund.amount, 2),
    currency: refund.currency,
    reason: refund.reason,
    requested_at: refund.requestedAt.toISOString(),
    processed_at: refund.processedAt?.toISOString() ?? null,
  };
}

export function toPublicInvoice(invoice) {
  return {
    id: invoice.uuid,
    invoice_number: invoice.invoiceNumber,
    status: toApiStatus(invoice.status, INVOICE_STATUS_LABELS),
    customer: invoice.customer
      ? { id: invoice.customer.uuid, name: invoice.customer.displayName }
      : null,
    issue_date: invoice.issueDate?.toISOString() ?? null,
    due_date: invoice.dueDate?.toISOString() ?? null,
    currency: invoice.currency,
    subtotal: decimalToString(invoice.subtotal, 2),
    discount_total: decimalToString(invoice.discountTotal, 2),
    tax_total: decimalToString(invoice.taxTotal, 2),
    total: decimalToString(invoice.total, 2),
    amount_paid: decimalToString(invoice.amountPaid, 2),
    amount_due: decimalToString(invoice.amountDue, 2),
    line_items: (invoice.lineItems ?? []).map((item) => ({
      id: item.uuid,
      item_type: item.itemType,
      name: item.name,
      quantity: String(item.quantity),
      unit_price: decimalToString(item.unitPrice, 2),
      line_total: decimalToString(item.lineTotal, 2),
    })),
    created_at: invoice.createdAt.toISOString(),
  };
}

export function toPublicExpense(expense) {
  return {
    id: expense.uuid,
    expense_number: expense.expenseNumber,
    category: expense.category,
    supplier: expense.supplier,
    expense_date: expense.expenseDate.toISOString().slice(0, 10),
    description: expense.description,
    subtotal: decimalToString(expense.subtotal, 2),
    tax_amount: decimalToString(expense.taxAmount, 2),
    total: decimalToString(expense.total, 2),
    currency: expense.currency,
    status: toApiStatus(expense.status, EXPENSE_STATUS_LABELS),
    paid_at: expense.paidAt?.toISOString() ?? null,
    created_at: expense.createdAt.toISOString(),
  };
}

export function toPublicPaymentSettings(settings) {
  return {
    cash_enabled: settings.cashEnabled,
    card_enabled: settings.cardEnabled,
    bank_transfer_enabled: settings.bankTransferEnabled,
    paypal_enabled: settings.paypalEnabled,
    apple_pay_enabled: settings.applePayEnabled,
    google_pay_enabled: settings.googlePayEnabled,
    store_credit_enabled: settings.storeCreditEnabled,
    gift_card_enabled: settings.giftCardEnabled,
    split_payments_enabled: settings.splitPaymentsEnabled,
    partial_payments_enabled: settings.partialPaymentsEnabled,
    deferred_payments_enabled: settings.deferredPaymentsEnabled,
    repair_deposits_enabled: settings.repairDepositsEnabled,
    minimum_deposit_percent: decimalToString(settings.minimumDepositPercent, 2),
    maximum_cash_payment: decimalToString(settings.maximumCashPayment, 2),
    refund_to_original_method: settings.refundToOriginalMethod,
    manager_approval_for_refunds: settings.managerApprovalForRefunds,
    manager_approval_for_voids: settings.managerApprovalForVoids,
    automatic_receipts: settings.automaticReceipts,
    receipt_required: settings.receiptRequired,
    require_open_session_for_cash: settings.requireOpenSessionForCash,
  };
}

export function toPublicTaxProfile(profile) {
  return {
    tax_enabled: profile.taxEnabled,
    tax_type: profile.taxType.toLowerCase(),
    registration_name: profile.registrationName,
    vat_number: profile.vatNumber,
    registration_number: profile.registrationNumber,
    default_tax_rate: decimalToString(profile.defaultTaxRate, 2),
    prices_include_tax: profile.pricesIncludeTax,
    tax_label: profile.taxLabel,
    rounding_method: profile.roundingMethod.toLowerCase(),
    country: profile.country,
    tax_region: profile.taxRegion,
    effective_from: profile.effectiveFrom?.toISOString() ?? null,
  };
}

export function toPublicProfitLoss(report) {
  return {
    period_start: report.periodStart,
    period_end: report.periodEnd,
    currency: report.currency,
    gross_revenue: decimalToString(report.grossRevenue, 2),
    net_revenue: decimalToString(report.netRevenue, 2),
    refunds: decimalToString(report.refunds, 2),
    discounts: decimalToString(report.discounts, 2),
    cost_of_goods_sold: report.costOfGoodsSold != null ? decimalToString(report.costOfGoodsSold, 2) : null,
    repair_parts_cost: report.repairPartsCost != null ? decimalToString(report.repairPartsCost, 2) : null,
    operating_expenses: decimalToString(report.operatingExpenses, 2),
    commission_expenses: decimalToString(report.commissionExpenses, 2),
    gross_profit: report.grossProfit != null ? decimalToString(report.grossProfit, 2) : null,
    operating_profit: report.operatingProfit != null ? decimalToString(report.operatingProfit, 2) : null,
    profit_margin_percent: report.profitMarginPercent != null ? decimalToString(report.profitMarginPercent, 2) : null,
    warnings: report.warnings ?? [],
    breakdown: report.breakdown ?? {},
  };
}
