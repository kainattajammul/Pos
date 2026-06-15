/**
 * E2E Branch Inventory API tests.
 * Run: ENABLE_DEV_AUTH_BYPASS=true node scripts/test-branch-inventory-api.mjs
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
  if (!shop) shop = await prisma.shop.create({ data: { name: "Inventory Test Shop" } });

  let branch = await prisma.branch.findFirst({ where: { shopId: shop.id, deletedAt: null } });
  if (!branch) {
    branch = await prisma.branch.create({
      data: {
        shopId: shop.id,
        branchCode: `BR-INV-${Date.now().toString().slice(-4)}`,
        name: "Inventory Test Branch",
        slug: `inv-test-${Date.now()}`,
        status: "ACTIVE",
        isActive: true,
      },
    });
  }

  let destBranch = await prisma.branch.findFirst({
    where: { shopId: shop.id, deletedAt: null, id: { not: branch.id } },
  });
  if (!destBranch) {
    destBranch = await prisma.branch.create({
      data: {
        shopId: shop.id,
        branchCode: `BR-INV2-${Date.now().toString().slice(-4)}`,
        name: "Inventory Dest Branch",
        slug: `inv-dest-${Date.now()}`,
        status: "ACTIVE",
        isActive: true,
      },
    });
  }

  let product = await prisma.product.findFirst({ where: { shopId: shop.id } });
  if (!product) {
    product = await prisma.product.create({
      data: {
        shopId: shop.id,
        name: "Test Phone Screen",
        sku: `SKU-${Date.now()}`,
        salePrice: 49.99,
        standardCost: 20,
      },
    });
  }

  return {
    shopId: shop.id,
    branchUuid: branch.uuid,
    destBranchUuid: destBranch.uuid,
    productUuid: product.uuid,
  };
}

async function main() {
  console.log("\n=== Branch Inventory API E2E ===\n");
  const { shopId, branchUuid, destBranchUuid, productUuid } = await ensureFixtures();
  const base = `/shops/${shopId}/branches/${branchUuid}`;

  const settings = await request("GET", `${base}/inventory-settings`);
  assert(settings.status === 200, "get inventory settings");
  assert(settings.json.data?.allocation_mode != null, "settings has allocation_mode");

  let inventoryId = null;

  const allocate = await request("POST", `${base}/inventory/allocate`, {
    product_id: productUuid,
    opening_quantity: 50,
    unit_cost: 20,
    branch_selling_price: 49.99,
  });
  if (allocate.status === 201) {
    assert(true, "allocate product");
    inventoryId = allocate.json.data?.id;
  } else if (allocate.status === 409) {
    const existing = await request("GET", `${base}/stock-levels?search=Test`);
    inventoryId = existing.json.data?.[0]?.id ?? null;
    assert(inventoryId != null, "reuse existing allocation");
  } else {
    assert(false, "allocate product", JSON.stringify(allocate.json));
  }

  const dup = await request("POST", `${base}/inventory/allocate`, {
    product_id: productUuid,
    opening_quantity: 1,
  });
  assert(dup.status === 409, "prevent duplicate allocation");

  const levels = await request("GET", `${base}/stock-levels`);
  assert(levels.status === 200, "list stock levels");
  assert((levels.json.data?.length ?? 0) >= 1, "stock levels not empty");

  if (inventoryId) {
    const reorder = await request("PUT", `${base}/inventory/${inventoryId}/reorder-rule`, {
      reorder_point: 10,
      reorder_quantity: 25,
      maximum_stock_level: 100,
    });
    assert(reorder.status === 200, "upsert reorder rule");

    const adjust = await request("POST", `${base}/inventory/${inventoryId}/adjust`, {
      adjustment_type: "increase",
      quantity: 5,
      reason_code: "TEST_ADJUST",
    });
    assert(adjust.status === 200, "stock adjustment");
    assert(adjust.json.data?.quantity_on_hand >= 5, "quantity after adjustment");

    const alerts = await request("GET", `${base}/stock-alerts`);
    assert(alerts.status === 200, "list stock alerts");
  }

  const valuation = await request("GET", `${base}/stock-valuation`);
  assert(valuation.status === 200, "stock valuation");
  assert(valuation.json.data?.summary?.total_cost_value != null, "valuation has cost value");

  if (inventoryId) {
    const transfer = await request("POST", `${base}/stock-transfers`, {
      destination_branch_id: destBranchUuid,
      items: [{ source_inventory_id: inventoryId, requested_quantity: 3 }],
      request_notes: "Test transfer",
    });
    assert(transfer.status === 201, "create transfer", JSON.stringify(transfer.json));
    const transferId = transfer.json.data?.id;

    if (transferId) {
      const submit = await request("POST", `${base}/stock-transfers/${transferId}/submit`);
      assert(submit.status === 200, "submit transfer");
    }
  }

  console.log(`\n${passed} passed, ${failed} failed\n`);
  await prisma.$disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
