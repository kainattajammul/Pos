/**
 * E2E Branch Staff API tests.
 * Run: ENABLE_DEV_AUTH_BYPASS=true node scripts/test-branch-staff-api.mjs
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
  if (!shop) shop = await prisma.shop.create({ data: { name: "Staff Test Shop" } });

  let user = await prisma.user.findFirst({ orderBy: { id: "asc" } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        fullName: "Staff Test User",
        email: `staff-test-${Date.now()}@example.com`,
        passwordHash: "x",
      },
    });
  }

  await prisma.shopMember.upsert({
    where: { userId_shopId: { userId: user.id, shopId: shop.id } },
    create: { userId: user.id, shopId: shop.id, status: "ACTIVE" },
    update: { status: "ACTIVE" },
  });

  let branch = await prisma.branch.findFirst({ where: { shopId: shop.id, deletedAt: null } });
  if (!branch) {
    branch = await prisma.branch.create({
      data: {
        shopId: shop.id,
        branchCode: `BR-STF-${Date.now().toString().slice(-4)}`,
        name: "Staff Test Branch",
        slug: `staff-test-${Date.now()}`,
        status: "ACTIVE",
        isActive: true,
      },
    });
  }

  return { shopId: shop.id, branchUuid: branch.uuid, userUuid: user.uuid, userId: user.id };
}

async function main() {
  console.log("\n=== Branch Staff API E2E ===\n");
  const { shopId, branchUuid, userUuid } = await ensureFixtures();
  const base = `/shops/${shopId}/branches/${branchUuid}`;

  const list = await request("GET", `${base}/staff`);
  assert(list.status === 200, "list staff");

  const assign = await request("POST", `${base}/staff`, {
    user_id: userUuid,
    employment_title: "Technician",
    employee_code: "EMP-TEST-001",
    is_primary_branch: true,
  });
  assert(assign.status === 201, "assign staff", JSON.stringify(assign.json));
  const assignmentUuid = assign.json.data?.id;
  assert(Boolean(assignmentUuid), "assignment uuid returned");

  const dup = await request("POST", `${base}/staff`, { user_id: userUuid });
  assert(dup.status === 409, "duplicate assignment rejected");

  const managers = await request("GET", `${base}/managers`);
  assert(managers.status === 200, "list managers");

  const roles = await request("GET", `${base}/roles`);
  assert(roles.status === 200, "list roles");

  const security = await request("GET", `${base}/security-rules`);
  assert(security.status === 200, "list security rules");
  assert(security.json.data?.length >= 1, "default security rules seeded");

  const shiftStart = new Date();
  shiftStart.setHours(9, 0, 0, 0);
  const shiftEnd = new Date();
  shiftEnd.setHours(17, 0, 0, 0);
  const shift = await request("POST", `${base}/rota/shifts`, {
    staff_assignment_id: assignmentUuid,
    starts_at: shiftStart.toISOString(),
    ends_at: shiftEnd.toISOString(),
    break_minutes: 30,
  });
  assert(shift.status === 201, "create shift", JSON.stringify(shift.json));

  const rota = await request("GET", `${base}/rota`);
  assert(rota.status === 200, "list rota");
  assert(rota.json.data?.shifts?.length >= 1, "rota has shifts");

  const perf = await request("GET", `${base}/staff-performance`);
  assert(perf.status === 200, "list performance");

  const deactivate = await request("POST", `${base}/staff/${assignmentUuid}/deactivate`);
  assert(deactivate.status === 200, "deactivate staff");

  const archive = await request("POST", `${base}/staff/${assignmentUuid}/archive`);
  assert(archive.status === 200, "archive staff");

  const restore = await request("POST", `${base}/staff/${assignmentUuid}/restore`);
  assert(restore.status === 200, "restore staff");

  const otherShop = await prisma.shop.findFirst({
    where: { id: { not: shopId } },
    orderBy: { id: "asc" },
  });
  if (otherShop) {
    const cross = await request("GET", `/shops/${otherShop.id}/branches/${branchUuid}/staff`);
    assert(cross.status === 404, "cross-shop branch blocked");
  }

  console.log(`\n${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
