/**
 * Seeds branch module permissions into the permissions table.
 * Run: node scripts/seed-branch-permissions.mjs
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { BRANCH_PERMISSION_SEED } from "../src/constants/branchPermissions.js";

const prisma = new PrismaClient();

async function main() {
  console.log("\n=== Seed branch permissions ===\n");

  for (const item of BRANCH_PERMISSION_SEED) {
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
