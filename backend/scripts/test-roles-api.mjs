/**
 * End-to-end Role API test suite.
 * Run: node scripts/test-roles-api.mjs
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const BASE = process.env.API_BASE ?? "http://localhost:4000/api/roles";
const prisma = new PrismaClient();

let passed = 0;
let failed = 0;

function assert(condition, label, detail = "") {
  if (condition) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    console.error(`  ✗ ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

async function dbRoles() {
  return prisma.role.findMany({ orderBy: { id: "asc" } });
}

async function dbOrphans(roleId) {
  const [smr, bmr, rp] = await Promise.all([
    prisma.shopMemberRole.count({ where: { roleId } }),
    prisma.branchMemberRole.count({ where: { roleId } }),
    prisma.rolePermission.count({ where: { roleId } }),
  ]);
  return { smr, bmr, rp };
}

async function ensureTwoShops() {
  let shops = await prisma.shop.findMany({ orderBy: { id: "asc" } });
  if (shops.length === 0) {
    await prisma.shop.create({ data: { name: "Test Shop A" } });
    shops = await prisma.shop.findMany({ orderBy: { id: "asc" } });
  }
  if (shops.length < 2) {
    await prisma.shop.create({ data: { name: "Test Shop B" } });
    shops = await prisma.shop.findMany({ orderBy: { id: "asc" } });
  }
  return { shop1: shops[0].id, shop2: shops[1].id };
}

async function main() {
  console.log("\n=== Role API E2E Tests ===\n");
  console.log(`Base URL: ${BASE}\n`);

  const { shop1, shop2 } = await ensureTwoShops();
  console.log(`Using shopId ${shop1} and ${shop2}\n`);

  // --- GET ---
  console.log("GET /roles");
  const get0 = await request("GET", "");
  assert(get0.status === 200, "GET returns 200");
  assert(get0.json.success === true, "GET success flag");
  assert(Array.isArray(get0.json.data), "GET data is array");
  assert(
    get0.json.data.every((r) => r.id != null && r.shopId != null && r.name),
    "GET items have id, shopId, name",
  );

  // --- POST validation ---
  console.log("\nPOST /roles — validation");
  const postEmpty = await request("POST", "", {});
  assert(postEmpty.status === 400, "POST empty body → 400");

  const postShort = await request("POST", "", { shopId: shop1, name: "A" });
  assert(postShort.status === 400, "POST name too short → 400");

  const postBadShop = await request("POST", "", { shopId: 999999, name: "Valid Name" });
  assert(postBadShop.status === 404, "POST invalid shopId → 404");

  // --- POST success ---
  console.log("\nPOST /roles — create");
  const uniqueA = `TestRole_${Date.now()}`;
  const postA = await request("POST", "", { shopId: shop1, name: uniqueA });
  assert(postA.status === 201, "POST create → 201", `got ${postA.status}`);
  assert(postA.json.success === true, "POST create success");
  assert(postA.json.data?.name === uniqueA, "POST returns created name");
  const roleAId = postA.json.data?.id;

  const dbAfterCreate = await prisma.role.findUnique({ where: { id: roleAId } });
  assert(dbAfterCreate?.name === uniqueA, "DB has new role after POST");

  const postDup = await request("POST", "", { shopId: shop1, name: uniqueA });
  assert(postDup.status === 409, "POST duplicate same shop → 409");

  const postSameNameOtherShop = await request("POST", "", { shopId: shop2, name: uniqueA });
  assert(postSameNameOtherShop.status === 201, "POST same name different shop → 201");
  const roleBId = postSameNameOtherShop.json.data?.id;

  // --- PUT ---
  console.log("\nPUT /roles/:id — update");
  const put404 = await request("PUT", "/999999", { name: "Nope" });
  assert(put404.status === 404, "PUT non-existing role → 404");

  const putInvalid = await request("PUT", "/abc", { name: "Nope" });
  assert(putInvalid.status === 400, "PUT invalid id → 400");

  const putEmpty = await request("PUT", `/${roleAId}`, {});
  assert(putEmpty.status === 400, "PUT no fields → 400");

  const updatedName = `${uniqueA}_Updated`;
  const putOk = await request("PUT", `/${roleAId}`, { name: updatedName });
  assert(putOk.status === 200, "PUT success → 200");
  assert(putOk.json.data?.name === updatedName, "PUT returns updated name");

  const dbAfterUpdate = await prisma.role.findUnique({ where: { id: roleAId } });
  assert(dbAfterUpdate?.name === updatedName, "DB reflects PUT update");

  const roleCName = `${uniqueA}_C`;
  const roleDName = `${uniqueA}_D`;
  const postC = await request("POST", "", { shopId: shop1, name: roleCName });
  const postD = await request("POST", "", { shopId: shop1, name: roleDName });
  const roleCId = postC.json.data?.id;
  const roleDId = postD.json.data?.id;
  const putDup = await request("PUT", `/${roleDId}`, { name: roleCName });
  assert(putDup.status === 409, "PUT duplicate name in same shop → 409", `got ${putDup.status}`);
  await request("DELETE", `/${roleCId}`);
  await request("DELETE", `/${roleDId}`);

  const putBadShop = await request("PUT", `/${roleAId}`, { shopId: 999999 });
  assert(putBadShop.status === 404, "PUT invalid shopId → 404");

  const putPartial = await request("PUT", `/${roleBId}`, { shopId: shop2 });
  assert(putPartial.status === 200, "PUT partial (shopId only) → 200");

  // --- DELETE ---
  console.log("\nDELETE /roles/:id");
  const del404 = await request("DELETE", "/999999");
  assert(del404.status === 404, "DELETE non-existing → 404");

  const delInvalid = await request("DELETE", "/abc");
  assert(delInvalid.status === 400, "DELETE invalid id → 400");

  const delA = await request("DELETE", `/${roleAId}`);
  assert(delA.status === 200, "DELETE success → 200");
  assert(delA.json.message === "Role deleted successfully", "DELETE message");

  const dbAfterDel = await prisma.role.findUnique({ where: { id: roleAId } });
  assert(dbAfterDel === null, "DB role removed after DELETE");

  const orphans = await dbOrphans(roleAId);
  assert(orphans.smr === 0 && orphans.bmr === 0 && orphans.rp === 0, "No orphan relations after DELETE");

  const delB = await request("DELETE", `/${roleBId}`);
  assert(delB.status === 200, "DELETE second role → 200");

  // --- GET after mutations ---
  console.log("\nGET /roles — after CRUD");
  const getFinal = await request("GET", "");
  assert(getFinal.status === 200, "GET after CRUD → 200");
  const ids = getFinal.json.data.map((r) => r.id);
  assert(!ids.includes(roleAId) && !ids.includes(roleBId), "Deleted roles absent from GET");

  console.log("\n=== Summary ===");
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  await prisma.$disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  prisma.$disconnect();
  process.exit(1);
});
