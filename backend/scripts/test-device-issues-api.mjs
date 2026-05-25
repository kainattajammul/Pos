import { listRepairDeviceIssues } from "../src/services/repairDeviceIssue.service.js";

try {
  const device = await import("../src/config/database.js").then((m) =>
    m.prisma.repairDevice.findFirst(),
  );
  if (!device) {
    console.log("no device");
    process.exit(1);
  }
  console.log("device", device.id, device.repairCategoryId, device.repairManufacturerId);
  const issues = await listRepairDeviceIssues(
    device.shopId,
    device.repairCategoryId,
    device.repairManufacturerId,
    device.id,
  );
  console.log("listed issues:", issues.length, issues[0]?.name);
} catch (e) {
  console.error("SERVICE ERR:", e.message);
  console.error(e);
} finally {
  await import("../src/config/database.js").then((m) => m.prisma.$disconnect());
}
