-- Module 7: Branch Communication & Documents

CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL', 'SMS', 'PUSH', 'IN_APP');
CREATE TYPE "CommunicationChannel" AS ENUM ('EMAIL', 'SMS', 'PUSH', 'IN_APP');
CREATE TYPE "CommunicationStatus" AS ENUM (
  'QUEUED', 'PROCESSING', 'SENT', 'DELIVERED', 'FAILED', 'BOUNCED', 'REJECTED', 'CANCELLED'
);
CREATE TYPE "EmailProvider" AS ENUM (
  'SUPABASE_FUNCTION', 'RESEND', 'SENDGRID', 'POSTMARK', 'MAILGUN', 'SMTP', 'OTHER'
);
CREATE TYPE "SmsProvider" AS ENUM ('TWILIO', 'VONAGE', 'MESSAGEBIRD', 'AWS_SNS', 'OTHER');
CREATE TYPE "SmsSenderType" AS ENUM ('ALPHANUMERIC', 'PHONE_NUMBER', 'SHORT_CODE');
CREATE TYPE "SenderVerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'FAILED', 'DISABLED');
CREATE TYPE "DocumentPaperSize" AS ENUM ('A4', 'A5', 'LETTER', 'LEGAL', 'RECEIPT_58MM', 'RECEIPT_80MM');
CREATE TYPE "DocumentOrientation" AS ENUM ('PORTRAIT', 'LANDSCAPE');
CREATE TYPE "BranchDocumentType" AS ENUM (
  'RECEIPT', 'INVOICE', 'CREDIT_NOTE', 'REPAIR_RECEIPT', 'REPAIR_ESTIMATE', 'REPAIR_TERMS',
  'WARRANTY_DOCUMENT', 'COLLECTION_FORM', 'DELIVERY_NOTE', 'CUSTOMER_CONSENT', 'BRANCH_REPORT', 'OTHER'
);
CREATE TYPE "BranchDocumentStatus" AS ENUM ('DRAFT', 'GENERATED', 'ISSUED', 'SENT', 'ARCHIVED', 'VOIDED');

CREATE TABLE "branch_notification_settings" (
  "id" SERIAL PRIMARY KEY,
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "branch_id" INTEGER NOT NULL UNIQUE REFERENCES "branches"("id") ON DELETE CASCADE,
  "notifications_enabled" BOOLEAN NOT NULL DEFAULT true,
  "email_enabled" BOOLEAN NOT NULL DEFAULT true,
  "sms_enabled" BOOLEAN NOT NULL DEFAULT false,
  "push_enabled" BOOLEAN NOT NULL DEFAULT false,
  "in_app_enabled" BOOLEAN NOT NULL DEFAULT true,
  "send_appointment_confirmation" BOOLEAN NOT NULL DEFAULT true,
  "send_appointment_reminder" BOOLEAN NOT NULL DEFAULT true,
  "appointment_reminder_minutes" INTEGER NOT NULL DEFAULT 1440,
  "send_repair_created" BOOLEAN NOT NULL DEFAULT true,
  "send_repair_status_updates" BOOLEAN NOT NULL DEFAULT true,
  "send_repair_ready" BOOLEAN NOT NULL DEFAULT true,
  "send_repair_collected" BOOLEAN NOT NULL DEFAULT false,
  "send_payment_confirmation" BOOLEAN NOT NULL DEFAULT true,
  "send_refund_updates" BOOLEAN NOT NULL DEFAULT true,
  "send_invoice_issued" BOOLEAN NOT NULL DEFAULT true,
  "send_invoice_overdue" BOOLEAN NOT NULL DEFAULT true,
  "send_pickup_updates" BOOLEAN NOT NULL DEFAULT true,
  "send_delivery_updates" BOOLEAN NOT NULL DEFAULT true,
  "send_warranty_updates" BOOLEAN NOT NULL DEFAULT true,
  "notify_branch_managers" BOOLEAN NOT NULL DEFAULT true,
  "notify_assigned_staff" BOOLEAN NOT NULL DEFAULT true,
  "quiet_hours_enabled" BOOLEAN NOT NULL DEFAULT false,
  "quiet_hours_start" TEXT,
  "quiet_hours_end" TEXT,
  "fallback_channel" "NotificationChannel",
  "timezone" TEXT,
  "created_by_id" INTEGER,
  "updated_by_id" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "branch_notification_settings_shop_id_idx" ON "branch_notification_settings"("shop_id");

CREATE TABLE "branch_document_settings" (
  "id" SERIAL PRIMARY KEY,
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "branch_id" INTEGER NOT NULL UNIQUE REFERENCES "branches"("id") ON DELETE CASCADE,
  "document_prefix" TEXT,
  "default_paper_size" "DocumentPaperSize" NOT NULL DEFAULT 'A4',
  "default_orientation" "DocumentOrientation" NOT NULL DEFAULT 'PORTRAIT',
  "logo_storage_path" TEXT,
  "header_text" TEXT,
  "footer_text" TEXT,
  "legal_business_name" TEXT,
  "registration_number" TEXT,
  "vat_number" TEXT,
  "show_branch_address" BOOLEAN NOT NULL DEFAULT true,
  "show_branch_phone" BOOLEAN NOT NULL DEFAULT true,
  "show_branch_email" BOOLEAN NOT NULL DEFAULT true,
  "show_website" BOOLEAN NOT NULL DEFAULT true,
  "show_vat_number" BOOLEAN NOT NULL DEFAULT true,
  "watermark_enabled" BOOLEAN NOT NULL DEFAULT false,
  "watermark_text" TEXT,
  "include_terms" BOOLEAN NOT NULL DEFAULT false,
  "default_terms" TEXT,
  "default_notes" TEXT,
  "document_template" TEXT,
  "document_language" TEXT NOT NULL DEFAULT 'en',
  "date_format" TEXT,
  "time_format" TEXT,
  "storage_bucket" TEXT,
  "storage_folder_prefix" TEXT,
  "created_by_id" INTEGER,
  "updated_by_id" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "branch_document_settings_shop_id_idx" ON "branch_document_settings"("shop_id");

CREATE TABLE "branch_receipt_settings" (
  "id" SERIAL PRIMARY KEY,
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "branch_id" INTEGER NOT NULL UNIQUE REFERENCES "branches"("id") ON DELETE CASCADE,
  "receipt_prefix" TEXT,
  "receipt_paper_size" "DocumentPaperSize" NOT NULL DEFAULT 'RECEIPT_80MM',
  "show_logo" BOOLEAN NOT NULL DEFAULT true,
  "show_branch_name" BOOLEAN NOT NULL DEFAULT true,
  "show_branch_address" BOOLEAN NOT NULL DEFAULT true,
  "show_branch_phone" BOOLEAN NOT NULL DEFAULT true,
  "show_branch_email" BOOLEAN NOT NULL DEFAULT false,
  "show_website" BOOLEAN NOT NULL DEFAULT false,
  "show_vat_number" BOOLEAN NOT NULL DEFAULT true,
  "show_cashier_name" BOOLEAN NOT NULL DEFAULT true,
  "show_register_name" BOOLEAN NOT NULL DEFAULT true,
  "show_customer_name" BOOLEAN NOT NULL DEFAULT false,
  "show_payment_method" BOOLEAN NOT NULL DEFAULT true,
  "show_tax_breakdown" BOOLEAN NOT NULL DEFAULT true,
  "show_discount_breakdown" BOOLEAN NOT NULL DEFAULT true,
  "header_message" TEXT,
  "footer_message" TEXT,
  "return_policy_text" TEXT,
  "warranty_text" TEXT,
  "print_automatically" BOOLEAN NOT NULL DEFAULT false,
  "email_automatically" BOOLEAN NOT NULL DEFAULT false,
  "sms_receipt_link" BOOLEAN NOT NULL DEFAULT false,
  "include_qr_code" BOOLEAN NOT NULL DEFAULT false,
  "qr_code_target" TEXT,
  "created_by_id" INTEGER,
  "updated_by_id" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "branch_receipt_settings_shop_id_idx" ON "branch_receipt_settings"("shop_id");

CREATE TABLE "branch_invoice_settings" (
  "id" SERIAL PRIMARY KEY,
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "branch_id" INTEGER NOT NULL UNIQUE REFERENCES "branches"("id") ON DELETE CASCADE,
  "invoice_prefix" TEXT NOT NULL DEFAULT 'INV',
  "next_invoice_sequence" INTEGER NOT NULL DEFAULT 1,
  "credit_note_prefix" TEXT,
  "payment_terms_days" INTEGER NOT NULL DEFAULT 0,
  "default_due_date_days" INTEGER NOT NULL DEFAULT 30,
  "show_logo" BOOLEAN NOT NULL DEFAULT true,
  "show_branch_address" BOOLEAN NOT NULL DEFAULT true,
  "show_branch_phone" BOOLEAN NOT NULL DEFAULT true,
  "show_branch_email" BOOLEAN NOT NULL DEFAULT true,
  "show_vat_number" BOOLEAN NOT NULL DEFAULT true,
  "show_payment_instructions" BOOLEAN NOT NULL DEFAULT true,
  "show_tax_breakdown" BOOLEAN NOT NULL DEFAULT true,
  "default_notes" TEXT,
  "default_terms" TEXT,
  "payment_instructions" TEXT,
  "bank_details_text" TEXT,
  "auto_issue_invoices" BOOLEAN NOT NULL DEFAULT false,
  "auto_email_invoices" BOOLEAN NOT NULL DEFAULT false,
  "send_payment_reminder" BOOLEAN NOT NULL DEFAULT false,
  "reminder_days_before_due" INTEGER,
  "overdue_reminder_days" INTEGER,
  "created_by_id" INTEGER,
  "updated_by_id" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "branch_invoice_settings_shop_id_idx" ON "branch_invoice_settings"("shop_id");

CREATE TABLE "branch_email_sender_settings" (
  "id" SERIAL PRIMARY KEY,
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "branch_id" INTEGER NOT NULL UNIQUE REFERENCES "branches"("id") ON DELETE CASCADE,
  "provider" "EmailProvider" NOT NULL DEFAULT 'OTHER',
  "sender_name" TEXT NOT NULL DEFAULT '',
  "sender_email" TEXT NOT NULL DEFAULT '',
  "reply_to_email" TEXT,
  "is_enabled" BOOLEAN NOT NULL DEFAULT false,
  "is_verified" BOOLEAN NOT NULL DEFAULT false,
  "verification_status" "SenderVerificationStatus" NOT NULL DEFAULT 'PENDING',
  "provider_account_ref" TEXT,
  "encrypted_credential_ref" TEXT,
  "default_subject_prefix" TEXT,
  "footer_signature" TEXT,
  "last_tested_at" TIMESTAMP(3),
  "last_test_status" TEXT,
  "last_test_error" TEXT,
  "created_by_id" INTEGER,
  "updated_by_id" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "branch_email_sender_settings_shop_id_idx" ON "branch_email_sender_settings"("shop_id");

CREATE TABLE "branch_sms_sender_settings" (
  "id" SERIAL PRIMARY KEY,
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "branch_id" INTEGER NOT NULL UNIQUE REFERENCES "branches"("id") ON DELETE CASCADE,
  "provider" "SmsProvider" NOT NULL DEFAULT 'OTHER',
  "sender_type" "SmsSenderType" NOT NULL DEFAULT 'ALPHANUMERIC',
  "sender_id" TEXT,
  "phone_number" TEXT,
  "is_enabled" BOOLEAN NOT NULL DEFAULT false,
  "is_verified" BOOLEAN NOT NULL DEFAULT false,
  "verification_status" "SenderVerificationStatus" NOT NULL DEFAULT 'PENDING',
  "provider_account_ref" TEXT,
  "encrypted_credential_ref" TEXT,
  "country_code" TEXT,
  "default_region" TEXT,
  "last_tested_at" TIMESTAMP(3),
  "last_test_status" TEXT,
  "last_test_error" TEXT,
  "created_by_id" INTEGER,
  "updated_by_id" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "branch_sms_sender_settings_shop_id_idx" ON "branch_sms_sender_settings"("shop_id");

CREATE TABLE "branch_message_templates" (
  "id" SERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "branch_id" INTEGER NOT NULL REFERENCES "branches"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "description" TEXT,
  "channel" "CommunicationChannel" NOT NULL,
  "event_type" TEXT NOT NULL,
  "subject" TEXT,
  "content" TEXT NOT NULL,
  "language" TEXT NOT NULL DEFAULT 'en',
  "version" INTEGER NOT NULL DEFAULT 1,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "is_default" BOOLEAN NOT NULL DEFAULT false,
  "is_system_template" BOOLEAN NOT NULL DEFAULT false,
  "allowed_variables" JSONB,
  "required_variables" JSONB,
  "created_by_id" INTEGER,
  "updated_by_id" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "archived_at" TIMESTAMP(3),
  CONSTRAINT "branch_message_templates_uuid_key" UNIQUE ("uuid"),
  CONSTRAINT "branch_message_templates_branch_id_code_channel_language_key"
    UNIQUE ("branch_id", "code", "channel", "language")
);
CREATE INDEX "branch_message_templates_shop_id_branch_id_idx" ON "branch_message_templates"("shop_id", "branch_id");
CREATE INDEX "branch_message_templates_event_type_idx" ON "branch_message_templates"("event_type");
CREATE INDEX "branch_message_templates_is_active_idx" ON "branch_message_templates"("is_active");

CREATE TABLE "branch_message_template_versions" (
  "id" SERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "template_id" INTEGER NOT NULL REFERENCES "branch_message_templates"("id") ON DELETE CASCADE,
  "version" INTEGER NOT NULL,
  "subject" TEXT,
  "content" TEXT NOT NULL,
  "allowed_variables" JSONB,
  "change_reason" TEXT,
  "created_by_id" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "branch_message_template_versions_uuid_key" UNIQUE ("uuid"),
  CONSTRAINT "branch_message_template_versions_template_id_version_key" UNIQUE ("template_id", "version")
);

CREATE TABLE "branch_communication_logs" (
  "id" SERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "branch_id" INTEGER NOT NULL REFERENCES "branches"("id") ON DELETE CASCADE,
  "customer_id" INTEGER REFERENCES "customers"("id") ON DELETE SET NULL,
  "template_id" INTEGER REFERENCES "branch_message_templates"("id") ON DELETE SET NULL,
  "channel" "CommunicationChannel" NOT NULL,
  "event_type" TEXT,
  "recipient" TEXT NOT NULL,
  "recipient_masked" TEXT,
  "subject" TEXT,
  "rendered_content" TEXT,
  "content_hash" TEXT,
  "status" "CommunicationStatus" NOT NULL DEFAULT 'QUEUED',
  "provider" TEXT,
  "provider_message_id" TEXT,
  "idempotency_key" TEXT UNIQUE,
  "reference_type" TEXT,
  "reference_id" TEXT,
  "error_code" TEXT,
  "error_message" TEXT,
  "requested_by_id" INTEGER,
  "sent_at" TIMESTAMP(3),
  "delivered_at" TIMESTAMP(3),
  "failed_at" TIMESTAMP(3),
  "metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "branch_communication_logs_uuid_key" UNIQUE ("uuid")
);
CREATE INDEX "branch_communication_logs_shop_id_branch_id_idx" ON "branch_communication_logs"("shop_id", "branch_id");
CREATE INDEX "branch_communication_logs_customer_id_idx" ON "branch_communication_logs"("customer_id");
CREATE INDEX "branch_communication_logs_status_idx" ON "branch_communication_logs"("status");
CREATE INDEX "branch_communication_logs_provider_message_id_idx" ON "branch_communication_logs"("provider_message_id");
CREATE INDEX "branch_communication_logs_reference_type_reference_id_idx" ON "branch_communication_logs"("reference_type", "reference_id");

CREATE TABLE "branch_documents" (
  "id" SERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "document_number" TEXT NOT NULL,
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "branch_id" INTEGER NOT NULL REFERENCES "branches"("id") ON DELETE CASCADE,
  "document_type" "BranchDocumentType" NOT NULL,
  "status" "BranchDocumentStatus" NOT NULL DEFAULT 'DRAFT',
  "title" TEXT NOT NULL,
  "description" TEXT,
  "reference_type" TEXT,
  "reference_id" TEXT,
  "storage_bucket" TEXT NOT NULL,
  "storage_path" TEXT NOT NULL,
  "mime_type" TEXT NOT NULL,
  "file_size" INTEGER NOT NULL,
  "settings_snapshot" JSONB,
  "metadata" JSONB,
  "generated_by_id" INTEGER,
  "uploaded_by_id" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "archived_at" TIMESTAMP(3),
  CONSTRAINT "branch_documents_uuid_key" UNIQUE ("uuid"),
  CONSTRAINT "branch_documents_document_number_key" UNIQUE ("document_number")
);
CREATE INDEX "branch_documents_shop_id_branch_id_idx" ON "branch_documents"("shop_id", "branch_id");
CREATE INDEX "branch_documents_document_type_idx" ON "branch_documents"("document_type");
CREATE INDEX "branch_documents_reference_type_reference_id_idx" ON "branch_documents"("reference_type", "reference_id");
