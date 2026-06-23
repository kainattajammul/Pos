/**
 * E2E Branch Operations API tests.
 * Run: ENABLE_DEV_AUTH_BYPASS=true node scripts/test-branch-operations-api.mjs
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
  if (!shop) shop = await prisma.shop.create({ data: { name: "Ops Test Shop" } });

  let branch = await prisma.branch.findFirst({ where: { shopId: shop.id, deletedAt: null } });
  if (!branch) {
    branch = await prisma.branch.create({
      data: {
        shopId: shop.id,
        branchCode: `BR-OPS-${Date.now().toString().slice(-4)}`,
        name: "Ops Test Branch",
        slug: `ops-test-${Date.now()}`,
        status: "ACTIVE",
        isActive: true,
      },
    });
  }

  return { shopId: shop.id, branchUuid: branch.uuid };
}

async function main() {
  console.log("\n=== Branch Operations API E2E ===\n");
  const { shopId, branchUuid } = await ensureFixtures();
  const base = `/shops/${shopId}/branches/${branchUuid}`;

  const settings = await request("GET", `${base}/operations-settings`);
  assert(settings.status === 200, "get operations settings");
  assert(settings.json.data?.appointment_slots_per_day != null, "settings has appointment slots");

  const customer = await request("POST", `${base}/customers`, {
    display_name: "Ops Test Customer",
    email: `ops-${Date.now()}@example.com`,
    phone: "07123456789",
  });
  assert(customer.status === 201, "create customer", JSON.stringify(customer.json));

  const repair = await request("POST", `${base}/repairs`, {
    customer_issue: "Screen not responding",
    device_category: "Mobile Phone",
    manufacturer: "Apple",
    model: "iPhone 15",
    priority: "normal",
    customer_id: customer.json.data?.id,
  });
  assert(repair.status === 201, "create repair ticket", JSON.stringify(repair.json));

  const repairs = await request("GET", `${base}/repairs`);
  assert(repairs.status === 200, "list repairs");
  assert((repairs.json.data?.length ?? 0) >= 1, "repairs list not empty");

  const sale = await request("POST", `${base}/sales`, {
    channel: "in_store",
    line_items: [
      {
        item_type: "service",
        name: "Diagnostic fee",
        quantity: 1,
        unit_price: 25,
      },
    ],
  });
  assert(sale.status === 201, "create sale", JSON.stringify(sale.json));

  const capacity = await request("GET", `${base}/repair-capacity/availability?date=${new Date().toISOString().slice(0, 10)}`);
  assert(capacity.status === 200, "repair capacity availability");

  console.log(`\n${passed} passed, ${failed} failed\n`);
  await prisma.$disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
