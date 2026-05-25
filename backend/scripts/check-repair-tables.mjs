import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

try {
  const tables = await prisma.$queryRaw`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename LIKE 'repair%'
    ORDER BY tablename
  `;
  console.log("Repair tables:", tables);

  const migrations = await prisma.$queryRaw`
    SELECT migration_name, finished_at FROM _prisma_migrations
    ORDER BY finished_at
  `;
  console.log("Applied migrations:", migrations);
} catch (e) {
  console.error(e);
} finally {
  await prisma.$disconnect();
}
