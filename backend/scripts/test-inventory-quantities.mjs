/**
 * Unit tests for inventory quantity calculations.
 * Run: node scripts/test-inventory-quantities.mjs
 */
import { quantityAvailable, isLowStock, isOutOfStock } from "../src/utils/inventoryQuantities.js";
import { weightedAverageCost, decimalToString } from "../src/utils/inventoryDecimal.js";
import { suggestedReorderQuantity } from "../src/services/branchReorderRule.service.js";

let passed = 0;
let failed = 0;

function assert(c, label) {
  if (c) {
    passed += 1;
    console.log(`  ✓ ${label}`);
  } else {
    failed += 1;
    console.error(`  ✗ ${label}`);
  }
}

const inv = {
  quantityOnHand: 100,
  quantityReserved: 10,
  quantityDamaged: 5,
  quantityInRepair: 5,
};

assert(quantityAvailable(inv) === 80, "quantityAvailable = onHand - reserved - damaged - inRepair");
assert(isLowStock(5, 10), "low stock when available <= reorder point");
assert(isOutOfStock(0), "out of stock when available <= 0");

const avg = weightedAverageCost(10, 5, 10, 7);
assert(decimalToString(avg, 2) === "6.00", "weighted average cost");

const suggested = suggestedReorderQuantity(
  { quantityOnHand: 20, quantityReserved: 0, quantityDamaged: 0, quantityInRepair: 0 },
  { maximumStockLevel: 50, reorderQuantity: 10 },
);
assert(suggested === 30, "suggested reorder uses max - available");

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
