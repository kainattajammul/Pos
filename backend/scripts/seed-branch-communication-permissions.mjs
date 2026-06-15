/**
 * Seeds branch communication module permissions.
 * Run: node scripts/seed-branch-communication-permissions.mjs
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { BRANCH_COMMUNICATION_PERMISSION_SEED } from "../src/constants/branchCommunicationPermissions.js";
import { BRANCH_PERMISSION_SEED } from "../src/constants/branchPermissions.js";
import { BRANCH_STAFF_PERMISSION_SEED } from "../src/constants/branchStaffPermissions.js";
import { BRANCH_INVENTORY_PERMISSION_SEED } from "../src/constants/branchInventoryPermissions.js";
import { BRANCH_OPERATIONS_PERMISSION_SEED } from "../src/constants/branchOperationsPermissions.js";
import { BRANCH_FINANCE_PERMISSION_SEED } from "../src/constants/branchFinancePermissions.js";

const prisma = new PrismaClient();

async function main() {
  console.log("\n=== Seed branch communication permissions ===\n");
  const all = [
    ...BRANCH_PERMISSION_SEED,
    ...BRANCH_STAFF_PERMISSION_SEED,
    ...BRANCH_INVENTORY_PERMISSION_SEED,
    ...BRANCH_OPERATIONS_PERMISSION_SEED,
    ...BRANCH_FINANCE_PERMISSION_SEED,
    ...BRANCH_COMMUNICATION_PERMISSION_SEED,
  ];
  for (const item of all) {
    const permission = await prisma.permission.upsert({
      where: { key: item.key },
      create: { key: item.key, module: item.module },
      update: { module: item.module },
    });
    console.log(`  ✓ ${permission.key}`);
  }
  console.log("\nDone.\n");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
