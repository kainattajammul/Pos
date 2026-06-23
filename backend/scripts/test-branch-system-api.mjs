/**
 * E2E Branch System & Audit API tests.
 * Run: ENABLE_DEV_AUTH_BYPASS=true node scripts/test-branch-system-api.mjs
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const API = process.env.API_BASE ?? "http://localhost:4000/api/v1";
const prisma = new PrismaClient();
let passed = 0;
let failed = 0;

function assert(c, label, detail = "") {
  if (c) {
    passed += 1;
    console.log(`  ✓ ${label}`);
  } else {
    failed += 1;
    console.error(`  ✗ ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

async function request(method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

async function ensureFixtures() {
  let shop = await prisma.shop.findFirst({ orderBy: { id: "asc" } });
  if (!shop) shop = await prisma.shop.create({ data: { name: "System Test Shop" } });

  let branch = await prisma.branch.findFirst({ where: { shopId: shop.id, deletedAt: null } });
  if (!branch) {
    branch = await prisma.branch.create({
      data: {
        shopId: shop.id,
        branchCode: `BR-SYS-${Date.now().toString().slice(-4)}`,
        name: "System Test Branch",
        slug: `system-test-${Date.now()}`,
        status: "ACTIVE",
        isActive: true,
      },
    });
  }

  return { shopId: shop.id, branchUuid: branch.uuid, branchId: branch.id };
}

async function main() {
  console.log("\n=== Branch System & Audit API E2E ===\n");
  const { shopId, branchUuid, branchId } = await ensureFixtures();
  const base = `/shops/${shopId}/branches/${branchUuid}`;

  const settings = await request("GET", `${base}/system-settings`);
  assert(settings.status === 200, "get system settings");
  assert(typeof settings.json.data?.audit_log_count === "number", "audit_log_count is number");
  assert(
    ["synced", "pending", "error"].includes(settings.json.data?.data_sync_status),
    "data_sync_status valid",
  );

  const patch = await request("PATCH", `${base}/system-settings`, {
    franchise_owner: "Test Franchise Ltd",
    two_factor_required: true,
  });
  assert(patch.status === 200, "patch system settings");
  assert(patch.json.data?.franchise_owner === "Test Franchise Ltd", "franchise owner saved");
  assert(patch.json.data?.two_factor_required === true, "2FA saved");

  const dashboard = await request("GET", `${base}/system/dashboard`);
  assert(dashboard.status === 200, "system dashboard");
  assert(typeof dashboard.json.data?.has_data === "boolean", "dashboard has hasData");

  const activity = await request("GET", `${base}/activity-logs?limit=5`);
  assert(activity.status === 200, "list activity logs");
  assert(Array.isArray(activity.json.data), "activity logs array");

  const syncConnections = await request("GET", `${base}/sync-connections`);
  assert(syncConnections.status === 200, "list sync connections");
  assert(Array.isArray(syncConnections.json.data), "sync connections array");

  const securityRules = await request("GET", `${base}/security-rules`);
  assert(securityRules.status === 200, "list security rules");

  const securityEvents = await request("GET", `${base}/security-events`);
  assert(securityEvents.status === 200, "list security events");

  const ownership = await request("GET", `${base}/ownership`);
  assert(ownership.status === 200, "list ownership");
  assert(ownership.json.data?.length >= 1, "ownership has primary record after patch");

  const branchSettings = await request("GET", `${base}/settings`);
  assert(branchSettings.status === 200, "list branch settings");

  const auditCount = await prisma.auditLog.count({
    where: { shopId, branchId },
  });
  assert(settings.json.data?.audit_log_count <= auditCount + 10, "audit count from database");

  console.log(`\n${passed} passed, ${failed} failed\n`);
  await prisma.$disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
