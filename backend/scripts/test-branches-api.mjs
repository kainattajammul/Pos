/**
 * End-to-end Branch API test suite.
 * Run: ENABLE_DEV_AUTH_BYPASS=true node scripts/test-branches-api.mjs
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const API_BASE = process.env.API_BASE ?? "http://localhost:4000/api/v1";
const prisma = new PrismaClient();

let passed = 0;
let failed = 0;

function assert(condition, label, detail = "") {
  if (condition) {
    passed += 1;
    console.log(`  ✓ ${label}`);
  } else {
    failed += 1;
    console.error(`  ✗ ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

async function request(method, path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

async function ensureTwoShops() {
  let shops = await prisma.shop.findMany({ orderBy: { id: "asc" } });
  if (shops.length === 0) {
    await prisma.shop.create({ data: { name: "Branch Test Shop A" } });
    shops = await prisma.shop.findMany({ orderBy: { id: "asc" } });
  }
  if (shops.length < 2) {
    await prisma.shop.create({ data: { name: "Branch Test Shop B" } });
    shops = await prisma.shop.findMany({ orderBy: { id: "asc" } });
  }
  return { shop1: shops[0].id, shop2: shops[1].id };
}

function branchPath(shopId, suffix = "") {
  return `/shops/${shopId}/branches${suffix}`;
}

async function main() {
  console.log("\n=== Branch API E2E Tests ===\n");
  console.log(`Base URL: ${API_BASE}\n`);

  const { shop1, shop2 } = await ensureTwoShops();
  console.log(`Using shopId ${shop1} and ${shop2}\n`);

  const unique = Date.now().toString().slice(-6);

  // --- Create branch ---
  console.log("POST /shops/:shopId/branches");
  const createRes = await request("POST", branchPath(shop1), {
    name: `Watford Branch ${unique}`,
    branch_code: `BR-WAT-${unique}`,
    branch_type: "standard",
    city: "Watford",
    email: `watford-${unique}@example.com`,
    phone: "+441234567890",
    status: "draft",
    is_primary: true,
    opening_hours: [
      { day_of_week: "monday", is_closed: false, opens_at: "09:00", closes_at: "18:00" },
      { day_of_week: "tuesday", is_closed: false, opens_at: "09:00", closes_at: "18:00" },
      { day_of_week: "wednesday", is_closed: false, opens_at: "09:00", closes_at: "18:00" },
      { day_of_week: "thursday", is_closed: false, opens_at: "09:00", closes_at: "18:00" },
      { day_of_week: "friday", is_closed: false, opens_at: "09:00", closes_at: "18:00" },
      { day_of_week: "saturday", is_closed: false, opens_at: "10:00", closes_at: "16:00" },
      { day_of_week: "sunday", is_closed: true, opens_at: null, closes_at: null },
    ],
  });
  assert(createRes.status === 201, "create returns 201", JSON.stringify(createRes.json));
  assert(createRes.json.success === true, "create success flag");
  const branchUuid = createRes.json.data?.uuid;
  assert(Boolean(branchUuid), "create returns uuid");
  assert(createRes.json.data?.branch_code === `BR-WAT-${unique}`, "branch code preserved");

  // --- Duplicate code ---
  console.log("\nPOST duplicate branch_code");
  const dupRes = await request("POST", branchPath(shop1), {
    name: "Duplicate Code Branch",
    branch_code: `BR-WAT-${unique}`,
    city: "Watford",
  });
  assert(dupRes.status === 409, "duplicate code rejected", JSON.stringify(dupRes.json));

  // --- Auto-generate code ---
  console.log("\nPOST auto branch_code");
  const autoRes = await request("POST", branchPath(shop1), {
    name: `Auto Branch ${unique}`,
    city: "London",
  });
  assert(autoRes.status === 201, "auto code create 201");
  assert(Boolean(autoRes.json.data?.branch_code), "auto code generated");
  const autoUuid = autoRes.json.data?.uuid;

  // --- Second primary rejected ---
  console.log("\nPOST second primary branch");
  const primaryDup = await request("POST", branchPath(shop1), {
    name: `Another Primary ${unique}`,
    is_primary: true,
    city: "London",
  });
  assert(primaryDup.status === 409, "second primary rejected", JSON.stringify(primaryDup.json));

  // --- List ---
  console.log("\nGET /shops/:shopId/branches");
  const listRes = await request("GET", `${branchPath(shop1)}?search=Watford&sort=name&direction=asc`);
  assert(listRes.status === 200, "list returns 200");
  assert(Array.isArray(listRes.json.data), "list data is array");
  assert(listRes.json.data.some((b) => b.uuid === branchUuid), "list contains created branch");
  assert(
    !listRes.json.data.some((b) => b.status === "archived"),
    "archived excluded from default list",
  );

  // --- Profile ---
  console.log("\nGET branch profile");
  const showRes = await request("GET", branchPath(shop1, `/${branchUuid}`));
  assert(showRes.status === 200, "profile returns 200");
  assert(showRes.json.data?.opening_hours?.length === 7, "profile includes opening hours");

  // --- Cross-shop isolation ---
  console.log("\nCross-shop access");
  const crossShop = await request("GET", branchPath(shop2, `/${branchUuid}`));
  assert(crossShop.status === 404, "other shop cannot access branch");

  // --- Update ---
  console.log("\nPUT branch");
  const updateRes = await request("PUT", branchPath(shop1, `/${branchUuid}`), {
    name: `Watford Updated ${unique}`,
    phone: "+449876543210",
  });
  assert(updateRes.status === 200, "update returns 200");
  assert(updateRes.json.data?.name.includes("Updated"), "name updated");

  // --- Opening hours ---
  console.log("\nPUT opening-hours");
  const hoursRes = await request("PUT", branchPath(shop1, `/${branchUuid}/opening-hours`), {
    opening_hours: [
      { day_of_week: "monday", is_closed: false, opens_at: "08:00", closes_at: "17:00" },
      { day_of_week: "tuesday", is_closed: false, opens_at: "08:00", closes_at: "17:00" },
      { day_of_week: "wednesday", is_closed: false, opens_at: "08:00", closes_at: "17:00" },
      { day_of_week: "thursday", is_closed: false, opens_at: "08:00", closes_at: "17:00" },
      { day_of_week: "friday", is_closed: false, opens_at: "08:00", closes_at: "17:00" },
      { day_of_week: "saturday", is_closed: true, opens_at: null, closes_at: null },
      { day_of_week: "sunday", is_closed: true, opens_at: null, closes_at: null },
    ],
  });
  assert(hoursRes.status === 200, "opening hours updated");

  // --- Opening status ---
  console.log("\nGET opening-status");
  const statusRes = await request("GET", branchPath(shop1, `/${branchUuid}/opening-status`));
  assert(statusRes.status === 200, "opening status returns 200");
  assert(statusRes.json.data?.status != null, "opening status has status field");

  // --- Manual override ---
  console.log("\nPATCH manual status");
  const manualRes = await request("PATCH", branchPath(shop1, `/${branchUuid}/status`), {
    manual_opening_status: "closed",
    manual_status_expires_at: new Date(Date.now() + 3600_000).toISOString(),
  });
  assert(manualRes.status === 200, "manual status patched");
  assert(manualRes.json.data?.opening_status?.is_open === false, "manual close applied");

  // --- Closure ---
  console.log("\nPOST closure");
  const closureStart = new Date();
  closureStart.setHours(closureStart.getHours() - 1);
  const closureEnd = new Date();
  closureEnd.setHours(closureEnd.getHours() + 2);
  const closureRes = await request("POST", branchPath(shop1, `/${branchUuid}/closures`), {
    title: "Maintenance",
    closure_type: "maintenance",
    starts_at: closureStart.toISOString(),
    ends_at: closureEnd.toISOString(),
    all_day: false,
  });
  assert(closureRes.status === 201, "closure created", JSON.stringify(closureRes.json));
  const closureId = closureRes.json.data?.id;

  const listClosures = await request("GET", branchPath(shop1, `/${branchUuid}/closures`));
  assert(listClosures.status === 200, "closures listed");
  assert(listClosures.json.data?.length >= 1, "closure in list");

  // --- Activate / deactivate ---
  console.log("\nActivate / deactivate");
  const activateRes = await request("POST", branchPath(shop1, `/${branchUuid}/activate`));
  assert(activateRes.status === 200, "activated");
  assert(activateRes.json.data?.status === "active", "status active");

  const deactivateRes = await request("POST", branchPath(shop1, `/${branchUuid}/deactivate`));
  assert(deactivateRes.status === 200, "deactivated");
  assert(deactivateRes.json.data?.status === "inactive", "status inactive");

  // --- Archive / restore ---
  console.log("\nArchive / restore");
  const archiveRes = await request("POST", branchPath(shop1, `/${branchUuid}/archive`));
  assert(archiveRes.status === 200, "archived");
  assert(archiveRes.json.data?.status === "archived", "status archived");

  const archivedList = await request("GET", `${branchPath(shop1)}?search=Watford`);
  assert(
    !archivedList.json.data?.some((b) => b.uuid === branchUuid),
    "archived hidden from default list",
  );

  const archivedUpdate = await request("PUT", branchPath(shop1, `/${branchUuid}`), {
    name: "Should Fail",
  });
  assert(archivedUpdate.status === 409, "archived branch cannot update");

  const restoreRes = await request("POST", branchPath(shop1, `/${branchUuid}/restore`));
  assert(restoreRes.status === 200, "restored");
  assert(restoreRes.json.data?.status === "inactive", "restored as inactive");

  // --- Validation ---
  console.log("\nValidation failures");
  const badCreate = await request("POST", branchPath(shop1), { name: "" });
  assert(badCreate.status === 400, "empty name rejected");

  const badHours = await request("PUT", branchPath(shop1, `/${autoUuid}/opening-hours`), {
    opening_hours: [
      { day_of_week: "monday", is_closed: false, opens_at: "18:00", closes_at: "09:00" },
    ],
  });
  assert(badHours.status === 400, "invalid hours rejected");

  if (closureId) {
    const delClosure = await request(
      "DELETE",
      branchPath(shop1, `/${branchUuid}/closures/${closureId}`),
    );
    assert(delClosure.status === 200, "closure deleted");
  }

  console.log(`\n${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
