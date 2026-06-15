-- Branch Inventory & Stock module

CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'DRAFT', 'ARCHIVED');
CREATE TYPE "AllocationMode" AS ENUM ('SHARED', 'DEDICATED');
CREATE TYPE "StockMovementType" AS ENUM (
  'OPENING_BALANCE', 'PURCHASE_RECEIPT', 'SALE', 'SALE_RETURN',
  'REPAIR_PART_USED', 'REPAIR_PART_RETURNED', 'RESERVATION', 'RESERVATION_RELEASE',
  'TRANSFER_REQUESTED', 'TRANSFER_APPROVED', 'TRANSFER_DISPATCHED', 'TRANSFER_RECEIVED',
  'TRANSFER_REJECTED', 'TRANSFER_CANCELLED', 'STOCK_ADJUSTMENT_INCREASE', 'STOCK_ADJUSTMENT_DECREASE',
  'DAMAGE', 'DAMAGE_RECOVERY', 'WRITE_OFF', 'STOCK_COUNT_CORRECTION'
);
CREATE TYPE "StockAlertType" AS ENUM ('LOW_STOCK', 'OUT_OF_STOCK', 'OVERSTOCK', 'NEGATIVE_STOCK', 'REORDER_REQUIRED');
CREATE TYPE "StockAlertStatus" AS ENUM ('OPEN', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED');
CREATE TYPE "StockTransferStatus" AS ENUM (
  'DRAFT', 'REQUESTED', 'PENDING_APPROVAL', 'APPROVED', 'PARTIALLY_APPROVED', 'REJECTED',
  'READY_FOR_DISPATCH', 'DISPATCHED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED'
);
CREATE TYPE "ProductAvailabilityStatus" AS ENUM (
  'AVAILABLE', 'UNAVAILABLE', 'TEMPORARILY_UNAVAILABLE', 'HIDDEN', 'ONLINE_ONLY',
  'IN_STORE_ONLY', 'PREORDER', 'BACKORDER', 'DISCONTINUED'
);
CREATE TYPE "ServiceAvailabilityStatus" AS ENUM (
  'AVAILABLE', 'UNAVAILABLE', 'TEMPORARILY_UNAVAILABLE', 'LIMITED',
  'APPOINTMENT_ONLY', 'WALK_IN_ONLY', 'HIDDEN'
);
CREATE TYPE "StockValuationMethod" AS ENUM ('WEIGHTED_AVERAGE', 'LATEST_PURCHASE_COST', 'STANDARD_COST', 'FIFO');

CREATE TABLE "product_categories" (
  "id" SERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "product_categories_uuid_key" UNIQUE ("uuid"),
  CONSTRAINT "product_categories_shop_id_slug_key" UNIQUE ("shop_id", "slug")
);
CREATE INDEX "product_categories_shop_id_idx" ON "product_categories"("shop_id");

CREATE TABLE "products" (
  "id" SERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "category_id" INTEGER REFERENCES "product_categories"("id") ON DELETE SET NULL,
  "name" TEXT NOT NULL,
  "sku" TEXT,
  "barcode" TEXT,
  "brand" TEXT,
  "model" TEXT,
  "description" TEXT,
  "image_url" TEXT,
  "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE',
  "standard_cost" DECIMAL(14,4),
  "sale_price" DECIMAL(14,2),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "archived_at" TIMESTAMP(3),
  CONSTRAINT "products_uuid_key" UNIQUE ("uuid")
);
CREATE INDEX "products_shop_id_idx" ON "products"("shop_id");
CREATE INDEX "products_shop_id_status_idx" ON "products"("shop_id", "status");
CREATE INDEX "products_sku_idx" ON "products"("sku");
CREATE INDEX "products_barcode_idx" ON "products"("barcode");

CREATE TABLE "product_variants" (
  "id" SERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "shop_id" INTEGER NOT NULL,
  "product_id" INTEGER NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "name" TEXT,
  "sku" TEXT NOT NULL,
  "barcode" TEXT,
  "sale_price" DECIMAL(14,2),
  "is_default" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "archived_at" TIMESTAMP(3),
  CONSTRAINT "product_variants_uuid_key" UNIQUE ("uuid"),
  CONSTRAINT "product_variants_product_id_sku_key" UNIQUE ("product_id", "sku")
);
CREATE INDEX "product_variants_shop_id_idx" ON "product_variants"("shop_id");
CREATE INDEX "product_variants_product_id_idx" ON "product_variants"("product_id");
CREATE INDEX "product_variants_sku_idx" ON "product_variants"("sku");
CREATE INDEX "product_variants_barcode_idx" ON "product_variants"("barcode");

CREATE TABLE "services" (
  "id" SERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "base_price" DECIMAL(14,2),
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "archived_at" TIMESTAMP(3),
  CONSTRAINT "services_uuid_key" UNIQUE ("uuid"),
  CONSTRAINT "services_shop_id_slug_key" UNIQUE ("shop_id", "slug")
);
CREATE INDEX "services_shop_id_idx" ON "services"("shop_id");

CREATE TABLE "branch_inventory_settings" (
  "id" SERIAL PRIMARY KEY,
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "branch_id" INTEGER NOT NULL UNIQUE REFERENCES "branches"("id") ON DELETE CASCADE,
  "allocation_mode" "AllocationMode" NOT NULL DEFAULT 'DEDICATED',
  "low_stock_threshold" INTEGER NOT NULL DEFAULT 25,
  "reorder_rules_text" TEXT,
  "transfer_approval_required" BOOLEAN NOT NULL DEFAULT true,
  "valuation_method" "StockValuationMethod" NOT NULL DEFAULT 'WEIGHTED_AVERAGE',
  "allow_negative_stock" BOOLEAN NOT NULL DEFAULT false,
  "currency" TEXT NOT NULL DEFAULT 'GBP',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "branch_inventory_settings_shop_id_idx" ON "branch_inventory_settings"("shop_id");

CREATE TABLE "branch_inventories" (
  "id" SERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "branch_id" INTEGER NOT NULL REFERENCES "branches"("id") ON DELETE CASCADE,
  "product_id" INTEGER NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "product_variant_id" INTEGER REFERENCES "product_variants"("id") ON DELETE SET NULL,
  "sku" TEXT,
  "barcode" TEXT,
  "quantity_on_hand" INTEGER NOT NULL DEFAULT 0,
  "quantity_reserved" INTEGER NOT NULL DEFAULT 0,
  "quantity_incoming" INTEGER NOT NULL DEFAULT 0,
  "quantity_outgoing" INTEGER NOT NULL DEFAULT 0,
  "quantity_damaged" INTEGER NOT NULL DEFAULT 0,
  "quantity_in_repair" INTEGER NOT NULL DEFAULT 0,
  "average_cost" DECIMAL(14,4),
  "latest_purchase_cost" DECIMAL(14,4),
  "branch_selling_price" DECIMAL(14,2),
  "is_allocated" BOOLEAN NOT NULL DEFAULT true,
  "is_sellable" BOOLEAN NOT NULL DEFAULT true,
  "is_purchasable" BOOLEAN NOT NULL DEFAULT true,
  "is_transferable" BOOLEAN NOT NULL DEFAULT true,
  "shelf_location" TEXT,
  "bin_location" TEXT,
  "last_stock_movement_at" TIMESTAMP(3),
  "last_counted_at" TIMESTAMP(3),
  "version" INTEGER NOT NULL DEFAULT 1,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "archived_at" TIMESTAMP(3),
  CONSTRAINT "branch_inventories_uuid_key" UNIQUE ("uuid"),
  CONSTRAINT "branch_inventories_qty_on_hand_nonneg" CHECK ("quantity_on_hand" >= 0),
  CONSTRAINT "branch_inventories_qty_reserved_nonneg" CHECK ("quantity_reserved" >= 0),
  CONSTRAINT "branch_inventories_qty_incoming_nonneg" CHECK ("quantity_incoming" >= 0),
  CONSTRAINT "branch_inventories_qty_outgoing_nonneg" CHECK ("quantity_outgoing" >= 0),
  CONSTRAINT "branch_inventories_qty_damaged_nonneg" CHECK ("quantity_damaged" >= 0),
  CONSTRAINT "branch_inventories_qty_in_repair_nonneg" CHECK ("quantity_in_repair" >= 0)
);
CREATE INDEX "branch_inventories_shop_id_branch_id_idx" ON "branch_inventories"("shop_id", "branch_id");
CREATE INDEX "branch_inventories_branch_id_quantity_on_hand_idx" ON "branch_inventories"("branch_id", "quantity_on_hand");
CREATE INDEX "branch_inventories_product_id_idx" ON "branch_inventories"("product_id");
CREATE INDEX "branch_inventories_product_variant_id_idx" ON "branch_inventories"("product_variant_id");
CREATE INDEX "branch_inventories_sku_idx" ON "branch_inventories"("sku");
CREATE INDEX "branch_inventories_barcode_idx" ON "branch_inventories"("barcode");

CREATE UNIQUE INDEX "branch_inventories_branch_product_no_variant_key"
  ON "branch_inventories"("branch_id", "product_id")
  WHERE "product_variant_id" IS NULL;
CREATE UNIQUE INDEX "branch_inventories_branch_product_variant_key"
  ON "branch_inventories"("branch_id", "product_id", "product_variant_id")
  WHERE "product_variant_id" IS NOT NULL;

CREATE TABLE "branch_stock_movements" (
  "id" SERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "shop_id" INTEGER NOT NULL,
  "branch_id" INTEGER NOT NULL,
  "branch_inventory_id" INTEGER NOT NULL REFERENCES "branch_inventories"("id") ON DELETE CASCADE,
  "movement_type" "StockMovementType" NOT NULL,
  "quantity" INTEGER NOT NULL,
  "quantity_before" INTEGER NOT NULL,
  "quantity_after" INTEGER NOT NULL,
  "unit_cost" DECIMAL(14,4),
  "total_cost" DECIMAL(16,4),
  "reference_type" TEXT,
  "reference_id" TEXT,
  "transfer_id" INTEGER,
  "transfer_item_id" INTEGER,
  "reason_code" TEXT,
  "notes" TEXT,
  "performed_by_id" INTEGER,
  "approved_by_id" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "branch_stock_movements_uuid_key" UNIQUE ("uuid")
);
CREATE INDEX "branch_stock_movements_shop_id_branch_id_idx" ON "branch_stock_movements"("shop_id", "branch_id");
CREATE INDEX "branch_stock_movements_branch_inventory_id_created_at_idx" ON "branch_stock_movements"("branch_inventory_id", "created_at");
CREATE INDEX "branch_stock_movements_movement_type_idx" ON "branch_stock_movements"("movement_type");
CREATE INDEX "branch_stock_movements_reference_type_reference_id_idx" ON "branch_stock_movements"("reference_type", "reference_id");
CREATE INDEX "branch_stock_movements_transfer_id_idx" ON "branch_stock_movements"("transfer_id");

CREATE TABLE "branch_stock_reorder_rules" (
  "id" SERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "branch_id" INTEGER NOT NULL REFERENCES "branches"("id") ON DELETE CASCADE,
  "branch_inventory_id" INTEGER NOT NULL UNIQUE REFERENCES "branch_inventories"("id") ON DELETE CASCADE,
  "is_enabled" BOOLEAN NOT NULL DEFAULT true,
  "reorder_point" INTEGER NOT NULL,
  "reorder_quantity" INTEGER NOT NULL,
  "minimum_stock_level" INTEGER,
  "maximum_stock_level" INTEGER,
  "safety_stock_level" INTEGER,
  "preferred_supplier_id" INTEGER,
  "lead_time_days" INTEGER,
  "auto_create_request" BOOLEAN NOT NULL DEFAULT false,
  "created_by_id" INTEGER,
  "updated_by_id" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "branch_stock_reorder_rules_uuid_key" UNIQUE ("uuid")
);
CREATE INDEX "branch_stock_reorder_rules_shop_id_branch_id_idx" ON "branch_stock_reorder_rules"("shop_id", "branch_id");

CREATE TABLE "branch_low_stock_alerts" (
  "id" SERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "branch_id" INTEGER NOT NULL REFERENCES "branches"("id") ON DELETE CASCADE,
  "branch_inventory_id" INTEGER NOT NULL REFERENCES "branch_inventories"("id") ON DELETE CASCADE,
  "alert_type" "StockAlertType" NOT NULL,
  "status" "StockAlertStatus" NOT NULL DEFAULT 'OPEN',
  "current_quantity" INTEGER NOT NULL,
  "reorder_point" INTEGER,
  "message" TEXT,
  "triggered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "acknowledged_at" TIMESTAMP(3),
  "acknowledged_by_id" INTEGER,
  "resolved_at" TIMESTAMP(3),
  "resolved_by_id" INTEGER,
  CONSTRAINT "branch_low_stock_alerts_uuid_key" UNIQUE ("uuid")
);
CREATE INDEX "branch_low_stock_alerts_shop_id_branch_id_idx" ON "branch_low_stock_alerts"("shop_id", "branch_id");
CREATE INDEX "branch_low_stock_alerts_branch_inventory_id_status_idx" ON "branch_low_stock_alerts"("branch_inventory_id", "status");

CREATE TABLE "branch_stock_transfers" (
  "id" SERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "transfer_number" TEXT NOT NULL UNIQUE,
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "source_branch_id" INTEGER NOT NULL REFERENCES "branches"("id") ON DELETE CASCADE,
  "destination_branch_id" INTEGER NOT NULL REFERENCES "branches"("id") ON DELETE CASCADE,
  "status" "StockTransferStatus" NOT NULL DEFAULT 'DRAFT',
  "requested_by_id" INTEGER NOT NULL,
  "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "approved_by_id" INTEGER,
  "approved_at" TIMESTAMP(3),
  "dispatched_by_id" INTEGER,
  "dispatched_at" TIMESTAMP(3),
  "received_by_id" INTEGER,
  "received_at" TIMESTAMP(3),
  "rejected_by_id" INTEGER,
  "rejected_at" TIMESTAMP(3),
  "rejection_reason" TEXT,
  "cancelled_by_id" INTEGER,
  "cancelled_at" TIMESTAMP(3),
  "cancellation_reason" TEXT,
  "request_notes" TEXT,
  "approval_notes" TEXT,
  "dispatch_notes" TEXT,
  "receiving_notes" TEXT,
  "expected_delivery_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "branch_stock_transfers_uuid_key" UNIQUE ("uuid")
);
CREATE INDEX "branch_stock_transfers_shop_id_idx" ON "branch_stock_transfers"("shop_id");
CREATE INDEX "branch_stock_transfers_source_branch_id_status_idx" ON "branch_stock_transfers"("source_branch_id", "status");
CREATE INDEX "branch_stock_transfers_destination_branch_id_status_idx" ON "branch_stock_transfers"("destination_branch_id", "status");
CREATE INDEX "branch_stock_transfers_requested_at_idx" ON "branch_stock_transfers"("requested_at");

CREATE TABLE "branch_stock_transfer_items" (
  "id" SERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "transfer_id" INTEGER NOT NULL REFERENCES "branch_stock_transfers"("id") ON DELETE CASCADE,
  "product_id" INTEGER NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "product_variant_id" INTEGER REFERENCES "product_variants"("id") ON DELETE SET NULL,
  "source_inventory_id" INTEGER NOT NULL REFERENCES "branch_inventories"("id") ON DELETE CASCADE,
  "destination_inventory_id" INTEGER REFERENCES "branch_inventories"("id") ON DELETE SET NULL,
  "requested_quantity" INTEGER NOT NULL,
  "approved_quantity" INTEGER,
  "dispatched_quantity" INTEGER,
  "received_quantity" INTEGER,
  "damaged_quantity" INTEGER NOT NULL DEFAULT 0,
  "rejected_quantity" INTEGER NOT NULL DEFAULT 0,
  "unit_cost" DECIMAL(14,4),
  "total_cost" DECIMAL(16,4),
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "branch_stock_transfer_items_uuid_key" UNIQUE ("uuid"),
  CONSTRAINT "branch_stock_transfer_items_transfer_id_source_inventory_id_key" UNIQUE ("transfer_id", "source_inventory_id")
);
CREATE INDEX "branch_stock_transfer_items_product_id_idx" ON "branch_stock_transfer_items"("product_id");
CREATE INDEX "branch_stock_transfer_items_product_variant_id_idx" ON "branch_stock_transfer_items"("product_variant_id");

CREATE TABLE "branch_stock_transfer_history" (
  "id" SERIAL PRIMARY KEY,
  "transfer_id" INTEGER NOT NULL REFERENCES "branch_stock_transfers"("id") ON DELETE CASCADE,
  "from_status" "StockTransferStatus",
  "to_status" "StockTransferStatus" NOT NULL,
  "action" TEXT NOT NULL,
  "notes" TEXT,
  "performed_by_id" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "branch_stock_transfer_history_transfer_id_created_at_idx" ON "branch_stock_transfer_history"("transfer_id", "created_at");

CREATE TABLE "branch_product_availability" (
  "id" SERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "branch_id" INTEGER NOT NULL REFERENCES "branches"("id") ON DELETE CASCADE,
  "product_id" INTEGER NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "product_variant_id" INTEGER REFERENCES "product_variants"("id") ON DELETE SET NULL,
  "status" "ProductAvailabilityStatus" NOT NULL DEFAULT 'AVAILABLE',
  "is_visible" BOOLEAN NOT NULL DEFAULT true,
  "is_sellable" BOOLEAN NOT NULL DEFAULT true,
  "allow_backorder" BOOLEAN NOT NULL DEFAULT false,
  "allow_click_and_collect" BOOLEAN NOT NULL DEFAULT false,
  "allow_delivery" BOOLEAN NOT NULL DEFAULT false,
  "allow_in_store_sale" BOOLEAN NOT NULL DEFAULT true,
  "available_from" TIMESTAMP(3),
  "available_until" TIMESTAMP(3),
  "unavailable_reason" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "branch_product_availability_uuid_key" UNIQUE ("uuid")
);
CREATE INDEX "branch_product_availability_shop_id_branch_id_idx" ON "branch_product_availability"("shop_id", "branch_id");
CREATE UNIQUE INDEX "branch_product_availability_branch_product_no_variant_key"
  ON "branch_product_availability"("branch_id", "product_id")
  WHERE "product_variant_id" IS NULL;
CREATE UNIQUE INDEX "branch_product_availability_branch_product_variant_key"
  ON "branch_product_availability"("branch_id", "product_id", "product_variant_id")
  WHERE "product_variant_id" IS NOT NULL;

CREATE TABLE "branch_product_availability_rules" (
  "id" SERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "branch_id" INTEGER NOT NULL REFERENCES "branches"("id") ON DELETE CASCADE,
  "product_id" INTEGER REFERENCES "products"("id") ON DELETE SET NULL,
  "product_variant_id" INTEGER REFERENCES "product_variants"("id") ON DELETE SET NULL,
  "rule_type" TEXT NOT NULL,
  "priority" INTEGER NOT NULL DEFAULT 100,
  "conditions" JSONB NOT NULL,
  "actions" JSONB NOT NULL,
  "is_enabled" BOOLEAN NOT NULL DEFAULT true,
  "created_by_id" INTEGER,
  "updated_by_id" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "branch_product_availability_rules_uuid_key" UNIQUE ("uuid")
);
CREATE INDEX "branch_product_availability_rules_shop_id_branch_id_idx" ON "branch_product_availability_rules"("shop_id", "branch_id");
CREATE INDEX "branch_product_availability_rules_branch_id_rule_type_idx" ON "branch_product_availability_rules"("branch_id", "rule_type");

CREATE TABLE "branch_service_availability" (
  "id" SERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "branch_id" INTEGER NOT NULL REFERENCES "branches"("id") ON DELETE CASCADE,
  "service_id" INTEGER NOT NULL REFERENCES "services"("id") ON DELETE CASCADE,
  "status" "ServiceAvailabilityStatus" NOT NULL DEFAULT 'AVAILABLE',
  "is_visible" BOOLEAN NOT NULL DEFAULT true,
  "is_bookable" BOOLEAN NOT NULL DEFAULT true,
  "accepts_walk_ins" BOOLEAN NOT NULL DEFAULT true,
  "accepts_online_bookings" BOOLEAN NOT NULL DEFAULT true,
  "branch_price" DECIMAL(14,2),
  "estimated_minutes" INTEGER,
  "daily_capacity" INTEGER,
  "available_from" TIMESTAMP(3),
  "available_until" TIMESTAMP(3),
  "unavailable_reason" TEXT,
  "availability_rules" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "branch_service_availability_uuid_key" UNIQUE ("uuid"),
  CONSTRAINT "branch_service_availability_branch_id_service_id_key" UNIQUE ("branch_id", "service_id")
);
CREATE INDEX "branch_service_availability_shop_id_branch_id_idx" ON "branch_service_availability"("shop_id", "branch_id");
CREATE INDEX "branch_service_availability_service_id_idx" ON "branch_service_availability"("service_id");

CREATE TABLE "branch_stock_valuation_snapshots" (
  "id" SERIAL PRIMARY KEY,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "shop_id" INTEGER NOT NULL REFERENCES "shops"("id") ON DELETE CASCADE,
  "branch_id" INTEGER NOT NULL REFERENCES "branches"("id") ON DELETE CASCADE,
  "valuation_date" TIMESTAMP(3) NOT NULL,
  "valuation_method" "StockValuationMethod" NOT NULL,
  "currency" TEXT NOT NULL,
  "total_quantity" INTEGER NOT NULL,
  "available_quantity" INTEGER NOT NULL,
  "reserved_quantity" INTEGER NOT NULL,
  "damaged_quantity" INTEGER NOT NULL,
  "total_cost_value" DECIMAL(18,4) NOT NULL,
  "available_cost_value" DECIMAL(18,4) NOT NULL,
  "total_retail_value" DECIMAL(18,4) NOT NULL,
  "potential_margin" DECIMAL(18,4) NOT NULL,
  "breakdown" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "branch_stock_valuation_snapshots_uuid_key" UNIQUE ("uuid"),
  CONSTRAINT "branch_stock_valuation_snapshots_branch_id_valuation_date_valuation_method_key"
    UNIQUE ("branch_id", "valuation_date", "valuation_method")
);
CREATE INDEX "branch_stock_valuation_snapshots_shop_id_branch_id_idx" ON "branch_stock_valuation_snapshots"("shop_id", "branch_id");
