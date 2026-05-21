-- Full POS schema — run in Supabase SQL Editor (fresh DB or after backup)
-- Matches prisma/schema.prisma

CREATE TYPE "MemberStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

CREATE TABLE IF NOT EXISTS "users" (
    "id" SERIAL NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");

CREATE TABLE IF NOT EXISTS "shops" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "vat_number" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "shops_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "branches" (
    "id" SERIAL NOT NULL,
    "shop_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "branches_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "shop_members" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "shop_id" INTEGER NOT NULL,
    "status" "MemberStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "shop_members_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "roles" (
    "id" SERIAL NOT NULL,
    "shop_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "permissions" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "role_permissions" (
    "role_id" INTEGER NOT NULL,
    "permission_id" INTEGER NOT NULL,
    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id","permission_id")
);

CREATE TABLE IF NOT EXISTS "shop_member_roles" (
    "id" SERIAL NOT NULL,
    "shop_id" INTEGER NOT NULL,
    "shop_member_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "shop_member_roles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "branch_member_roles" (
    "id" SERIAL NOT NULL,
    "shop_id" INTEGER NOT NULL,
    "branch_id" INTEGER NOT NULL,
    "shop_member_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "branch_member_roles_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS "permissions_key_key" ON "permissions"("key");
CREATE UNIQUE INDEX IF NOT EXISTS "branches_id_shop_id_key" ON "branches"("id", "shop_id");
CREATE INDEX IF NOT EXISTS "branches_shop_id_idx" ON "branches"("shop_id");
CREATE UNIQUE INDEX IF NOT EXISTS "shop_members_user_id_shop_id_key" ON "shop_members"("user_id", "shop_id");
CREATE UNIQUE INDEX IF NOT EXISTS "shop_members_id_shop_id_key" ON "shop_members"("id", "shop_id");
CREATE INDEX IF NOT EXISTS "shop_members_shop_id_idx" ON "shop_members"("shop_id");
CREATE INDEX IF NOT EXISTS "shop_members_user_id_idx" ON "shop_members"("user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "roles_shop_id_name_key" ON "roles"("shop_id", "name");
CREATE UNIQUE INDEX IF NOT EXISTS "roles_id_shop_id_key" ON "roles"("id", "shop_id");
CREATE INDEX IF NOT EXISTS "roles_shop_id_idx" ON "roles"("shop_id");
CREATE UNIQUE INDEX IF NOT EXISTS "shop_member_roles_shop_member_id_role_id_key" ON "shop_member_roles"("shop_member_id", "role_id");
CREATE INDEX IF NOT EXISTS "shop_member_roles_shop_id_idx" ON "shop_member_roles"("shop_id");
CREATE INDEX IF NOT EXISTS "shop_member_roles_role_id_idx" ON "shop_member_roles"("role_id");
CREATE UNIQUE INDEX IF NOT EXISTS "branch_member_roles_shop_member_id_branch_id_role_id_key" ON "branch_member_roles"("shop_member_id", "branch_id", "role_id");
CREATE INDEX IF NOT EXISTS "branch_member_roles_shop_id_idx" ON "branch_member_roles"("shop_id");
CREATE INDEX IF NOT EXISTS "branch_member_roles_branch_id_idx" ON "branch_member_roles"("branch_id");
CREATE INDEX IF NOT EXISTS "branch_member_roles_role_id_idx" ON "branch_member_roles"("role_id");

-- Foreign keys (idempotent: skip if your DB already has them)
DO $$ BEGIN
  ALTER TABLE "branches" ADD CONSTRAINT "branches_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "shop_members" ADD CONSTRAINT "shop_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "shop_members" ADD CONSTRAINT "shop_members_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "roles" ADD CONSTRAINT "roles_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "shop_member_roles" ADD CONSTRAINT "shop_member_roles_shop_member_id_shop_id_fkey" FOREIGN KEY ("shop_member_id", "shop_id") REFERENCES "shop_members"("id", "shop_id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "shop_member_roles" ADD CONSTRAINT "shop_member_roles_role_id_shop_id_fkey" FOREIGN KEY ("role_id", "shop_id") REFERENCES "roles"("id", "shop_id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "branch_member_roles" ADD CONSTRAINT "branch_member_roles_shop_member_id_shop_id_fkey" FOREIGN KEY ("shop_member_id", "shop_id") REFERENCES "shop_members"("id", "shop_id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "branch_member_roles" ADD CONSTRAINT "branch_member_roles_branch_id_shop_id_fkey" FOREIGN KEY ("branch_id", "shop_id") REFERENCES "branches"("id", "shop_id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "branch_member_roles" ADD CONSTRAINT "branch_member_roles_role_id_shop_id_fkey" FOREIGN KEY ("role_id", "shop_id") REFERENCES "roles"("id", "shop_id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
