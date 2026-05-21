-- Shop + RBAC schema (replaces flat role_id / shop_id on users)

-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- AlterTable: users — drop legacy columns, add updated_at
ALTER TABLE "users" DROP COLUMN IF EXISTS "role_id";
ALTER TABLE "users" DROP COLUMN IF EXISTS "shop_id";
ALTER TABLE "users" DROP COLUMN IF EXISTS "status";
ALTER TABLE "users" DROP COLUMN IF EXISTS "last_login";

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "shops" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "vat_number" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shops_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "branches" (
    "id" SERIAL NOT NULL,
    "shop_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "branches_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "shop_members" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "shop_id" INTEGER NOT NULL,
    "status" "MemberStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shop_members_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "shop_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "permissions" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "role_permissions" (
    "role_id" INTEGER NOT NULL,
    "permission_id" INTEGER NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id","permission_id")
);

CREATE TABLE "shop_member_roles" (
    "id" SERIAL NOT NULL,
    "shop_id" INTEGER NOT NULL,
    "shop_member_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shop_member_roles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "branch_member_roles" (
    "id" SERIAL NOT NULL,
    "shop_id" INTEGER NOT NULL,
    "branch_id" INTEGER NOT NULL,
    "shop_member_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "branch_member_roles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "permissions_key_key" ON "permissions"("key");

CREATE UNIQUE INDEX "branches_id_shop_id_key" ON "branches"("id", "shop_id");
CREATE INDEX "branches_shop_id_idx" ON "branches"("shop_id");

CREATE UNIQUE INDEX "shop_members_user_id_shop_id_key" ON "shop_members"("user_id", "shop_id");
CREATE UNIQUE INDEX "shop_members_id_shop_id_key" ON "shop_members"("id", "shop_id");
CREATE INDEX "shop_members_shop_id_idx" ON "shop_members"("shop_id");
CREATE INDEX "shop_members_user_id_idx" ON "shop_members"("user_id");

CREATE UNIQUE INDEX "roles_shop_id_name_key" ON "roles"("shop_id", "name");
CREATE UNIQUE INDEX "roles_id_shop_id_key" ON "roles"("id", "shop_id");
CREATE INDEX "roles_shop_id_idx" ON "roles"("shop_id");

CREATE UNIQUE INDEX "shop_member_roles_shop_member_id_role_id_key" ON "shop_member_roles"("shop_member_id", "role_id");
CREATE INDEX "shop_member_roles_shop_id_idx" ON "shop_member_roles"("shop_id");
CREATE INDEX "shop_member_roles_role_id_idx" ON "shop_member_roles"("role_id");

CREATE UNIQUE INDEX "branch_member_roles_shop_member_id_branch_id_role_id_key" ON "branch_member_roles"("shop_member_id", "branch_id", "role_id");
CREATE INDEX "branch_member_roles_shop_id_idx" ON "branch_member_roles"("shop_id");
CREATE INDEX "branch_member_roles_branch_id_idx" ON "branch_member_roles"("branch_id");
CREATE INDEX "branch_member_roles_role_id_idx" ON "branch_member_roles"("role_id");

-- AddForeignKey
ALTER TABLE "branches" ADD CONSTRAINT "branches_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "shop_members" ADD CONSTRAINT "shop_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "shop_members" ADD CONSTRAINT "shop_members_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "roles" ADD CONSTRAINT "roles_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "shop_member_roles" ADD CONSTRAINT "shop_member_roles_shop_member_id_shop_id_fkey" FOREIGN KEY ("shop_member_id", "shop_id") REFERENCES "shop_members"("id", "shop_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "shop_member_roles" ADD CONSTRAINT "shop_member_roles_role_id_shop_id_fkey" FOREIGN KEY ("role_id", "shop_id") REFERENCES "roles"("id", "shop_id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "branch_member_roles" ADD CONSTRAINT "branch_member_roles_shop_member_id_shop_id_fkey" FOREIGN KEY ("shop_member_id", "shop_id") REFERENCES "shop_members"("id", "shop_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "branch_member_roles" ADD CONSTRAINT "branch_member_roles_branch_id_shop_id_fkey" FOREIGN KEY ("branch_id", "shop_id") REFERENCES "branches"("id", "shop_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "branch_member_roles" ADD CONSTRAINT "branch_member_roles_role_id_shop_id_fkey" FOREIGN KEY ("role_id", "shop_id") REFERENCES "roles"("id", "shop_id") ON DELETE CASCADE ON UPDATE CASCADE;
