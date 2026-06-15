/**
 * E2E Branch Communication API tests.
 * Run: ENABLE_DEV_AUTH_BYPASS=true node scripts/test-branch-communication-api.mjs
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
  if (!shop) shop = await prisma.shop.create({ data: { name: "Communication Test Shop" } });

  let branch = await prisma.branch.findFirst({ where: { shopId: shop.id, deletedAt: null } });
  if (!branch) {
    branch = await prisma.branch.create({
      data: {
        shopId: shop.id,
        branchCode: `BR-COM-${Date.now().toString().slice(-4)}`,
        name: "Communication Test Branch",
        slug: `communication-test-${Date.now()}`,
        status: "ACTIVE",
        isActive: true,
      },
    });
  }

  return { shopId: shop.id, branchUuid: branch.uuid };
}

async function main() {
  console.log("\n=== Branch Communication API E2E ===\n");
  const { shopId, branchUuid } = await ensureFixtures();
  const base = `/shops/${shopId}/branches/${branchUuid}`;

  const settings = await request("GET", `${base}/communication-settings`);
  assert(settings.status === 200, "get communication settings");
  assert(typeof settings.json.data?.notifications_enabled === "boolean", "settings has notifications_enabled");

  const patch = await request("PATCH", `${base}/communication-settings`, {
    email_sender: "test@example.com",
    sms_sender: "POSBRANCH",
    receipt_header: "Thank you for your visit",
    receipt_footer: "Returns within 14 days",
    notifications_enabled: true,
    document_template: "standard",
  });
  assert(patch.status === 200, "patch communication settings");
  assert(patch.json.data?.email_sender === "test@example.com", "email sender saved");

  const notifications = await request("GET", `${base}/notification-settings`);
  assert(notifications.status === 200, "get notification settings");

  const documents = await request("GET", `${base}/documents`);
  assert(documents.status === 200, "list documents");
  assert(Array.isArray(documents.json.data), "documents returns array");

  const templates = await request("GET", `${base}/message-templates`);
  assert(templates.status === 200, "list message templates");
  assert(templates.json.meta?.total === 0 || Array.isArray(templates.json.data), "templates empty or list");

  const communications = await request("GET", `${base}/communications`);
  assert(communications.status === 200, "list communications");
  assert(communications.json.meta?.total === 0 || Array.isArray(communications.json.data), "communications empty or list");

  const variables = await request("GET", `${base}/message-template-variables`);
  assert(variables.status === 200, "get template variables");
  assert(Array.isArray(variables.json.data), "template variables array");

  console.log(`\n${passed} passed, ${failed} failed\n`);
  await prisma.$disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
