/**
 * E2E Branch Reporting API tests.
 * Run: ENABLE_DEV_AUTH_BYPASS=true node scripts/test-branch-reporting-api.mjs
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
  if (!shop) shop = await prisma.shop.create({ data: { name: "Reporting Test Shop" } });

  let branch = await prisma.branch.findFirst({ where: { shopId: shop.id, deletedAt: null } });
  if (!branch) {
    branch = await prisma.branch.create({
      data: {
        shopId: shop.id,
        branchCode: `BR-RPT-${Date.now().toString().slice(-4)}`,
        name: "Reporting Test Branch",
        slug: `reporting-test-${Date.now()}`,
        status: "ACTIVE",
        isActive: true,
      },
    });
  }

  return { shopId: shop.id, branchUuid: branch.uuid };
}

async function main() {
  console.log("\n=== Branch Reporting API E2E ===\n");
  const { shopId, branchUuid } = await ensureFixtures();
  const base = `/shops/${shopId}/branches/${branchUuid}`;

  const settings = await request("GET", `${base}/reporting-settings`);
  assert(settings.status === 200, "get reporting settings");
  assert(settings.json.data?.sales_target_monthly != null, "settings has sales target");

  const patch = await request("PATCH", `${base}/reporting-settings`, {
    sales_target_monthly: "85000.00",
    repair_target_monthly: 420,
    commission_rules: "5% on accessories",
  });
  assert(patch.status === 200, "patch reporting settings");

  const reports = await request("GET", `${base}/reports`);
  assert(reports.status === 200, "list reports");
  assert(Array.isArray(reports.json.data), "reports registry array");

  const dashboard = await request("GET", `${base}/reports/performance-dashboard?period=current_month`);
  assert(dashboard.status === 200, "performance dashboard");
  assert(typeof dashboard.json.data?.hasData === "boolean", "dashboard has hasData flag");

  const sales = await request("GET", `${base}/reports/sales?period=current_month`);
  assert(sales.status === 200, "sales report");

  const repairs = await request("GET", `${base}/reports/repairs?period=current_month`);
  assert(repairs.status === 200, "repair report");

  const inventory = await request("GET", `${base}/reports/inventory?period=current_month`);
  assert(inventory.status === 200, "inventory report");

  const payments = await request("GET", `${base}/reports/payments?period=current_month`);
  assert(payments.status === 200, "payment report");

  const cash = await request("GET", `${base}/reports/cash-drawers?period=current_month`);
  assert(cash.status === 200, "cash drawer report");

  const staff = await request("GET", `${base}/reports/staff-performance?period=current_month`);
  assert(staff.status === 200, "staff performance report");

  console.log(`\n${passed} passed, ${failed} failed\n`);
  await prisma.$disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
