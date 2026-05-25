import { prisma } from "../src/config/database.js";

try {
  await prisma.$connect();
  console.log("connected");

  const tables = await prisma.$queryRaw`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'repair_device_issues'
  `;
  console.log("table exists:", tables);

  const count = await prisma.repairDeviceIssue.count();
  console.log("issue count:", count);

  const device = await prisma.repairDevice.findFirst();
  console.log("sample device:", device?.id, device?.name);

  if (device) {
    const issues = await prisma.repairDeviceIssue.findMany({
      where: { repairDeviceId: device.id },
    });
    console.log("issues for device:", issues.length);
  }
} catch (e) {
  console.error("ERR:", e.message);
  console.error(e);
} finally {
  await prisma.$disconnect();
}
