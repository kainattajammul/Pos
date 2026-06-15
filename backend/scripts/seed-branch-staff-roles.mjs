/**
 * Seeds default branch system roles for a shop.
 * Run: SHOP_ID=1 node scripts/seed-branch-staff-roles.mjs
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { DEFAULT_BRANCH_SYSTEM_ROLES } from "../src/constants/branchStaffPermissions.js";

const prisma = new PrismaClient();
const shopId = Number(process.env.SHOP_ID ?? 1);

async function main() {
  console.log(`\n=== Seed branch roles for shop ${shopId} ===\n`);

  for (const template of DEFAULT_BRANCH_SYSTEM_ROLES) {
    const permissions = await prisma.permission.findMany({
      where: { key: { in: template.permissions } },
    });

    let role = await prisma.role.findFirst({
      where: { shopId, code: template.code },
    });

    if (!role) {
      role = await prisma.role.create({
        data: {
          shopId,
          name: template.name,
          code: template.code,
          description: template.description,
          isSystem: true,
          isActive: true,
          scope: "BRANCH",
        },
      });
      console.log(`  + role ${role.code}`);
    } else {
      console.log(`  = role ${role.code} exists`);
    }

    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    if (permissions.length) {
      await prisma.rolePermission.createMany({
        data: permissions.map((p) => ({ roleId: role.id, permissionId: p.id })),
        skipDuplicates: true,
      });
    }
  }

  console.log("\nDone.\n");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
