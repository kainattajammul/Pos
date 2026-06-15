-- Branch Staff & Permissions module

CREATE TYPE "BranchStaffStatus" AS ENUM ('INVITED', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'ARCHIVED');
CREATE TYPE "PermissionEffect" AS ENUM ('ALLOW', 'DENY');
CREATE TYPE "StaffShiftStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'ABSENT');
CREATE TYPE "PerformancePeriodType" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'CUSTOM');
CREATE TYPE "RoleScope" AS ENUM ('SHOP', 'BRANCH');

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "uuid" UUID;
UPDATE "users" SET "uuid" = gen_random_uuid() WHERE "uuid" IS NULL;
ALTER TABLE "users" ALTER COLUMN "uuid" SET NOT NULL;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "supabase_auth_id" UUID;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_login" TIMESTAMP(3);
CREATE UNIQUE INDEX IF NOT EXISTS "users_uuid_key" ON "users"("uuid");
CREATE UNIQUE INDEX IF NOT EXISTS "users_supabase_auth_id_key" ON "users"("supabase_auth_id");

ALTER TABLE "roles" ADD COLUMN IF NOT EXISTS "uuid" UUID;
UPDATE "roles" SET "uuid" = gen_random_uuid() WHERE "uuid" IS NULL;
ALTER TABLE "roles" ALTER COLUMN "uuid" SET NOT NULL;
ALTER TABLE "roles" ADD COLUMN IF NOT EXISTS "code" TEXT;
ALTER TABLE "roles" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "roles" ADD COLUMN IF NOT EXISTS "is_system" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "roles" ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "roles" ADD COLUMN IF NOT EXISTS "scope" "RoleScope" NOT NULL DEFAULT 'SHOP';
CREATE UNIQUE INDEX IF NOT EXISTS "roles_uuid_key" ON "roles"("uuid");
CREATE UNIQUE INDEX IF NOT EXISTS "roles_shop_id_code_key" ON "roles"("shop_id", "code");

CREATE TABLE "branch_staff_assignments" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "shop_id" INTEGER NOT NULL,
    "branch_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "shop_member_id" INTEGER,
    "employment_title" TEXT,
    "employee_code" TEXT,
    "status" "BranchStaffStatus" NOT NULL DEFAULT 'ACTIVE',
    "is_primary_branch" BOOLEAN NOT NULL DEFAULT false,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "assigned_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3),
    CONSTRAINT "branch_staff_assignments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "branch_staff_role_assignments" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "shop_id" INTEGER NOT NULL,
    "staff_assignment_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,
    "assigned_by" INTEGER,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "branch_staff_role_assignments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "branch_user_permissions" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "shop_id" INTEGER NOT NULL,
    "staff_assignment_id" INTEGER NOT NULL,
    "permission_id" INTEGER NOT NULL,
    "effect" "PermissionEffect" NOT NULL,
    "assigned_by" INTEGER,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "branch_user_permissions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "branch_staff_shifts" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "shop_id" INTEGER NOT NULL,
    "branch_id" INTEGER NOT NULL,
    "staff_assignment_id" INTEGER NOT NULL,
    "title" TEXT,
    "shift_date" DATE NOT NULL,
    "starts_at" TIMESTAMP(3) NOT NULL,
    "ends_at" TIMESTAMP(3) NOT NULL,
    "break_minutes" INTEGER NOT NULL DEFAULT 0,
    "status" "StaffShiftStatus" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "published_at" TIMESTAMP(3),
    "published_by" INTEGER,
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "branch_staff_shifts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "branch_staff_shift_recurrences" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "shop_id" INTEGER NOT NULL,
    "branch_id" INTEGER NOT NULL,
    "staff_assignment_id" INTEGER NOT NULL,
    "frequency" TEXT NOT NULL,
    "days_of_week" JSONB NOT NULL,
    "recurrence_start" DATE NOT NULL,
    "recurrence_end" DATE NOT NULL,
    "start_time" VARCHAR(5) NOT NULL,
    "end_time" VARCHAR(5) NOT NULL,
    "break_minutes" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "branch_staff_shift_recurrences_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "branch_staff_performance" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "shop_id" INTEGER NOT NULL,
    "branch_id" INTEGER NOT NULL,
    "staff_assignment_id" INTEGER NOT NULL,
    "period_type" "PerformancePeriodType" NOT NULL,
    "period_start" DATE NOT NULL,
    "period_end" DATE NOT NULL,
    "scheduled_hours" DECIMAL(10,2),
    "worked_hours" DECIMAL(10,2),
    "attendance_rate" DECIMAL(5,2),
    "sales_count" INTEGER NOT NULL DEFAULT 0,
    "sales_value" DECIMAL(12,2),
    "repairs_assigned" INTEGER NOT NULL DEFAULT 0,
    "repairs_completed" INTEGER NOT NULL DEFAULT 0,
    "repair_success_rate" DECIMAL(5,2),
    "refunds_count" INTEGER NOT NULL DEFAULT 0,
    "customer_rating" DECIMAL(3,2),
    "target_value" DECIMAL(12,2),
    "achieved_value" DECIMAL(12,2),
    "target_percentage" DECIMAL(6,2),
    "custom_metrics" JSONB,
    "notes" TEXT,
    "calculated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "branch_staff_performance_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "branch_security_rules" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "shop_id" INTEGER NOT NULL,
    "branch_id" INTEGER NOT NULL,
    "rule_key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "value" JSONB NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "branch_security_rules_pkey" PRIMARY KEY ("id")
);

-- Indexes & uniques
CREATE UNIQUE INDEX "branch_staff_assignments_uuid_key" ON "branch_staff_assignments"("uuid");
CREATE UNIQUE INDEX "branch_staff_assignments_branch_id_user_id_key" ON "branch_staff_assignments"("branch_id", "user_id");
CREATE UNIQUE INDEX "branch_staff_assignments_id_shop_id_key" ON "branch_staff_assignments"("id", "shop_id");
CREATE INDEX "branch_staff_assignments_shop_id_idx" ON "branch_staff_assignments"("shop_id");
CREATE INDEX "branch_staff_assignments_branch_id_idx" ON "branch_staff_assignments"("branch_id");
CREATE INDEX "branch_staff_assignments_user_id_idx" ON "branch_staff_assignments"("user_id");
CREATE INDEX "branch_staff_assignments_status_idx" ON "branch_staff_assignments"("status");
CREATE INDEX "branch_staff_assignments_employee_code_idx" ON "branch_staff_assignments"("employee_code");

CREATE UNIQUE INDEX "branch_staff_role_assignments_uuid_key" ON "branch_staff_role_assignments"("uuid");
CREATE UNIQUE INDEX "branch_staff_role_assignments_staff_assignment_id_role_id_key" ON "branch_staff_role_assignments"("staff_assignment_id", "role_id");
CREATE INDEX "branch_staff_role_assignments_shop_id_idx" ON "branch_staff_role_assignments"("shop_id");
CREATE INDEX "branch_staff_role_assignments_role_id_idx" ON "branch_staff_role_assignments"("role_id");

CREATE UNIQUE INDEX "branch_user_permissions_uuid_key" ON "branch_user_permissions"("uuid");
CREATE UNIQUE INDEX "branch_user_permissions_staff_assignment_id_permission_id_key" ON "branch_user_permissions"("staff_assignment_id", "permission_id");
CREATE INDEX "branch_user_permissions_shop_id_idx" ON "branch_user_permissions"("shop_id");

CREATE UNIQUE INDEX "branch_staff_shifts_uuid_key" ON "branch_staff_shifts"("uuid");
CREATE INDEX "branch_staff_shifts_shop_id_idx" ON "branch_staff_shifts"("shop_id");
CREATE INDEX "branch_staff_shifts_branch_id_shift_date_idx" ON "branch_staff_shifts"("branch_id", "shift_date");
CREATE INDEX "branch_staff_shifts_staff_assignment_id_starts_at_idx" ON "branch_staff_shifts"("staff_assignment_id", "starts_at");

CREATE UNIQUE INDEX "branch_staff_shift_recurrences_uuid_key" ON "branch_staff_shift_recurrences"("uuid");
CREATE INDEX "branch_staff_shift_recurrences_shop_id_idx" ON "branch_staff_shift_recurrences"("shop_id");
CREATE INDEX "branch_staff_shift_recurrences_branch_id_idx" ON "branch_staff_shift_recurrences"("branch_id");

CREATE UNIQUE INDEX "branch_staff_performance_uuid_key" ON "branch_staff_performance"("uuid");
CREATE UNIQUE INDEX "branch_staff_performance_staff_assignment_id_period_type_period_start_period_end_key" ON "branch_staff_performance"("staff_assignment_id", "period_type", "period_start", "period_end");
CREATE INDEX "branch_staff_performance_shop_id_idx" ON "branch_staff_performance"("shop_id");
CREATE INDEX "branch_staff_performance_branch_id_period_start_idx" ON "branch_staff_performance"("branch_id", "period_start");

CREATE UNIQUE INDEX "branch_security_rules_uuid_key" ON "branch_security_rules"("uuid");
CREATE UNIQUE INDEX "branch_security_rules_branch_id_rule_key_key" ON "branch_security_rules"("branch_id", "rule_key");
CREATE INDEX "branch_security_rules_shop_id_idx" ON "branch_security_rules"("shop_id");
CREATE INDEX "branch_security_rules_branch_id_idx" ON "branch_security_rules"("branch_id");

-- Foreign keys
ALTER TABLE "branch_staff_assignments" ADD CONSTRAINT "branch_staff_assignments_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "branch_staff_assignments" ADD CONSTRAINT "branch_staff_assignments_branch_id_shop_id_fkey" FOREIGN KEY ("branch_id", "shop_id") REFERENCES "branches"("id", "shop_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "branch_staff_assignments" ADD CONSTRAINT "branch_staff_assignments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "branch_staff_assignments" ADD CONSTRAINT "branch_staff_assignments_shop_member_id_fkey" FOREIGN KEY ("shop_member_id") REFERENCES "shop_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "branch_staff_assignments" ADD CONSTRAINT "branch_staff_assignments_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "branch_staff_role_assignments" ADD CONSTRAINT "branch_staff_role_assignments_staff_assignment_id_shop_id_fkey" FOREIGN KEY ("staff_assignment_id", "shop_id") REFERENCES "branch_staff_assignments"("id", "shop_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "branch_staff_role_assignments" ADD CONSTRAINT "branch_staff_role_assignments_role_id_shop_id_fkey" FOREIGN KEY ("role_id", "shop_id") REFERENCES "roles"("id", "shop_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "branch_staff_role_assignments" ADD CONSTRAINT "branch_staff_role_assignments_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "branch_user_permissions" ADD CONSTRAINT "branch_user_permissions_staff_assignment_id_shop_id_fkey" FOREIGN KEY ("staff_assignment_id", "shop_id") REFERENCES "branch_staff_assignments"("id", "shop_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "branch_user_permissions" ADD CONSTRAINT "branch_user_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "branch_user_permissions" ADD CONSTRAINT "branch_user_permissions_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "branch_staff_shifts" ADD CONSTRAINT "branch_staff_shifts_branch_id_shop_id_fkey" FOREIGN KEY ("branch_id", "shop_id") REFERENCES "branches"("id", "shop_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "branch_staff_shifts" ADD CONSTRAINT "branch_staff_shifts_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "branch_staff_shifts" ADD CONSTRAINT "branch_staff_shifts_staff_assignment_id_shop_id_fkey" FOREIGN KEY ("staff_assignment_id", "shop_id") REFERENCES "branch_staff_assignments"("id", "shop_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "branch_staff_shifts" ADD CONSTRAINT "branch_staff_shifts_published_by_fkey" FOREIGN KEY ("published_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "branch_staff_shifts" ADD CONSTRAINT "branch_staff_shifts_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "branch_staff_shifts" ADD CONSTRAINT "branch_staff_shifts_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "branch_staff_shift_recurrences" ADD CONSTRAINT "branch_staff_shift_recurrences_branch_id_shop_id_fkey" FOREIGN KEY ("branch_id", "shop_id") REFERENCES "branches"("id", "shop_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "branch_staff_shift_recurrences" ADD CONSTRAINT "branch_staff_shift_recurrences_staff_assignment_id_shop_id_fkey" FOREIGN KEY ("staff_assignment_id", "shop_id") REFERENCES "branch_staff_assignments"("id", "shop_id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "branch_staff_performance" ADD CONSTRAINT "branch_staff_performance_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "branch_staff_performance" ADD CONSTRAINT "branch_staff_performance_branch_id_shop_id_fkey" FOREIGN KEY ("branch_id", "shop_id") REFERENCES "branches"("id", "shop_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "branch_staff_performance" ADD CONSTRAINT "branch_staff_performance_staff_assignment_id_shop_id_fkey" FOREIGN KEY ("staff_assignment_id", "shop_id") REFERENCES "branch_staff_assignments"("id", "shop_id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "branch_security_rules" ADD CONSTRAINT "branch_security_rules_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "branch_security_rules" ADD CONSTRAINT "branch_security_rules_branch_id_shop_id_fkey" FOREIGN KEY ("branch_id", "shop_id") REFERENCES "branches"("id", "shop_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "branch_security_rules" ADD CONSTRAINT "branch_security_rules_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "branch_security_rules" ADD CONSTRAINT "branch_security_rules_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
