-- Module 10: Branch System & Audit

CREATE TYPE "BranchSyncType" AS ENUM (
  'SETTINGS', 'PRODUCTS', 'INVENTORY', 'CUSTOMERS', 'SALES', 'REPAIRS',
  'PAYMENTS', 'DOCUMENTS', 'WEBSITE', 'MARKETPLACE', 'ACCOUNTING',
  'NOTIFICATIONS', 'REPORTING', 'OFFLINE_DEVICE', 'OTHER'
);
CREATE TYPE "SyncDirection" AS ENUM ('IMPORT', 'EXPORT', 'BIDIRECTIONAL');
CREATE TYPE "SyncScheduleType" AS ENUM ('MANUAL', 'REAL_TIME', 'INTERVAL', 'CRON');
CREATE TYPE "SyncConflictStrategy" AS ENUM ('SOURCE_WINS', 'DESTINATION_WINS', 'NEWEST_WINS', 'MANUAL_REVIEW');
CREATE TYPE "SyncConnectionStatus" AS ENUM ('IDLE', 'QUEUED', 'RUNNING', 'SUCCESS', 'PARTIAL', 'FAILED', 'PAUSED', 'DISABLED');
CREATE TYPE "SyncJobStatus" AS ENUM ('QUEUED', 'RUNNING', 'SUCCESS', 'PARTIAL', 'FAILED', 'CANCELLED', 'RETRYING');
CREATE TYPE "SyncTriggerType" AS ENUM ('MANUAL', 'SCHEDULED', 'WEBHOOK', 'SYSTEM', 'RETRY');
CREATE TYPE "SyncItemStatus" AS ENUM ('PENDING', 'CREATED', 'UPDATED', 'SKIPPED', 'FAILED', 'CONFLICT');
CREATE TYPE "BranchSettingValueType" AS ENUM ('STRING', 'NUMBER', 'BOOLEAN', 'JSON', 'DATE', 'TIME', 'ENUM', 'SECRET_REFERENCE');
CREATE TYPE "SecurityRuleCategory" AS ENUM (
  'AUTHENTICATION', 'AUTHORISATION', 'NETWORK', 'DEVICE', 'SESSION', 'FINANCIAL',
  'CUSTOMER_DATA', 'INVENTORY', 'REPAIRS', 'DOCUMENTS', 'EXPORTS', 'INTEGRATIONS'
);
CREATE TYPE "SecurityEnforcementMode" AS ENUM ('MONITOR', 'WARN', 'ENFORCE');
CREATE TYPE "SecurityEventType" AS ENUM (
  'ACCESS_DENIED', 'INVALID_PERMISSION', 'LOGIN_RESTRICTED', 'IP_RESTRICTED',
  'DEVICE_RESTRICTED', 'RATE_LIMIT_EXCEEDED', 'SENSITIVE_EXPORT_ATTEMPT',
  'LARGE_REFUND_ATTEMPT', 'UNAPPROVED_SETTINGS_CHANGE', 'SYNC_CONFLICT',
  'SUSPICIOUS_ACTIVITY', 'OTHER'
);
CREATE TYPE "SecurityEventStatus" AS ENUM ('OPEN', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED');
CREATE TYPE "BranchOwnershipType" AS ENUM (
  'COMPANY_OWNED', 'FRANCHISE_OWNED', 'JOINT_OWNERSHIP', 'PARTNER_MANAGED', 'LICENSED', 'INDEPENDENT'
);
CREATE TYPE "BusinessEntityType" AS ENUM ('SHOP_COMPANY', 'FRANCHISEE', 'FRANCHISOR', 'PARTNER', 'INDIVIDUAL', 'OTHER');
CREATE TYPE "BusinessEntityStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'ARCHIVED');
CREATE TYPE "BranchOwnershipStatus" AS ENUM ('PENDING', 'ACTIVE', 'EXPIRED', 'TERMINATED', 'SUSPENDED');

-- Extend branch_security_rules
ALTER TABLE "branch_security_rules"
  ADD COLUMN IF NOT EXISTS "category" "SecurityRuleCategory" NOT NULL DEFAULT 'AUTHORISATION',
  ADD COLUMN IF NOT EXISTS "enforcement_mode" "SecurityEnforcementMode" NOT NULL DEFAULT 'ENFORCE',
  ADD COLUMN IF NOT EXISTS "priority" INTEGER NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS "is_system_rule" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "effective_from" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "effective_until" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "version" INTEGER NOT NULL DEFAULT 1;

CREATE INDEX IF NOT EXISTS "audit_logs_created_at_idx" ON "audit_logs"("created_at");

CREATE TABLE "branch_sync_connections" (
  "id" SERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "branch_id" INTEGER NOT NULL REFERENCES "branches"("id") ON DELETE CASCADE,
  "connection_code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "sync_type" "BranchSyncType" NOT NULL,
  "direction" "SyncDirection" NOT NULL DEFAULT 'BIDIRECTIONAL',
  "is_enabled" BOOLEAN NOT NULL DEFAULT true,
  "schedule_type" "SyncScheduleType" NOT NULL DEFAULT 'MANUAL',
  "schedule_expression" TEXT,
  "conflict_strategy" "SyncConflictStrategy" NOT NULL DEFAULT 'MANUAL_REVIEW',
  "last_sync_started_at" TIMESTAMP(3),
  "last_sync_completed_at" TIMESTAMP(3),
  "last_successful_sync_at" TIMESTAMP(3),
  "next_scheduled_sync_at" TIMESTAMP(3),
  "current_status" "SyncConnectionStatus" NOT NULL DEFAULT 'IDLE',
  "last_error_code" TEXT,
  "last_error_message" TEXT,
  "provider_account_ref" TEXT,
  "credential_reference" TEXT,
  "created_by_id" INTEGER,
  "updated_by_id" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "archived_at" TIMESTAMP(3),
  CONSTRAINT "branch_sync_connections_uuid_key" UNIQUE ("uuid"),
  CONSTRAINT "branch_sync_connections_branch_id_connection_code_key" UNIQUE ("branch_id", "connection_code")
);
CREATE INDEX "branch_sync_connections_shop_id_branch_id_idx" ON "branch_sync_connections"("shop_id", "branch_id");
CREATE INDEX "branch_sync_connections_sync_type_idx" ON "branch_sync_connections"("sync_type");
CREATE INDEX "branch_sync_connections_current_status_idx" ON "branch_sync_connections"("current_status");

CREATE TABLE "branch_sync_jobs" (
  "id" SERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "job_number" TEXT NOT NULL,
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "branch_id" INTEGER NOT NULL REFERENCES "branches"("id") ON DELETE CASCADE,
  "connection_id" INTEGER NOT NULL REFERENCES "branch_sync_connections"("id") ON DELETE CASCADE,
  "status" "SyncJobStatus" NOT NULL,
  "trigger_type" "SyncTriggerType" NOT NULL,
  "started_at" TIMESTAMP(3),
  "completed_at" TIMESTAMP(3),
  "failed_at" TIMESTAMP(3),
  "total_records" INTEGER NOT NULL DEFAULT 0,
  "processed_records" INTEGER NOT NULL DEFAULT 0,
  "created_records" INTEGER NOT NULL DEFAULT 0,
  "updated_records" INTEGER NOT NULL DEFAULT 0,
  "skipped_records" INTEGER NOT NULL DEFAULT 0,
  "failed_records" INTEGER NOT NULL DEFAULT 0,
  "conflict_records" INTEGER NOT NULL DEFAULT 0,
  "cursor" TEXT,
  "checkpoint" JSONB,
  "summary" JSONB,
  "error_code" TEXT,
  "error_message" TEXT,
  "retry_count" INTEGER NOT NULL DEFAULT 0,
  "triggered_by_id" INTEGER,
  "request_id" TEXT,
  "idempotency_key" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "branch_sync_jobs_uuid_key" UNIQUE ("uuid"),
  CONSTRAINT "branch_sync_jobs_job_number_key" UNIQUE ("job_number")
);
CREATE INDEX "branch_sync_jobs_shop_id_branch_id_idx" ON "branch_sync_jobs"("shop_id", "branch_id");
CREATE INDEX "branch_sync_jobs_connection_id_status_idx" ON "branch_sync_jobs"("connection_id", "status");
CREATE INDEX "branch_sync_jobs_started_at_idx" ON "branch_sync_jobs"("started_at");

CREATE TABLE "branch_sync_job_items" (
  "id" SERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "sync_job_id" INTEGER NOT NULL REFERENCES "branch_sync_jobs"("id") ON DELETE CASCADE,
  "entity_type" TEXT NOT NULL,
  "local_entity_id" TEXT,
  "remote_entity_id" TEXT,
  "status" "SyncItemStatus" NOT NULL,
  "action" TEXT,
  "error_code" TEXT,
  "error_message" TEXT,
  "conflict_data" JSONB,
  "processed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "branch_sync_job_items_uuid_key" UNIQUE ("uuid")
);
CREATE INDEX "branch_sync_job_items_sync_job_id_status_idx" ON "branch_sync_job_items"("sync_job_id", "status");
CREATE INDEX "branch_sync_job_items_entity_type_idx" ON "branch_sync_job_items"("entity_type");

CREATE TABLE "branch_settings" (
  "id" SERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "branch_id" INTEGER NOT NULL REFERENCES "branches"("id") ON DELETE CASCADE,
  "namespace" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "value" JSONB NOT NULL,
  "value_type" "BranchSettingValueType" NOT NULL,
  "is_encrypted" BOOLEAN NOT NULL DEFAULT false,
  "is_system_managed" BOOLEAN NOT NULL DEFAULT false,
  "is_inherited" BOOLEAN NOT NULL DEFAULT false,
  "version" INTEGER NOT NULL DEFAULT 1,
  "created_by_id" INTEGER,
  "updated_by_id" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "branch_settings_uuid_key" UNIQUE ("uuid"),
  CONSTRAINT "branch_settings_branch_id_namespace_key_key" UNIQUE ("branch_id", "namespace", "key")
);
CREATE INDEX "branch_settings_shop_id_branch_id_idx" ON "branch_settings"("shop_id", "branch_id");
CREATE INDEX "branch_settings_namespace_idx" ON "branch_settings"("namespace");

CREATE TABLE "branch_setting_history" (
  "id" SERIAL PRIMARY KEY,
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "branch_id" INTEGER NOT NULL REFERENCES "branches"("id") ON DELETE CASCADE,
  "namespace" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "old_value" JSONB,
  "new_value" JSONB,
  "version" INTEGER NOT NULL,
  "change_reason" TEXT,
  "changed_by_id" INTEGER,
  "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "branch_setting_history_shop_id_branch_id_idx" ON "branch_setting_history"("shop_id", "branch_id");
CREATE INDEX "branch_setting_history_namespace_key_idx" ON "branch_setting_history"("namespace", "key");
CREATE INDEX "branch_setting_history_changed_at_idx" ON "branch_setting_history"("changed_at");

CREATE TABLE "branch_security_events" (
  "id" SERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "branch_id" INTEGER REFERENCES "branches"("id") ON DELETE SET NULL,
  "rule_key" TEXT,
  "event_type" "SecurityEventType" NOT NULL,
  "severity" TEXT NOT NULL DEFAULT 'INFO',
  "status" "SecurityEventStatus" NOT NULL DEFAULT 'OPEN',
  "actor_user_id" INTEGER,
  "entity_type" TEXT,
  "entity_id" TEXT,
  "description" TEXT,
  "metadata" JSONB,
  "ip_address" TEXT,
  "user_agent" TEXT,
  "detected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolved_at" TIMESTAMP(3),
  "resolved_by_id" INTEGER,
  "resolution_notes" TEXT,
  CONSTRAINT "branch_security_events_uuid_key" UNIQUE ("uuid")
);
CREATE INDEX "branch_security_events_shop_id_branch_id_idx" ON "branch_security_events"("shop_id", "branch_id");
CREATE INDEX "branch_security_events_event_type_idx" ON "branch_security_events"("event_type");
CREATE INDEX "branch_security_events_severity_idx" ON "branch_security_events"("severity");
CREATE INDEX "branch_security_events_status_idx" ON "branch_security_events"("status");
CREATE INDEX "branch_security_events_detected_at_idx" ON "branch_security_events"("detected_at");

CREATE TABLE "business_entities" (
  "id" SERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "legal_name" TEXT NOT NULL,
  "trading_name" TEXT,
  "entity_type" "BusinessEntityType" NOT NULL,
  "registration_number" TEXT,
  "tax_number" TEXT,
  "contact_name" TEXT,
  "contact_email" TEXT,
  "contact_phone" TEXT,
  "address" JSONB,
  "status" "BusinessEntityStatus" NOT NULL DEFAULT 'ACTIVE',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "archived_at" TIMESTAMP(3),
  CONSTRAINT "business_entities_uuid_key" UNIQUE ("uuid")
);
CREATE INDEX "business_entities_shop_id_idx" ON "business_entities"("shop_id");
CREATE INDEX "business_entities_legal_name_idx" ON "business_entities"("legal_name");

CREATE TABLE "branch_ownerships" (
  "id" SERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "branch_id" INTEGER NOT NULL REFERENCES "branches"("id") ON DELETE CASCADE,
  "business_entity_id" INTEGER NOT NULL REFERENCES "business_entities"("id") ON DELETE CASCADE,
  "ownership_type" "BranchOwnershipType" NOT NULL,
  "ownership_percentage" DECIMAL(5,2),
  "is_primary_owner" BOOLEAN NOT NULL DEFAULT false,
  "is_operating_entity" BOOLEAN NOT NULL DEFAULT false,
  "effective_from" TIMESTAMP(3) NOT NULL,
  "effective_until" TIMESTAMP(3),
  "status" "BranchOwnershipStatus" NOT NULL DEFAULT 'ACTIVE',
  "agreement_reference" TEXT,
  "agreement_storage_path" TEXT,
  "notes" TEXT,
  "created_by_id" INTEGER,
  "updated_by_id" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "branch_ownerships_uuid_key" UNIQUE ("uuid")
);
CREATE INDEX "branch_ownerships_shop_id_branch_id_idx" ON "branch_ownerships"("shop_id", "branch_id");
CREATE INDEX "branch_ownerships_business_entity_id_idx" ON "branch_ownerships"("business_entity_id");
CREATE INDEX "branch_ownerships_status_idx" ON "branch_ownerships"("status");
CREATE INDEX "branch_ownerships_effective_from_effective_until_idx" ON "branch_ownerships"("effective_from", "effective_until");
