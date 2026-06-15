-- Module 4: Branch Sales, Repairs & Operations

CREATE TYPE "BranchSaleChannel" AS ENUM (
  'IN_STORE', 'ONLINE', 'CLICK_AND_COLLECT', 'PHONE', 'REPAIR_COUNTER', 'DELIVERY', 'OTHER'
);
CREATE TYPE "BranchSaleStatus" AS ENUM (
  'DRAFT', 'PENDING', 'COMPLETED', 'PARTIALLY_REFUNDED', 'REFUNDED', 'CANCELLED', 'VOIDED'
);
CREATE TYPE "BranchSalePaymentStatus" AS ENUM ('UNPAID', 'PARTIALLY_PAID', 'PAID', 'REFUNDED');
CREATE TYPE "BranchSaleFulfilmentStatus" AS ENUM ('PENDING', 'PARTIAL', 'FULFILLED', 'CANCELLED');
CREATE TYPE "RepairTicketStatus" AS ENUM (
  'DRAFT', 'BOOKED', 'AWAITING_DROPOFF', 'RECEIVED', 'DIAGNOSING', 'AWAITING_CUSTOMER_APPROVAL',
  'APPROVED', 'PARTS_REQUIRED', 'PARTS_ORDERED', 'READY_FOR_REPAIR', 'IN_PROGRESS', 'QUALITY_CHECK',
  'COMPLETED', 'READY_FOR_COLLECTION', 'OUT_FOR_DELIVERY', 'COLLECTED', 'DELIVERED', 'ON_HOLD',
  'CANCELLED', 'UNREPAIRABLE', 'ARCHIVED'
);
CREATE TYPE "RepairPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');
CREATE TYPE "RepairIntakeMethod" AS ENUM (
  'WALK_IN', 'APPOINTMENT', 'CUSTOMER_DROPOFF', 'STAFF_PICKUP', 'COURIER', 'POSTAL'
);
CREATE TYPE "RepairReturnMethod" AS ENUM (
  'CUSTOMER_COLLECTION', 'STAFF_DELIVERY', 'COURIER', 'POSTAL'
);
CREATE TYPE "RepairHistoryEventType" AS ENUM (
  'CREATED', 'UPDATED', 'STATUS_CHANGED', 'TECHNICIAN_ASSIGNED', 'TECHNICIAN_REASSIGNED',
  'DIAGNOSIS_ADDED', 'ESTIMATE_CREATED', 'CUSTOMER_APPROVED', 'CUSTOMER_REJECTED',
  'PART_ADDED', 'PART_REMOVED', 'NOTE_ADDED', 'APPOINTMENT_LINKED', 'PAYMENT_RECORDED',
  'COMPLETED', 'READY_FOR_COLLECTION', 'COLLECTED', 'DELIVERED', 'CANCELLED',
  'WARRANTY_CREATED', 'WARRANTY_CLAIM_CREATED'
);
CREATE TYPE "BranchAppointmentType" AS ENUM (
  'IN_STORE', 'DEVICE_DROPOFF', 'DEVICE_COLLECTION', 'HOME_PICKUP', 'HOME_DELIVERY', 'REMOTE_CONSULTATION'
);
CREATE TYPE "BranchAppointmentStatus" AS ENUM (
  'PENDING', 'CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED'
);
CREATE TYPE "BranchDropoffType" AS ENUM (
  'IN_STORE_COUNTER', 'SECURE_LOCKER', 'RECEPTION', 'CURBSIDE', 'COURIER', 'POSTAL', 'THIRD_PARTY_LOCATION'
);
CREATE TYPE "BranchDeliveryStatus" AS ENUM (
  'PENDING', 'SCHEDULED', 'READY_FOR_DISPATCH', 'DISPATCHED', 'OUT_FOR_DELIVERY', 'DELIVERED',
  'FAILED', 'CANCELLED', 'RETURNED_TO_BRANCH'
);
CREATE TYPE "ServiceAreaType" AS ENUM (
  'POSTCODE', 'POSTCODE_PREFIX', 'CITY', 'COUNTY', 'RADIUS', 'CUSTOM_ZONE', 'EXCLUDED_AREA'
);
CREATE TYPE "BranchCustomerVisibilityMode" AS ENUM (
  'SHOP_WIDE', 'ASSIGNED_BRANCHES', 'HOME_BRANCH_ONLY', 'INTERACTION_BRANCHES', 'RESTRICTED'
);
CREATE TYPE "CustomerActivityType" AS ENUM (
  'CUSTOMER_CREATED', 'CUSTOMER_UPDATED', 'SALE_CREATED', 'SALE_COMPLETED', 'REFUND_CREATED',
  'APPOINTMENT_BOOKED', 'APPOINTMENT_RESCHEDULED', 'APPOINTMENT_CANCELLED', 'REPAIR_CREATED',
  'REPAIR_STATUS_CHANGED', 'REPAIR_COMPLETED', 'DEVICE_COLLECTED', 'DELIVERY_CREATED',
  'DELIVERY_COMPLETED', 'WARRANTY_CREATED', 'WARRANTY_CLAIM_CREATED', 'NOTE_ADDED', 'COMMUNICATION_SENT'
);
CREATE TYPE "WarrantyType" AS ENUM ('REPAIR', 'PRODUCT', 'PART', 'SERVICE', 'EXTENDED');
CREATE TYPE "WarrantyStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'VOIDED', 'FULLY_CLAIMED');
CREATE TYPE "WarrantyClaimStatus" AS ENUM (
  'SUBMITTED', 'UNDER_REVIEW', 'INSPECTION_REQUIRED', 'APPROVED', 'PARTIALLY_APPROVED', 'REJECTED',
  'REPAIR_IN_PROGRESS', 'REPLACEMENT_APPROVED', 'REFUND_APPROVED', 'COMPLETED', 'CANCELLED'
);

-- ─── Customers ────────────────────────────────────────────────────────────────

CREATE TABLE "customers" (
  "id" SERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "first_name" TEXT,
  "last_name" TEXT,
  "display_name" TEXT NOT NULL,
  "email" TEXT,
  "phone" TEXT,
  "mobile" TEXT,
  "address_line_1" TEXT,
  "address_line_2" TEXT,
  "city" TEXT,
  "county" TEXT,
  "postcode" TEXT,
  "country" TEXT DEFAULT 'United Kingdom',
  "notes" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "archived_at" TIMESTAMP(3),
  CONSTRAINT "customers_uuid_key" UNIQUE ("uuid")
);
CREATE INDEX "customers_shop_id_idx" ON "customers"("shop_id");
CREATE INDEX "customers_shop_id_email_idx" ON "customers"("shop_id", "email");
CREATE INDEX "customers_shop_id_phone_idx" ON "customers"("shop_id", "phone");

CREATE TABLE "branch_customers" (
  "id" SERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "branch_id" INTEGER NOT NULL REFERENCES "branches"("id") ON DELETE CASCADE,
  "customer_id" INTEGER NOT NULL REFERENCES "customers"("id") ON DELETE CASCADE,
  "first_interaction_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "last_interaction_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "total_sales_count" INTEGER NOT NULL DEFAULT 0,
  "total_repairs_count" INTEGER NOT NULL DEFAULT 0,
  "total_appointments_count" INTEGER NOT NULL DEFAULT 0,
  "total_spend" DECIMAL(16,2) NOT NULL DEFAULT 0,
  "outstanding_balance" DECIMAL(16,2) NOT NULL DEFAULT 0,
  "preferred_branch" BOOLEAN NOT NULL DEFAULT false,
  "is_blocked" BOOLEAN NOT NULL DEFAULT false,
  "block_reason" TEXT,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "branch_customers_uuid_key" UNIQUE ("uuid"),
  CONSTRAINT "branch_customers_branch_id_customer_id_key" UNIQUE ("branch_id", "customer_id")
);
CREATE INDEX "branch_customers_shop_id_branch_id_idx" ON "branch_customers"("shop_id", "branch_id");
CREATE INDEX "branch_customers_customer_id_idx" ON "branch_customers"("customer_id");

CREATE TABLE "branch_customer_activities" (
  "id" SERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "branch_id" INTEGER NOT NULL REFERENCES "branches"("id") ON DELETE CASCADE,
  "customer_id" INTEGER NOT NULL REFERENCES "customers"("id") ON DELETE CASCADE,
  "activity_type" "CustomerActivityType" NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "reference_type" TEXT,
  "reference_id" TEXT,
  "metadata" JSONB,
  "performed_by_id" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "branch_customer_activities_uuid_key" UNIQUE ("uuid")
);
CREATE INDEX "branch_customer_activities_shop_id_branch_id_idx" ON "branch_customer_activities"("shop_id", "branch_id");
CREATE INDEX "branch_customer_activities_customer_id_created_at_idx" ON "branch_customer_activities"("customer_id", "created_at");
CREATE INDEX "branch_customer_activities_reference_type_reference_id_idx" ON "branch_customer_activities"("reference_type", "reference_id");

CREATE TABLE "branch_customer_visibility_rules" (
  "id" SERIAL PRIMARY KEY,
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "branch_id" INTEGER NOT NULL UNIQUE REFERENCES "branches"("id") ON DELETE CASCADE,
  "visibility_mode" "BranchCustomerVisibilityMode" NOT NULL DEFAULT 'INTERACTION_BRANCHES',
  "allow_cross_branch_search" BOOLEAN NOT NULL DEFAULT false,
  "allow_contact_details_view" BOOLEAN NOT NULL DEFAULT true,
  "allow_address_view" BOOLEAN NOT NULL DEFAULT false,
  "allow_activity_history_view" BOOLEAN NOT NULL DEFAULT true,
  "allow_sales_history_view" BOOLEAN NOT NULL DEFAULT true,
  "allow_repair_history_view" BOOLEAN NOT NULL DEFAULT true,
  "allow_warranty_history_view" BOOLEAN NOT NULL DEFAULT true,
  "allow_customer_export" BOOLEAN NOT NULL DEFAULT false,
  "mask_sensitive_fields" BOOLEAN NOT NULL DEFAULT false,
  "created_by_id" INTEGER,
  "updated_by_id" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "branch_customer_visibility_rules_shop_id_idx" ON "branch_customer_visibility_rules"("shop_id");

-- ─── Branch Operations ────────────────────────────────────────────────────────

CREATE TABLE "branch_operation_settings" (
  "id" SERIAL PRIMARY KEY,
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "branch_id" INTEGER NOT NULL UNIQUE REFERENCES "branches"("id") ON DELETE CASCADE,
  "appointment_slots_per_day" INTEGER NOT NULL DEFAULT 16,
  "pickup_enabled" BOOLEAN NOT NULL DEFAULT true,
  "delivery_radius_km" DECIMAL(10,2) NOT NULL DEFAULT 10,
  "walk_in_reserve_slots" INTEGER NOT NULL DEFAULT 3,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "branch_operation_settings_shop_id_idx" ON "branch_operation_settings"("shop_id");

CREATE TABLE "branch_operation_options" (
  "id" SERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "branch_id" INTEGER NOT NULL UNIQUE REFERENCES "branches"("id") ON DELETE CASCADE,
  "allow_customer_collection" BOOLEAN NOT NULL DEFAULT true,
  "allow_home_pickup" BOOLEAN NOT NULL DEFAULT false,
  "allow_courier_pickup" BOOLEAN NOT NULL DEFAULT false,
  "allow_postal_dropoff" BOOLEAN NOT NULL DEFAULT false,
  "allow_branch_delivery" BOOLEAN NOT NULL DEFAULT false,
  "allow_courier_delivery" BOOLEAN NOT NULL DEFAULT false,
  "allow_postal_return" BOOLEAN NOT NULL DEFAULT false,
  "pickup_fee" DECIMAL(14,2),
  "delivery_fee" DECIMAL(14,2),
  "free_pickup_minimum" DECIMAL(14,2),
  "free_delivery_minimum" DECIMAL(14,2),
  "minimum_pickup_notice_minutes" INTEGER,
  "minimum_delivery_notice_minutes" INTEGER,
  "pickup_instructions" TEXT,
  "collection_instructions" TEXT,
  "delivery_instructions" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "branch_operation_options_uuid_key" UNIQUE ("uuid")
);
CREATE INDEX "branch_operation_options_shop_id_idx" ON "branch_operation_options"("shop_id");

CREATE TABLE "branch_dropoff_rules" (
  "id" SERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "branch_id" INTEGER NOT NULL REFERENCES "branches"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "dropoff_type" "BranchDropoffType" NOT NULL,
  "is_enabled" BOOLEAN NOT NULL DEFAULT true,
  "location_name" TEXT,
  "address" TEXT,
  "instructions" TEXT,
  "requires_appointment" BOOLEAN NOT NULL DEFAULT false,
  "requires_repair_ticket" BOOLEAN NOT NULL DEFAULT true,
  "requires_id_check" BOOLEAN NOT NULL DEFAULT false,
  "requires_packaging" BOOLEAN NOT NULL DEFAULT false,
  "requires_device_backup" BOOLEAN NOT NULL DEFAULT false,
  "requires_passcode" BOOLEAN NOT NULL DEFAULT false,
  "minimum_notice_minutes" INTEGER,
  "allowed_from_time" VARCHAR(5),
  "allowed_until_time" VARCHAR(5),
  "accepted_device_types" JSONB,
  "restricted_items" JSONB,
  "required_documents" JSONB,
  "priority" INTEGER NOT NULL DEFAULT 100,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "branch_dropoff_rules_uuid_key" UNIQUE ("uuid")
);
CREATE INDEX "branch_dropoff_rules_shop_id_branch_id_idx" ON "branch_dropoff_rules"("shop_id", "branch_id");

CREATE TABLE "branch_service_areas" (
  "id" SERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "branch_id" INTEGER NOT NULL REFERENCES "branches"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "area_type" "ServiceAreaType" NOT NULL,
  "is_enabled" BOOLEAN NOT NULL DEFAULT true,
  "priority" INTEGER NOT NULL DEFAULT 100,
  "postcode" TEXT,
  "postcode_prefix" TEXT,
  "city" TEXT,
  "county" TEXT,
  "country" TEXT,
  "latitude" DECIMAL(10,7),
  "longitude" DECIMAL(10,7),
  "radius_km" DECIMAL(10,2),
  "allow_pickup" BOOLEAN NOT NULL DEFAULT false,
  "allow_delivery" BOOLEAN NOT NULL DEFAULT false,
  "pickup_fee" DECIMAL(14,2),
  "delivery_fee" DECIMAL(14,2),
  "minimum_order_value" DECIMAL(14,2),
  "estimated_delivery_minutes" INTEGER,
  "available_from" TIMESTAMP(3),
  "available_until" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "branch_service_areas_uuid_key" UNIQUE ("uuid")
);
CREATE INDEX "branch_service_areas_shop_id_branch_id_idx" ON "branch_service_areas"("shop_id", "branch_id");
CREATE INDEX "branch_service_areas_postcode_idx" ON "branch_service_areas"("postcode");
CREATE INDEX "branch_service_areas_postcode_prefix_idx" ON "branch_service_areas"("postcode_prefix");

-- ─── Repair Tickets (before sales, appointments, deliveries) ──────────────────

CREATE TABLE "branch_repair_tickets" (
  "id" SERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "ticket_number" TEXT NOT NULL,
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "branch_id" INTEGER NOT NULL REFERENCES "branches"("id") ON DELETE CASCADE,
  "customer_id" INTEGER REFERENCES "customers"("id") ON DELETE SET NULL,
  "assigned_technician_id" INTEGER,
  "created_by_id" INTEGER,
  "updated_by_id" INTEGER,
  "service_id" INTEGER,
  "status" "RepairTicketStatus" NOT NULL DEFAULT 'DRAFT',
  "priority" "RepairPriority" NOT NULL DEFAULT 'NORMAL',
  "repair_type" TEXT,
  "device_category" TEXT,
  "manufacturer" TEXT,
  "model" TEXT,
  "colour" TEXT,
  "serial_number" TEXT,
  "imei" TEXT,
  "customer_issue" TEXT NOT NULL,
  "technician_diagnosis" TEXT,
  "internal_notes" TEXT,
  "customer_notes" TEXT,
  "estimated_cost" DECIMAL(14,2),
  "approved_cost" DECIMAL(14,2),
  "final_cost" DECIMAL(14,2),
  "estimated_completion_at" TIMESTAMP(3),
  "completed_at" TIMESTAMP(3),
  "collected_at" TIMESTAMP(3),
  "cancelled_at" TIMESTAMP(3),
  "intake_method" "RepairIntakeMethod" NOT NULL DEFAULT 'WALK_IN',
  "return_method" "RepairReturnMethod" NOT NULL DEFAULT 'CUSTOMER_COLLECTION',
  "warranty_period_days" INTEGER,
  "warranty_expires_at" TIMESTAMP(3),
  "version" INTEGER NOT NULL DEFAULT 1,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "archived_at" TIMESTAMP(3),
  CONSTRAINT "branch_repair_tickets_uuid_key" UNIQUE ("uuid"),
  CONSTRAINT "branch_repair_tickets_ticket_number_key" UNIQUE ("ticket_number")
);
CREATE INDEX "branch_repair_tickets_shop_id_branch_id_idx" ON "branch_repair_tickets"("shop_id", "branch_id");
CREATE INDEX "branch_repair_tickets_branch_id_status_idx" ON "branch_repair_tickets"("branch_id", "status");
CREATE INDEX "branch_repair_tickets_customer_id_idx" ON "branch_repair_tickets"("customer_id");
CREATE INDEX "branch_repair_tickets_assigned_technician_id_idx" ON "branch_repair_tickets"("assigned_technician_id");
CREATE INDEX "branch_repair_tickets_created_at_idx" ON "branch_repair_tickets"("created_at");
CREATE INDEX "branch_repair_tickets_estimated_completion_at_idx" ON "branch_repair_tickets"("estimated_completion_at");

-- ─── Appointments ─────────────────────────────────────────────────────────────

CREATE TABLE "branch_appointments" (
  "id" SERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "appointment_number" TEXT NOT NULL,
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "branch_id" INTEGER NOT NULL REFERENCES "branches"("id") ON DELETE CASCADE,
  "customer_id" INTEGER REFERENCES "customers"("id") ON DELETE SET NULL,
  "service_id" INTEGER,
  "repair_ticket_id" INTEGER REFERENCES "branch_repair_tickets"("id") ON DELETE SET NULL,
  "assigned_staff_id" INTEGER,
  "assigned_technician_id" INTEGER,
  "appointment_type" "BranchAppointmentType" NOT NULL,
  "status" "BranchAppointmentStatus" NOT NULL DEFAULT 'PENDING',
  "starts_at" TIMESTAMP(3) NOT NULL,
  "ends_at" TIMESTAMP(3) NOT NULL,
  "duration_minutes" INTEGER NOT NULL,
  "buffer_minutes" INTEGER NOT NULL DEFAULT 0,
  "customer_name" TEXT,
  "customer_email" TEXT,
  "customer_phone" TEXT,
  "device_category" TEXT,
  "manufacturer" TEXT,
  "model" TEXT,
  "issue_summary" TEXT,
  "customer_notes" TEXT,
  "internal_notes" TEXT,
  "confirmation_sent_at" TIMESTAMP(3),
  "reminder_sent_at" TIMESTAMP(3),
  "checked_in_at" TIMESTAMP(3),
  "completed_at" TIMESTAMP(3),
  "cancelled_at" TIMESTAMP(3),
  "cancellation_reason" TEXT,
  "idempotency_key" TEXT,
  "created_by_id" INTEGER,
  "updated_by_id" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "branch_appointments_uuid_key" UNIQUE ("uuid"),
  CONSTRAINT "branch_appointments_appointment_number_key" UNIQUE ("appointment_number"),
  CONSTRAINT "branch_appointments_idempotency_key_key" UNIQUE ("idempotency_key")
);
CREATE INDEX "branch_appointments_shop_id_branch_id_idx" ON "branch_appointments"("shop_id", "branch_id");
CREATE INDEX "branch_appointments_branch_id_starts_at_idx" ON "branch_appointments"("branch_id", "starts_at");
CREATE INDEX "branch_appointments_customer_id_idx" ON "branch_appointments"("customer_id");
CREATE INDEX "branch_appointments_status_idx" ON "branch_appointments"("status");

-- ─── Sales ────────────────────────────────────────────────────────────────────

CREATE TABLE "branch_sales" (
  "id" SERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "sale_number" TEXT NOT NULL,
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "branch_id" INTEGER NOT NULL REFERENCES "branches"("id") ON DELETE CASCADE,
  "customer_id" INTEGER REFERENCES "customers"("id") ON DELETE SET NULL,
  "cashier_id" INTEGER,
  "repair_ticket_id" INTEGER REFERENCES "branch_repair_tickets"("id") ON DELETE SET NULL,
  "appointment_id" INTEGER REFERENCES "branch_appointments"("id") ON DELETE SET NULL,
  "status" "BranchSaleStatus" NOT NULL DEFAULT 'DRAFT',
  "channel" "BranchSaleChannel" NOT NULL DEFAULT 'IN_STORE',
  "payment_status" "BranchSalePaymentStatus" NOT NULL DEFAULT 'UNPAID',
  "fulfilment_status" "BranchSaleFulfilmentStatus" NOT NULL DEFAULT 'PENDING',
  "subtotal" DECIMAL(16,2) NOT NULL DEFAULT 0,
  "discount_total" DECIMAL(16,2) NOT NULL DEFAULT 0,
  "tax_total" DECIMAL(16,2) NOT NULL DEFAULT 0,
  "total" DECIMAL(16,2) NOT NULL DEFAULT 0,
  "cost_total" DECIMAL(16,4) NOT NULL DEFAULT 0,
  "vat_rate" DECIMAL(5,2),
  "currency" TEXT NOT NULL DEFAULT 'GBP',
  "notes" TEXT,
  "completed_at" TIMESTAMP(3),
  "cancelled_at" TIMESTAMP(3),
  "idempotency_key" TEXT,
  "version" INTEGER NOT NULL DEFAULT 1,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "branch_sales_uuid_key" UNIQUE ("uuid"),
  CONSTRAINT "branch_sales_sale_number_key" UNIQUE ("sale_number"),
  CONSTRAINT "branch_sales_idempotency_key_key" UNIQUE ("idempotency_key")
);
CREATE INDEX "branch_sales_shop_id_branch_id_idx" ON "branch_sales"("shop_id", "branch_id");
CREATE INDEX "branch_sales_branch_id_status_idx" ON "branch_sales"("branch_id", "status");
CREATE INDEX "branch_sales_customer_id_idx" ON "branch_sales"("customer_id");
CREATE INDEX "branch_sales_created_at_idx" ON "branch_sales"("created_at");

CREATE TABLE "branch_sale_line_items" (
  "id" SERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "sale_id" INTEGER NOT NULL REFERENCES "branch_sales"("id") ON DELETE CASCADE,
  "item_type" TEXT NOT NULL,
  "product_id" INTEGER,
  "product_variant_id" INTEGER,
  "service_id" INTEGER,
  "branch_inventory_id" INTEGER,
  "name" TEXT NOT NULL,
  "sku" TEXT,
  "quantity" INTEGER NOT NULL,
  "unit_price" DECIMAL(14,2) NOT NULL,
  "unit_cost" DECIMAL(14,4),
  "discount_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "tax_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "line_total" DECIMAL(16,2) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "branch_sale_line_items_uuid_key" UNIQUE ("uuid")
);
CREATE INDEX "branch_sale_line_items_sale_id_idx" ON "branch_sale_line_items"("sale_id");

CREATE TABLE "branch_sale_payments" (
  "id" SERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "sale_id" INTEGER NOT NULL REFERENCES "branch_sales"("id") ON DELETE CASCADE,
  "payment_method" TEXT NOT NULL,
  "amount" DECIMAL(16,2) NOT NULL,
  "reference" TEXT,
  "paid_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "branch_sale_payments_uuid_key" UNIQUE ("uuid")
);
CREATE INDEX "branch_sale_payments_sale_id_idx" ON "branch_sale_payments"("sale_id");

-- ─── Deliveries ───────────────────────────────────────────────────────────────

CREATE TABLE "branch_deliveries" (
  "id" SERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "branch_id" INTEGER NOT NULL REFERENCES "branches"("id") ON DELETE CASCADE,
  "customer_id" INTEGER REFERENCES "customers"("id") ON DELETE SET NULL,
  "repair_ticket_id" INTEGER REFERENCES "branch_repair_tickets"("id") ON DELETE SET NULL,
  "sale_id" INTEGER REFERENCES "branch_sales"("id") ON DELETE SET NULL,
  "status" "BranchDeliveryStatus" NOT NULL DEFAULT 'PENDING',
  "delivery_method" TEXT,
  "address_line_1" TEXT,
  "address_line_2" TEXT,
  "city" TEXT,
  "postcode" TEXT,
  "delivery_fee" DECIMAL(14,2),
  "scheduled_at" TIMESTAMP(3),
  "courier_reference" TEXT,
  "tracking_number" TEXT,
  "delivery_notes" TEXT,
  "proof_of_delivery" JSONB,
  "delivered_at" TIMESTAMP(3),
  "failed_reason" TEXT,
  "created_by_id" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "branch_deliveries_uuid_key" UNIQUE ("uuid")
);
CREATE INDEX "branch_deliveries_shop_id_branch_id_idx" ON "branch_deliveries"("shop_id", "branch_id");
CREATE INDEX "branch_deliveries_status_idx" ON "branch_deliveries"("status");

-- ─── Repair Parts & History ───────────────────────────────────────────────────

CREATE TABLE "branch_repair_parts" (
  "id" SERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "repair_ticket_id" INTEGER NOT NULL REFERENCES "branch_repair_tickets"("id") ON DELETE CASCADE,
  "branch_inventory_id" INTEGER,
  "name" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "unit_cost" DECIMAL(14,4),
  "unit_price" DECIMAL(14,2),
  "is_required" BOOLEAN NOT NULL DEFAULT false,
  "is_used" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "branch_repair_parts_uuid_key" UNIQUE ("uuid")
);
CREATE INDEX "branch_repair_parts_repair_ticket_id_idx" ON "branch_repair_parts"("repair_ticket_id");

CREATE TABLE "branch_repair_history" (
  "id" SERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "shop_id" INTEGER NOT NULL,
  "branch_id" INTEGER NOT NULL,
  "repair_ticket_id" INTEGER NOT NULL REFERENCES "branch_repair_tickets"("id") ON DELETE CASCADE,
  "event_type" "RepairHistoryEventType" NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "old_values" JSONB,
  "new_values" JSONB,
  "performed_by_id" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "branch_repair_history_uuid_key" UNIQUE ("uuid")
);
CREATE INDEX "branch_repair_history_shop_id_branch_id_idx" ON "branch_repair_history"("shop_id", "branch_id");
CREATE INDEX "branch_repair_history_repair_ticket_id_created_at_idx" ON "branch_repair_history"("repair_ticket_id", "created_at");

CREATE TABLE "branch_repair_status_history" (
  "id" SERIAL PRIMARY KEY,
  "repair_ticket_id" INTEGER NOT NULL REFERENCES "branch_repair_tickets"("id") ON DELETE CASCADE,
  "from_status" "RepairTicketStatus",
  "to_status" "RepairTicketStatus" NOT NULL,
  "notes" TEXT,
  "performed_by_id" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "branch_repair_status_history_repair_ticket_id_created_at_idx" ON "branch_repair_status_history"("repair_ticket_id", "created_at");

CREATE TABLE "branch_repair_capacity" (
  "id" SERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "branch_id" INTEGER NOT NULL REFERENCES "branches"("id") ON DELETE CASCADE,
  "service_id" INTEGER,
  "device_category" TEXT,
  "day_of_week" INTEGER,
  "max_repairs_per_day" INTEGER,
  "max_concurrent_repairs" INTEGER,
  "default_duration_minutes" INTEGER,
  "emergency_capacity" INTEGER NOT NULL DEFAULT 0,
  "use_technician_capacity" BOOLEAN NOT NULL DEFAULT true,
  "is_enabled" BOOLEAN NOT NULL DEFAULT true,
  "effective_from" TIMESTAMP(3),
  "effective_until" TIMESTAMP(3),
  "created_by_id" INTEGER,
  "updated_by_id" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "branch_repair_capacity_uuid_key" UNIQUE ("uuid")
);
CREATE INDEX "branch_repair_capacity_shop_id_branch_id_idx" ON "branch_repair_capacity"("shop_id", "branch_id");
CREATE INDEX "branch_repair_capacity_branch_id_service_id_idx" ON "branch_repair_capacity"("branch_id", "service_id");

-- ─── Warranties ───────────────────────────────────────────────────────────────

CREATE TABLE "branch_warranties" (
  "id" SERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "warranty_number" TEXT NOT NULL,
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "branch_id" INTEGER NOT NULL REFERENCES "branches"("id") ON DELETE CASCADE,
  "customer_id" INTEGER REFERENCES "customers"("id") ON DELETE SET NULL,
  "repair_ticket_id" INTEGER REFERENCES "branch_repair_tickets"("id") ON DELETE SET NULL,
  "sale_id" INTEGER REFERENCES "branch_sales"("id") ON DELETE SET NULL,
  "sale_item_id" INTEGER,
  "warranty_type" "WarrantyType" NOT NULL,
  "status" "WarrantyStatus" NOT NULL DEFAULT 'ACTIVE',
  "starts_at" TIMESTAMP(3) NOT NULL,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "coverage_description" TEXT,
  "exclusions" TEXT,
  "terms_snapshot" JSONB,
  "created_by_id" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "branch_warranties_uuid_key" UNIQUE ("uuid"),
  CONSTRAINT "branch_warranties_warranty_number_key" UNIQUE ("warranty_number")
);
CREATE INDEX "branch_warranties_shop_id_branch_id_idx" ON "branch_warranties"("shop_id", "branch_id");
CREATE INDEX "branch_warranties_customer_id_idx" ON "branch_warranties"("customer_id");
CREATE INDEX "branch_warranties_repair_ticket_id_idx" ON "branch_warranties"("repair_ticket_id");
CREATE INDEX "branch_warranties_sale_id_idx" ON "branch_warranties"("sale_id");
CREATE INDEX "branch_warranties_expires_at_idx" ON "branch_warranties"("expires_at");

CREATE TABLE "branch_warranty_claims" (
  "id" SERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "claim_number" TEXT NOT NULL,
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "branch_id" INTEGER NOT NULL REFERENCES "branches"("id") ON DELETE CASCADE,
  "warranty_id" INTEGER NOT NULL REFERENCES "branch_warranties"("id") ON DELETE CASCADE,
  "customer_id" INTEGER REFERENCES "customers"("id") ON DELETE SET NULL,
  "status" "WarrantyClaimStatus" NOT NULL DEFAULT 'SUBMITTED',
  "claim_reason" TEXT NOT NULL,
  "reported_issue" TEXT NOT NULL,
  "assessment_notes" TEXT,
  "resolution_notes" TEXT,
  "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "assessed_at" TIMESTAMP(3),
  "approved_at" TIMESTAMP(3),
  "rejected_at" TIMESTAMP(3),
  "completed_at" TIMESTAMP(3),
  "submitted_by_id" INTEGER,
  "assessed_by_id" INTEGER,
  "approved_by_id" INTEGER,
  "completed_by_id" INTEGER,
  "rejection_reason" TEXT,
  "replacement_repair_id" INTEGER,
  "version" INTEGER NOT NULL DEFAULT 1,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "branch_warranty_claims_uuid_key" UNIQUE ("uuid"),
  CONSTRAINT "branch_warranty_claims_claim_number_key" UNIQUE ("claim_number")
);
CREATE INDEX "branch_warranty_claims_shop_id_branch_id_idx" ON "branch_warranty_claims"("shop_id", "branch_id");
CREATE INDEX "branch_warranty_claims_warranty_id_idx" ON "branch_warranty_claims"("warranty_id");
CREATE INDEX "branch_warranty_claims_customer_id_idx" ON "branch_warranty_claims"("customer_id");
CREATE INDEX "branch_warranty_claims_status_idx" ON "branch_warranty_claims"("status");

CREATE TABLE "branch_warranty_claim_history" (
  "id" SERIAL PRIMARY KEY,
  "claim_id" INTEGER NOT NULL REFERENCES "branch_warranty_claims"("id") ON DELETE CASCADE,
  "from_status" "WarrantyClaimStatus",
  "to_status" "WarrantyClaimStatus" NOT NULL,
  "action" TEXT NOT NULL,
  "notes" TEXT,
  "performed_by_id" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "branch_warranty_claim_history_claim_id_created_at_idx" ON "branch_warranty_claim_history"("claim_id", "created_at");
