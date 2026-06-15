-- Branch Setup & Profile module

CREATE TYPE "BranchType" AS ENUM ('MAIN', 'STANDARD', 'FRANCHISE', 'WAREHOUSE', 'KIOSK', 'SERVICE_CENTRE', 'ONLINE', 'OTHER');
CREATE TYPE "BranchStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE', 'TEMPORARILY_CLOSED', 'ARCHIVED');
CREATE TYPE "BranchManualOpeningStatus" AS ENUM ('OPEN', 'CLOSED', 'TEMPORARILY_CLOSED');
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');
CREATE TYPE "BranchClosureType" AS ENUM ('PUBLIC_HOLIDAY', 'MAINTENANCE', 'EMERGENCY', 'STAFF_EVENT', 'TEMPORARY_CLOSURE', 'CUSTOM');

ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "uuid" UUID;
UPDATE "branches" SET "uuid" = gen_random_uuid() WHERE "uuid" IS NULL;
ALTER TABLE "branches" ALTER COLUMN "uuid" SET NOT NULL;
ALTER TABLE "branches" ADD CONSTRAINT "branches_uuid_key" UNIQUE ("uuid");

ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "branch_code" TEXT;
ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "slug" TEXT;
ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "branch_type" "BranchType" NOT NULL DEFAULT 'STANDARD';
ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "address_line_1" TEXT;
ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "address_line_2" TEXT;
ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "city" TEXT;
ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "county" TEXT;
ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "postcode" TEXT;
ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "country" TEXT DEFAULT 'United Kingdom';
ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "latitude" DECIMAL(10,7);
ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "longitude" DECIMAL(10,7);
ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "alternative_phone" TEXT;
ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "contact_person_name" TEXT;
ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "contact_person_phone" TEXT;
ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "contact_person_email" TEXT;
ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "timezone" TEXT NOT NULL DEFAULT 'Europe/London';
ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "status" "BranchStatus" NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "manual_opening_status" "BranchManualOpeningStatus";
ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "manual_status_expires_at" TIMESTAMP(3);
ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "is_primary" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "archived_at" TIMESTAMP(3);
ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "created_by" INTEGER;
ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "updated_by" INTEGER;
ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);

UPDATE "branches"
SET
  "address_line_1" = COALESCE("address_line_1", "address"),
  "branch_code" = COALESCE("branch_code", 'BR-' || LPAD(id::text, 3, '0')),
  "slug" = COALESCE("slug", LOWER(REGEXP_REPLACE(REGEXP_REPLACE("name", '[^a-zA-Z0-9]+', '-', 'g'), '(^-|-$)', '', 'g')))
WHERE "branch_code" IS NULL OR "slug" IS NULL;

ALTER TABLE "branches" ALTER COLUMN "branch_code" SET NOT NULL;
ALTER TABLE "branches" ALTER COLUMN "slug" SET NOT NULL;

ALTER TABLE "branches" DROP COLUMN IF EXISTS "address";

CREATE UNIQUE INDEX IF NOT EXISTS "branches_shop_id_branch_code_key" ON "branches"("shop_id", "branch_code");
CREATE UNIQUE INDEX IF NOT EXISTS "branches_shop_id_slug_key" ON "branches"("shop_id", "slug");
CREATE INDEX IF NOT EXISTS "branches_status_idx" ON "branches"("status");
CREATE INDEX IF NOT EXISTS "branches_branch_type_idx" ON "branches"("branch_type");
CREATE INDEX IF NOT EXISTS "branches_city_idx" ON "branches"("city");
CREATE INDEX IF NOT EXISTS "branches_deleted_at_idx" ON "branches"("deleted_at");

ALTER TABLE "branches" ADD CONSTRAINT "branches_created_by_fkey"
  FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "branches" ADD CONSTRAINT "branches_updated_by_fkey"
  FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "branch_opening_hours" (
  "id" SERIAL NOT NULL,
  "branch_id" INTEGER NOT NULL,
  "shop_id" INTEGER NOT NULL,
  "day_of_week" "DayOfWeek" NOT NULL,
  "is_closed" BOOLEAN NOT NULL DEFAULT false,
  "opens_at" VARCHAR(5),
  "closes_at" VARCHAR(5),
  "break_starts_at" VARCHAR(5),
  "break_ends_at" VARCHAR(5),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "branch_opening_hours_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "branch_opening_hours_branch_id_day_of_week_key" ON "branch_opening_hours"("branch_id", "day_of_week");
CREATE INDEX "branch_opening_hours_shop_id_idx" ON "branch_opening_hours"("shop_id");

ALTER TABLE "branch_opening_hours" ADD CONSTRAINT "branch_opening_hours_branch_id_shop_id_fkey"
  FOREIGN KEY ("branch_id", "shop_id") REFERENCES "branches"("id", "shop_id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "branch_closures" (
  "id" SERIAL NOT NULL,
  "branch_id" INTEGER NOT NULL,
  "shop_id" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "reason" TEXT,
  "closure_type" "BranchClosureType" NOT NULL DEFAULT 'CUSTOM',
  "starts_at" TIMESTAMP(3) NOT NULL,
  "ends_at" TIMESTAMP(3) NOT NULL,
  "all_day" BOOLEAN NOT NULL DEFAULT true,
  "is_recurring" BOOLEAN NOT NULL DEFAULT false,
  "recurrence_rule" TEXT,
  "created_by" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "branch_closures_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "branch_closures_branch_id_idx" ON "branch_closures"("branch_id");
CREATE INDEX "branch_closures_shop_id_idx" ON "branch_closures"("shop_id");
CREATE INDEX "branch_closures_starts_at_ends_at_idx" ON "branch_closures"("starts_at", "ends_at");

ALTER TABLE "branch_closures" ADD CONSTRAINT "branch_closures_branch_id_shop_id_fkey"
  FOREIGN KEY ("branch_id", "shop_id") REFERENCES "branches"("id", "shop_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "branch_closures" ADD CONSTRAINT "branch_closures_created_by_fkey"
  FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "audit_logs" (
  "id" SERIAL NOT NULL,
  "shop_id" INTEGER NOT NULL,
  "branch_id" INTEGER,
  "user_id" INTEGER,
  "action" TEXT NOT NULL,
  "entity" TEXT NOT NULL,
  "entity_id" TEXT,
  "old_values" JSONB,
  "new_values" JSONB,
  "ip_address" TEXT,
  "user_agent" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "audit_logs_shop_id_idx" ON "audit_logs"("shop_id");
CREATE INDEX "audit_logs_branch_id_idx" ON "audit_logs"("branch_id");
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_shop_id_fkey"
  FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_branch_id_fkey"
  FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
