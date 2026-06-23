-- Module 8: Branch Reporting & Analytics

CREATE TYPE "BranchReportExportFormat" AS ENUM ('CSV', 'XLSX', 'PDF');
CREATE TYPE "BranchReportExportStatus" AS ENUM ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'EXPIRED');

CREATE TABLE "branch_reporting_settings" (
  "id" SERIAL PRIMARY KEY,
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "branch_id" INTEGER NOT NULL UNIQUE REFERENCES "branches"("id") ON DELETE CASCADE,
  "sales_target_monthly" DECIMAL(16,2) NOT NULL DEFAULT 0,
  "repair_target_monthly" INTEGER NOT NULL DEFAULT 0,
  "commission_rules" TEXT,
  "last_report_generated_at" TIMESTAMP(3),
  "default_comparison_period" TEXT,
  "created_by_id" INTEGER,
  "updated_by_id" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "branch_reporting_settings_shop_id_idx" ON "branch_reporting_settings"("shop_id");

CREATE TABLE "branch_report_exports" (
  "id" SERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "branch_id" INTEGER NOT NULL REFERENCES "branches"("id") ON DELETE CASCADE,
  "report_code" TEXT NOT NULL,
  "format" "BranchReportExportFormat" NOT NULL DEFAULT 'CSV',
  "status" "BranchReportExportStatus" NOT NULL DEFAULT 'QUEUED',
  "filters" JSONB,
  "storage_bucket" TEXT,
  "storage_path" TEXT,
  "file_name" TEXT,
  "file_size" INTEGER,
  "expires_at" TIMESTAMP(3),
  "completed_at" TIMESTAMP(3),
  "failed_at" TIMESTAMP(3),
  "error_message" TEXT,
  "requested_by_id" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "branch_report_exports_uuid_key" UNIQUE ("uuid")
);
CREATE INDEX "branch_report_exports_shop_id_branch_id_idx" ON "branch_report_exports"("shop_id", "branch_id");
CREATE INDEX "branch_report_exports_status_idx" ON "branch_report_exports"("status");
CREATE INDEX "branch_report_exports_report_code_idx" ON "branch_report_exports"("report_code");

CREATE TABLE "branch_report_snapshots" (
  "id" SERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "branch_id" INTEGER NOT NULL REFERENCES "branches"("id") ON DELETE CASCADE,
  "report_code" TEXT NOT NULL,
  "period_start" TIMESTAMP(3) NOT NULL,
  "period_end" TIMESTAMP(3) NOT NULL,
  "timezone" TEXT NOT NULL,
  "currency" TEXT,
  "data" JSONB NOT NULL,
  "source_version" TEXT,
  "generated_by_id" INTEGER,
  "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "is_locked" BOOLEAN NOT NULL DEFAULT false,
  "locked_at" TIMESTAMP(3),
  CONSTRAINT "branch_report_snapshots_uuid_key" UNIQUE ("uuid"),
  CONSTRAINT "branch_report_snapshots_branch_id_report_code_period_start_period_end_key"
    UNIQUE ("branch_id", "report_code", "period_start", "period_end")
);
CREATE INDEX "branch_report_snapshots_shop_id_branch_id_idx" ON "branch_report_snapshots"("shop_id", "branch_id");
CREATE INDEX "branch_report_snapshots_report_code_generated_at_idx" ON "branch_report_snapshots"("report_code", "generated_at");

-- Reporting query performance indexes
CREATE INDEX IF NOT EXISTS "branch_sales_shop_id_branch_id_completed_at_idx"
  ON "branch_sales"("shop_id", "branch_id", "completed_at");
CREATE INDEX IF NOT EXISTS "branch_sales_shop_id_branch_id_status_completed_at_idx"
  ON "branch_sales"("shop_id", "branch_id", "status", "completed_at");
CREATE INDEX IF NOT EXISTS "branch_payments_shop_id_branch_id_paid_at_idx"
  ON "branch_payments"("shop_id", "branch_id", "paid_at");
CREATE INDEX IF NOT EXISTS "branch_payments_shop_id_branch_id_status_paid_at_idx"
  ON "branch_payments"("shop_id", "branch_id", "status", "paid_at");
CREATE INDEX IF NOT EXISTS "branch_refunds_shop_id_branch_id_processed_at_idx"
  ON "branch_refunds"("shop_id", "branch_id", "processed_at");
CREATE INDEX IF NOT EXISTS "branch_repair_tickets_shop_id_branch_id_created_at_idx"
  ON "branch_repair_tickets"("shop_id", "branch_id", "created_at");
CREATE INDEX IF NOT EXISTS "branch_repair_tickets_shop_id_branch_id_status_created_at_idx"
  ON "branch_repair_tickets"("shop_id", "branch_id", "status", "created_at");
CREATE INDEX IF NOT EXISTS "branch_register_sessions_shop_id_branch_id_opened_at_idx"
  ON "branch_register_sessions"("shop_id", "branch_id", "opened_at");
