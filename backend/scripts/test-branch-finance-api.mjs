/**
 * E2E Branch Finance API tests.
 * Run: ENABLE_DEV_AUTH_BYPASS=true node scripts/test-branch-finance-api.mjs
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
  if (!shop) shop = await prisma.shop.create({ data: { name: "Finance Test Shop" } });

  let branch = await prisma.branch.findFirst({ where: { shopId: shop.id, deletedAt: null } });
  if (!branch) {
    branch = await prisma.branch.create({
      data: {
        shopId: shop.id,
        branchCode: `BR-FIN-${Date.now().toString().slice(-4)}`,
        name: "Finance Test Branch",
        slug: `finance-test-${Date.now()}`,
        status: "ACTIVE",
        isActive: true,
      },
    });
  }

  return { shopId: shop.id, branchUuid: branch.uuid };
}

async function main() {
  console.log("\n=== Branch Finance API E2E ===\n");
  const { shopId, branchUuid } = await ensureFixtures();
  const base = `/shops/${shopId}/branches/${branchUuid}`;

  const settings = await request("GET", `${base}/finance-settings`);
  assert(settings.status === 200, "get finance settings");
  assert(settings.json.data?.currency != null, "settings has currency");

  const patch = await request("PATCH", `${base}/finance-settings`, {
    vat_rate: "20%",
    currency: "GBP",
    timezone: "Europe/London",
    end_of_day_required: true,
  });
  assert(patch.status === 200, "patch finance settings");

  const register = await request("POST", `${base}/registers`, {
    register_code: `REG-${Date.now().toString().slice(-6)}`,
    name: "Test Register",
    is_default: true,
  });
  assert(register.status === 201, "create register", JSON.stringify(register.json));

  const registers = await request("GET", `${base}/registers`);
  assert(registers.status === 200, "list registers");
  assert(Array.isArray(registers.json.data), "registers returns array");

  const payments = await request("GET", `${base}/payments`);
  assert(payments.status === 200, "list payments");
  assert(payments.json.meta?.total === 0 || Array.isArray(payments.json.data), "payments empty or list");

  const invoices = await request("GET", `${base}/invoices`);
  assert(invoices.status === 200, "list invoices");

  const refunds = await request("GET", `${base}/refunds`);
  assert(refunds.status === 200, "list refunds");

  const expenses = await request("GET", `${base}/expenses`);
  assert(expenses.status === 200, "list expenses");

  const tax = await request("GET", `${base}/tax-profile`);
  assert(tax.status === 200, "get tax profile");

  const pnl = await request("GET", `${base}/profit-loss`);
  assert(pnl.status === 200, "get profit and loss");

  const eod = await request("POST", `${base}/end-of-day/generate`, {});
  assert(eod.status === 201, "generate end of day", JSON.stringify(eod.json));

  console.log(`\n${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
