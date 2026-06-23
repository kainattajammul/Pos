-- Module 5: Branch Payments, Register & Finance

CREATE TYPE "BranchRegisterStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE', 'ARCHIVED');
CREATE TYPE "BranchCashDrawerStatus" AS ENUM ('AVAILABLE', 'ASSIGNED', 'IN_USE', 'MAINTENANCE', 'ARCHIVED');
CREATE TYPE "BranchRegisterSessionStatus" AS ENUM ('OPEN', 'SUSPENDED', 'PENDING_CLOSE', 'CLOSED', 'FORCED_CLOSED');
CREATE TYPE "BranchCashMovementType" AS ENUM (
  'OPENING_FLOAT', 'CASH_SALE', 'CASH_REFUND', 'CASH_IN', 'CASH_OUT',
  'SAFE_DROP', 'PETTY_CASH', 'CORRECTION', 'CLOSING_COUNT'
);
CREATE TYPE "BranchPaymentMethod" AS ENUM (
  'CASH', 'CARD', 'BANK_TRANSFER', 'PAYPAL', 'APPLE_PAY', 'GOOGLE_PAY',
  'STORE_CREDIT', 'GIFT_CARD', 'SPLIT', 'OTHER'
);
CREATE TYPE "BranchPaymentStatus" AS ENUM (
  'PENDING', 'AUTHORISED', 'PAID', 'PARTIALLY_REFUNDED', 'REFUNDED',
  'FAILED', 'CANCELLED', 'VOIDED'
);
CREATE TYPE "BranchRefundStatus" AS ENUM (
  'REQUESTED', 'PENDING_APPROVAL', 'APPROVED', 'PROCESSING', 'COMPLETED',
  'PARTIALLY_COMPLETED', 'REJECTED', 'FAILED', 'CANCELLED'
);
CREATE TYPE "BranchInvoiceStatus" AS ENUM (
  'DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'VOIDED', 'CANCELLED', 'CREDITED'
);
CREATE TYPE "BranchExpenseStatus" AS ENUM (
  'DRAFT', 'SUBMITTED', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'PAID', 'CANCELLED'
);
CREATE TYPE "BranchEndOfDayStatus" AS ENUM (
  'DRAFT', 'PENDING_REVIEW', 'REVIEWED', 'APPROVED', 'CLOSED', 'REOPENED'
);
CREATE TYPE "BranchChecklistType" AS ENUM ('OPENING', 'CLOSING');
CREATE TYPE "BranchChecklistItemType" AS ENUM (
  'CHECKBOX', 'TEXT', 'NUMBER', 'MONEY', 'PHOTO', 'SIGNATURE', 'CONFIRMATION'
);
CREATE TYPE "BranchChecklistRunStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'APPROVED', 'REJECTED');
CREATE TYPE "BranchTargetPeriod" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'CUSTOM');
CREATE TYPE "BranchTargetType" AS ENUM (
  'SALES_REVENUE', 'SALES_COUNT', 'SALES_MARGIN', 'REPAIR_REVENUE',
  'REPAIR_COUNT', 'REPAIR_COMPLETION', 'COMBINED_REVENUE'
);
CREATE TYPE "BranchCommissionRuleType" AS ENUM ('PERCENTAGE', 'FIXED', 'TIERED', 'TARGET_BASED');
CREATE TYPE "BranchCommissionStatus" AS ENUM (
  'CALCULATED', 'PENDING_APPROVAL', 'APPROVED', 'PAID', 'REVERSED', 'CANCELLED'
);
CREATE TYPE "TaxType" AS ENUM ('VAT', 'GST', 'SALES_TAX', 'CUSTOM', 'NONE');
CREATE TYPE "TaxRoundingMethod" AS ENUM ('HALF_UP', 'HALF_DOWN', 'UP', 'DOWN', 'BANKERS');

CREATE TABLE "branch_registers" (
  "id" SERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "branch_id" INTEGER NOT NULL REFERENCES "branches"("id") ON DELETE CASCADE,
  "register_code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "location" TEXT,
  "status" "BranchRegisterStatus" NOT NULL DEFAULT 'ACTIVE',
  "is_default" BOOLEAN NOT NULL DEFAULT false,
  "supported_payment_methods" JSONB,
  "device_identifier" TEXT,
  "archived_at" TIMESTAMP(3),
  "created_by_id" INTEGER,
  "updated_by_id" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "branch_registers_uuid_key" UNIQUE ("uuid"),
  CONSTRAINT "branch_registers_branch_id_register_code_key" UNIQUE ("branch_id", "register_code")
);
CREATE INDEX "branch_registers_shop_id_branch_id_idx" ON "branch_registers"("shop_id", "branch_id");
CREATE INDEX "branch_registers_status_idx" ON "branch_registers"("status");

CREATE TABLE "branch_finance_settings" (
  "id" SERIAL PRIMARY KEY,
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "branch_id" INTEGER NOT NULL UNIQUE REFERENCES "branches"("id") ON DELETE CASCADE,
  "default_register_id" INTEGER REFERENCES "branch_registers"("id") ON DELETE SET NULL,
  "vat_rate" DECIMAL(5,2) NOT NULL DEFAULT 20,
  "vat_rate_label" TEXT NOT NULL DEFAULT '20%',
  "currency" TEXT NOT NULL DEFAULT 'GBP',
  "timezone" TEXT NOT NULL DEFAULT 'Europe/London',
  "end_of_day_required" BOOLEAN NOT NULL DEFAULT true,
  "cash_drawer_required" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "branch_finance_settings_shop_id_idx" ON "branch_finance_settings"("shop_id");

CREATE TABLE "branch_cash_drawers" (
  "id" SERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "branch_id" INTEGER NOT NULL REFERENCES "branches"("id") ON DELETE CASCADE,
  "register_id" INTEGER NOT NULL REFERENCES "branch_registers"("id") ON DELETE CASCADE,
  "drawer_code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "status" "BranchCashDrawerStatus" NOT NULL DEFAULT 'AVAILABLE',
  "last_opened_at" TIMESTAMP(3),
  "last_closed_at" TIMESTAMP(3),
  "archived_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "branch_cash_drawers_uuid_key" UNIQUE ("uuid"),
  CONSTRAINT "branch_cash_drawers_register_id_drawer_code_key" UNIQUE ("register_id", "drawer_code")
);
CREATE INDEX "branch_cash_drawers_shop_id_branch_id_idx" ON "branch_cash_drawers"("shop_id", "branch_id");

CREATE TABLE "branch_register_sessions" (
  "id" SERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "branch_id" INTEGER NOT NULL REFERENCES "branches"("id") ON DELETE CASCADE,
  "register_id" INTEGER NOT NULL REFERENCES "branch_registers"("id") ON DELETE CASCADE,
  "cash_drawer_id" INTEGER NOT NULL REFERENCES "branch_cash_drawers"("id") ON DELETE CASCADE,
  "assigned_staff_id" INTEGER,
  "status" "BranchRegisterSessionStatus" NOT NULL DEFAULT 'OPEN',
  "opening_float" DECIMAL(16,2) NOT NULL DEFAULT 0,
  "expected_cash" DECIMAL(16,2),
  "counted_cash" DECIMAL(16,2),
  "cash_difference" DECIMAL(16,2),
  "opening_notes" TEXT,
  "closing_notes" TEXT,
  "discrepancy_reason" TEXT,
  "opened_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "closed_at" TIMESTAMP(3),
  "opened_by_id" INTEGER,
  "closed_by_id" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "branch_register_sessions_uuid_key" UNIQUE ("uuid")
);
CREATE INDEX "branch_register_sessions_shop_id_branch_id_idx" ON "branch_register_sessions"("shop_id", "branch_id");
CREATE INDEX "branch_register_sessions_register_id_status_idx" ON "branch_register_sessions"("register_id", "status");
CREATE INDEX "branch_register_sessions_cash_drawer_id_status_idx" ON "branch_register_sessions"("cash_drawer_id", "status");
CREATE UNIQUE INDEX "branch_register_sessions_one_open_per_register"
  ON "branch_register_sessions"("register_id")
  WHERE "status" IN ('OPEN', 'SUSPENDED', 'PENDING_CLOSE');

CREATE TABLE "branch_payment_settings" (
  "id" SERIAL PRIMARY KEY,
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "branch_id" INTEGER NOT NULL UNIQUE REFERENCES "branches"("id") ON DELETE CASCADE,
  "cash_enabled" BOOLEAN NOT NULL DEFAULT true,
  "card_enabled" BOOLEAN NOT NULL DEFAULT true,
  "bank_transfer_enabled" BOOLEAN NOT NULL DEFAULT false,
  "paypal_enabled" BOOLEAN NOT NULL DEFAULT false,
  "apple_pay_enabled" BOOLEAN NOT NULL DEFAULT false,
  "google_pay_enabled" BOOLEAN NOT NULL DEFAULT false,
  "store_credit_enabled" BOOLEAN NOT NULL DEFAULT false,
  "gift_card_enabled" BOOLEAN NOT NULL DEFAULT false,
  "split_payments_enabled" BOOLEAN NOT NULL DEFAULT true,
  "partial_payments_enabled" BOOLEAN NOT NULL DEFAULT true,
  "deferred_payments_enabled" BOOLEAN NOT NULL DEFAULT false,
  "repair_deposits_enabled" BOOLEAN NOT NULL DEFAULT true,
  "minimum_deposit_percent" DECIMAL(5,2) NOT NULL DEFAULT 0,
  "maximum_cash_payment" DECIMAL(16,2),
  "refund_to_original_method" BOOLEAN NOT NULL DEFAULT true,
  "manager_approval_for_refunds" BOOLEAN NOT NULL DEFAULT true,
  "manager_approval_for_voids" BOOLEAN NOT NULL DEFAULT true,
  "automatic_receipts" BOOLEAN NOT NULL DEFAULT true,
  "receipt_required" BOOLEAN NOT NULL DEFAULT true,
  "require_open_session_for_cash" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "branch_payment_settings_shop_id_idx" ON "branch_payment_settings"("shop_id");

CREATE TABLE "branch_invoices" (
  "id" SERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "invoice_number" TEXT NOT NULL,
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "branch_id" INTEGER NOT NULL REFERENCES "branches"("id") ON DELETE CASCADE,
  "customer_id" INTEGER REFERENCES "customers"("id") ON DELETE SET NULL,
  "sale_id" INTEGER REFERENCES "branch_sales"("id") ON DELETE SET NULL,
  "repair_ticket_id" INTEGER REFERENCES "branch_repair_tickets"("id") ON DELETE SET NULL,
  "status" "BranchInvoiceStatus" NOT NULL DEFAULT 'DRAFT',
  "issue_date" TIMESTAMP(3),
  "due_date" TIMESTAMP(3),
  "currency" TEXT NOT NULL DEFAULT 'GBP',
  "subtotal" DECIMAL(16,2) NOT NULL DEFAULT 0,
  "discount_total" DECIMAL(16,2) NOT NULL DEFAULT 0,
  "tax_total" DECIMAL(16,2) NOT NULL DEFAULT 0,
  "total" DECIMAL(16,2) NOT NULL DEFAULT 0,
  "amount_paid" DECIMAL(16,2) NOT NULL DEFAULT 0,
  "amount_due" DECIMAL(16,2) NOT NULL DEFAULT 0,
  "billing_details" JSONB,
  "branch_snapshot" JSONB,
  "customer_snapshot" JSONB,
  "tax_snapshot" JSONB,
  "notes" TEXT,
  "terms" TEXT,
  "issued_by_id" INTEGER,
  "issued_at" TIMESTAMP(3),
  "paid_at" TIMESTAMP(3),
  "voided_at" TIMESTAMP(3),
  "version" INTEGER NOT NULL DEFAULT 1,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "branch_invoices_uuid_key" UNIQUE ("uuid"),
  CONSTRAINT "branch_invoices_invoice_number_key" UNIQUE ("invoice_number")
);
CREATE INDEX "branch_invoices_shop_id_branch_id_idx" ON "branch_invoices"("shop_id", "branch_id");
CREATE INDEX "branch_invoices_branch_id_status_idx" ON "branch_invoices"("branch_id", "status");
CREATE INDEX "branch_invoices_customer_id_idx" ON "branch_invoices"("customer_id");

CREATE TABLE "branch_invoice_line_items" (
  "id" SERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "invoice_id" INTEGER NOT NULL REFERENCES "branch_invoices"("id") ON DELETE CASCADE,
  "item_type" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "quantity" DECIMAL(12,4) NOT NULL,
  "unit_price" DECIMAL(14,2) NOT NULL,
  "discount_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "tax_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "line_total" DECIMAL(16,2) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "branch_invoice_line_items_uuid_key" UNIQUE ("uuid")
);
CREATE INDEX "branch_invoice_line_items_invoice_id_idx" ON "branch_invoice_line_items"("invoice_id");

CREATE TABLE "branch_payments" (
  "id" SERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "payment_number" TEXT NOT NULL,
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "branch_id" INTEGER NOT NULL REFERENCES "branches"("id") ON DELETE CASCADE,
  "register_session_id" INTEGER REFERENCES "branch_register_sessions"("id") ON DELETE SET NULL,
  "sale_id" INTEGER REFERENCES "branch_sales"("id") ON DELETE SET NULL,
  "repair_ticket_id" INTEGER REFERENCES "branch_repair_tickets"("id") ON DELETE SET NULL,
  "invoice_id" INTEGER REFERENCES "branch_invoices"("id") ON DELETE SET NULL,
  "customer_id" INTEGER REFERENCES "customers"("id") ON DELETE SET NULL,
  "payment_method" "BranchPaymentMethod" NOT NULL,
  "status" "BranchPaymentStatus" NOT NULL DEFAULT 'PENDING',
  "amount" DECIMAL(16,2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'GBP',
  "provider" TEXT,
  "provider_reference" TEXT,
  "transaction_reference" TEXT,
  "failure_reason" TEXT,
  "metadata" JSONB,
  "idempotency_key" TEXT,
  "received_by_id" INTEGER,
  "paid_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "branch_payments_uuid_key" UNIQUE ("uuid"),
  CONSTRAINT "branch_payments_payment_number_key" UNIQUE ("payment_number"),
  CONSTRAINT "branch_payments_idempotency_key_key" UNIQUE ("idempotency_key")
);
CREATE INDEX "branch_payments_shop_id_branch_id_idx" ON "branch_payments"("shop_id", "branch_id");
CREATE INDEX "branch_payments_branch_id_status_idx" ON "branch_payments"("branch_id", "status");
CREATE INDEX "branch_payments_sale_id_idx" ON "branch_payments"("sale_id");
CREATE INDEX "branch_payments_invoice_id_idx" ON "branch_payments"("invoice_id");
CREATE INDEX "branch_payments_paid_at_idx" ON "branch_payments"("paid_at");

CREATE TABLE "branch_refunds" (
  "id" SERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "refund_number" TEXT NOT NULL,
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "branch_id" INTEGER NOT NULL REFERENCES "branches"("id") ON DELETE CASCADE,
  "payment_id" INTEGER NOT NULL REFERENCES "branch_payments"("id") ON DELETE CASCADE,
  "sale_id" INTEGER REFERENCES "branch_sales"("id") ON DELETE SET NULL,
  "repair_ticket_id" INTEGER REFERENCES "branch_repair_tickets"("id") ON DELETE SET NULL,
  "invoice_id" INTEGER REFERENCES "branch_invoices"("id") ON DELETE SET NULL,
  "customer_id" INTEGER REFERENCES "customers"("id") ON DELETE SET NULL,
  "refund_method" "BranchPaymentMethod" NOT NULL,
  "status" "BranchRefundStatus" NOT NULL DEFAULT 'REQUESTED',
  "amount" DECIMAL(16,2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'GBP',
  "reason" TEXT,
  "rejection_reason" TEXT,
  "provider_reference" TEXT,
  "requested_by_id" INTEGER,
  "approved_by_id" INTEGER,
  "processed_by_id" INTEGER,
  "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "approved_at" TIMESTAMP(3),
  "processed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "branch_refunds_uuid_key" UNIQUE ("uuid"),
  CONSTRAINT "branch_refunds_refund_number_key" UNIQUE ("refund_number")
);
CREATE INDEX "branch_refunds_shop_id_branch_id_idx" ON "branch_refunds"("shop_id", "branch_id");
CREATE INDEX "branch_refunds_payment_id_idx" ON "branch_refunds"("payment_id");
CREATE INDEX "branch_refunds_status_idx" ON "branch_refunds"("status");

CREATE TABLE "branch_cash_movements" (
  "id" SERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "branch_id" INTEGER NOT NULL REFERENCES "branches"("id") ON DELETE CASCADE,
  "register_session_id" INTEGER NOT NULL REFERENCES "branch_register_sessions"("id") ON DELETE CASCADE,
  "movement_type" "BranchCashMovementType" NOT NULL,
  "amount" DECIMAL(16,2) NOT NULL,
  "reason_code" TEXT,
  "notes" TEXT,
  "payment_id" INTEGER REFERENCES "branch_payments"("id") ON DELETE SET NULL,
  "refund_id" INTEGER REFERENCES "branch_refunds"("id") ON DELETE SET NULL,
  "expense_id" INTEGER,
  "reversal_of_id" INTEGER UNIQUE,
  "performed_by_id" INTEGER,
  "approved_by_id" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "branch_cash_movements_uuid_key" UNIQUE ("uuid")
);
CREATE INDEX "branch_cash_movements_shop_id_branch_id_idx" ON "branch_cash_movements"("shop_id", "branch_id");
CREATE INDEX "branch_cash_movements_register_session_id_created_at_idx"
  ON "branch_cash_movements"("register_session_id", "created_at");

CREATE TABLE "branch_tax_profiles" (
  "id" SERIAL PRIMARY KEY,
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "branch_id" INTEGER NOT NULL UNIQUE REFERENCES "branches"("id") ON DELETE CASCADE,
  "tax_enabled" BOOLEAN NOT NULL DEFAULT true,
  "tax_type" "TaxType" NOT NULL DEFAULT 'VAT',
  "registration_name" TEXT,
  "vat_number" TEXT,
  "registration_number" TEXT,
  "default_tax_rate" DECIMAL(5,2) NOT NULL DEFAULT 20,
  "prices_include_tax" BOOLEAN NOT NULL DEFAULT false,
  "tax_label" TEXT NOT NULL DEFAULT 'VAT',
  "rounding_method" "TaxRoundingMethod" NOT NULL DEFAULT 'HALF_UP',
  "country" TEXT DEFAULT 'United Kingdom',
  "tax_region" TEXT,
  "effective_from" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "branch_tax_profiles_shop_id_idx" ON "branch_tax_profiles"("shop_id");

CREATE TABLE "branch_tax_rates" (
  "id" SERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "branch_id" INTEGER NOT NULL REFERENCES "branches"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "rate" DECIMAL(5,2) NOT NULL,
  "applies_to" TEXT NOT NULL,
  "is_zero_rated" BOOLEAN NOT NULL DEFAULT false,
  "is_exempt" BOOLEAN NOT NULL DEFAULT false,
  "effective_from" TIMESTAMP(3),
  "effective_until" TIMESTAMP(3),
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "branch_tax_rates_uuid_key" UNIQUE ("uuid")
);
CREATE INDEX "branch_tax_rates_shop_id_branch_id_idx" ON "branch_tax_rates"("shop_id", "branch_id");

CREATE TABLE "branch_end_of_day_closings" (
  "id" SERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "branch_id" INTEGER NOT NULL REFERENCES "branches"("id") ON DELETE CASCADE,
  "business_date" DATE NOT NULL,
  "status" "BranchEndOfDayStatus" NOT NULL DEFAULT 'DRAFT',
  "timezone" TEXT NOT NULL DEFAULT 'Europe/London',
  "opening_floats" DECIMAL(16,2) NOT NULL DEFAULT 0,
  "cash_sales" DECIMAL(16,2) NOT NULL DEFAULT 0,
  "card_sales" DECIMAL(16,2) NOT NULL DEFAULT 0,
  "other_payments" DECIMAL(16,2) NOT NULL DEFAULT 0,
  "cash_deposits" DECIMAL(16,2) NOT NULL DEFAULT 0,
  "refunds" DECIMAL(16,2) NOT NULL DEFAULT 0,
  "discounts" DECIMAL(16,2) NOT NULL DEFAULT 0,
  "vat_total" DECIMAL(16,2) NOT NULL DEFAULT 0,
  "repair_payments" DECIMAL(16,2) NOT NULL DEFAULT 0,
  "expenses" DECIMAL(16,2) NOT NULL DEFAULT 0,
  "cash_in" DECIMAL(16,2) NOT NULL DEFAULT 0,
  "cash_out" DECIMAL(16,2) NOT NULL DEFAULT 0,
  "safe_drops" DECIMAL(16,2) NOT NULL DEFAULT 0,
  "petty_cash" DECIMAL(16,2) NOT NULL DEFAULT 0,
  "expected_cash" DECIMAL(16,2) NOT NULL DEFAULT 0,
  "counted_cash" DECIMAL(16,2),
  "cash_difference" DECIMAL(16,2),
  "discrepancy_reason" TEXT,
  "summary_snapshot" JSONB,
  "generated_by_id" INTEGER,
  "reviewed_by_id" INTEGER,
  "approved_by_id" INTEGER,
  "closed_by_id" INTEGER,
  "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reviewed_at" TIMESTAMP(3),
  "approved_at" TIMESTAMP(3),
  "closed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "branch_end_of_day_closings_uuid_key" UNIQUE ("uuid"),
  CONSTRAINT "branch_end_of_day_closings_branch_id_business_date_key" UNIQUE ("branch_id", "business_date")
);
CREATE INDEX "branch_end_of_day_closings_shop_id_branch_id_idx" ON "branch_end_of_day_closings"("shop_id", "branch_id");

CREATE TABLE "branch_checklist_templates" (
  "id" SERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "branch_id" INTEGER NOT NULL REFERENCES "branches"("id") ON DELETE CASCADE,
  "checklist_type" "BranchChecklistType" NOT NULL,
  "name" TEXT NOT NULL,
  "items" JSONB NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "branch_checklist_templates_uuid_key" UNIQUE ("uuid")
);
CREATE INDEX "branch_checklist_templates_shop_id_branch_id_idx" ON "branch_checklist_templates"("shop_id", "branch_id");

CREATE TABLE "branch_checklist_runs" (
  "id" SERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "branch_id" INTEGER NOT NULL REFERENCES "branches"("id") ON DELETE CASCADE,
  "template_id" INTEGER NOT NULL REFERENCES "branch_checklist_templates"("id") ON DELETE CASCADE,
  "checklist_type" "BranchChecklistType" NOT NULL,
  "status" "BranchChecklistRunStatus" NOT NULL DEFAULT 'IN_PROGRESS',
  "responses" JSONB NOT NULL DEFAULT '[]',
  "business_date" DATE NOT NULL,
  "notes" TEXT,
  "completed_by_id" INTEGER,
  "approved_by_id" INTEGER,
  "completed_at" TIMESTAMP(3),
  "approved_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "branch_checklist_runs_uuid_key" UNIQUE ("uuid")
);
CREATE INDEX "branch_checklist_runs_shop_id_branch_id_business_date_idx"
  ON "branch_checklist_runs"("shop_id", "branch_id", "business_date");

CREATE TABLE "branch_targets" (
  "id" SERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "branch_id" INTEGER NOT NULL REFERENCES "branches"("id") ON DELETE CASCADE,
  "target_type" "BranchTargetType" NOT NULL,
  "period" "BranchTargetPeriod" NOT NULL,
  "target_value" DECIMAL(16,2) NOT NULL,
  "period_start" TIMESTAMP(3) NOT NULL,
  "period_end" TIMESTAMP(3) NOT NULL,
  "staff_id" INTEGER,
  "service_id" INTEGER,
  "category_id" INTEGER,
  "notes" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_by_id" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "branch_targets_uuid_key" UNIQUE ("uuid")
);
CREATE INDEX "branch_targets_shop_id_branch_id_period_start_idx" ON "branch_targets"("shop_id", "branch_id", "period_start");

CREATE TABLE "branch_commission_rules" (
  "id" SERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "branch_id" INTEGER NOT NULL REFERENCES "branches"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "rule_type" "BranchCommissionRuleType" NOT NULL,
  "applies_to" TEXT NOT NULL,
  "percentage_rate" DECIMAL(5,2),
  "fixed_amount" DECIMAL(16,2),
  "tier_config" JSONB,
  "role_id" INTEGER,
  "user_id" INTEGER,
  "priority" INTEGER NOT NULL DEFAULT 0,
  "minimum_threshold" DECIMAL(16,2),
  "maximum_commission" DECIMAL(16,2),
  "calculate_on_net" BOOLEAN NOT NULL DEFAULT false,
  "effective_from" TIMESTAMP(3),
  "effective_until" TIMESTAMP(3),
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "branch_commission_rules_uuid_key" UNIQUE ("uuid")
);
CREATE INDEX "branch_commission_rules_shop_id_branch_id_idx" ON "branch_commission_rules"("shop_id", "branch_id");

CREATE TABLE "branch_commissions" (
  "id" SERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "branch_id" INTEGER NOT NULL REFERENCES "branches"("id") ON DELETE CASCADE,
  "rule_id" INTEGER NOT NULL REFERENCES "branch_commission_rules"("id") ON DELETE CASCADE,
  "sale_id" INTEGER REFERENCES "branch_sales"("id") ON DELETE SET NULL,
  "repair_ticket_id" INTEGER REFERENCES "branch_repair_tickets"("id") ON DELETE SET NULL,
  "user_id" INTEGER,
  "status" "BranchCommissionStatus" NOT NULL DEFAULT 'CALCULATED',
  "base_amount" DECIMAL(16,2) NOT NULL,
  "commission_amount" DECIMAL(16,2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'GBP',
  "calculation_snapshot" JSONB,
  "approved_by_id" INTEGER,
  "paid_at" TIMESTAMP(3),
  "reversed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "branch_commissions_uuid_key" UNIQUE ("uuid"),
  CONSTRAINT "branch_commissions_rule_id_sale_id_user_id_key" UNIQUE ("rule_id", "sale_id", "user_id")
);
CREATE INDEX "branch_commissions_shop_id_branch_id_idx" ON "branch_commissions"("shop_id", "branch_id");
CREATE INDEX "branch_commissions_status_idx" ON "branch_commissions"("status");

CREATE TABLE "branch_expenses" (
  "id" SERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "expense_number" TEXT NOT NULL,
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "branch_id" INTEGER NOT NULL REFERENCES "branches"("id") ON DELETE CASCADE,
  "category" TEXT NOT NULL,
  "supplier" TEXT,
  "expense_date" DATE NOT NULL,
  "description" TEXT NOT NULL,
  "subtotal" DECIMAL(16,2) NOT NULL,
  "tax_amount" DECIMAL(16,2) NOT NULL DEFAULT 0,
  "total" DECIMAL(16,2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'GBP',
  "payment_method" "BranchPaymentMethod",
  "payment_reference" TEXT,
  "receipt_url" TEXT,
  "status" "BranchExpenseStatus" NOT NULL DEFAULT 'DRAFT',
  "rejection_reason" TEXT,
  "recurring_config" JSONB,
  "notes" TEXT,
  "submitted_by_id" INTEGER,
  "approved_by_id" INTEGER,
  "paid_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "branch_expenses_uuid_key" UNIQUE ("uuid"),
  CONSTRAINT "branch_expenses_expense_number_key" UNIQUE ("expense_number")
);
CREATE INDEX "branch_expenses_shop_id_branch_id_idx" ON "branch_expenses"("shop_id", "branch_id");
CREATE INDEX "branch_expenses_branch_id_status_idx" ON "branch_expenses"("branch_id", "status");
CREATE INDEX "branch_expenses_expense_date_idx" ON "branch_expenses"("expense_date");

ALTER TABLE "branch_cash_movements"
  ADD CONSTRAINT "branch_cash_movements_expense_id_fkey"
  FOREIGN KEY ("expense_id") REFERENCES "branch_expenses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "branch_cash_movements"
  ADD CONSTRAINT "branch_cash_movements_reversal_of_id_fkey"
  FOREIGN KEY ("reversal_of_id") REFERENCES "branch_cash_movements"("id") ON DELETE SET NULL ON UPDATE CASCADE;
