/**
 * Unit tests for branch authorization logic.
 * Run: node scripts/test-branch-authorization.mjs
 */
import {
  getEffectivePermissions,
  getPermissionSources,
} from "../src/services/branchAuthorization.service.js";

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    passed += 1;
    console.log(`  ✓ ${label}`);
  } else {
    failed += 1;
    console.error(`  ✗ ${label}`);
  }
}

async function main() {
  console.log("\n=== Branch authorization unit tests ===\n");

  const sources = await getPermissionSources(1, 1, 1, {
    shopPermissions: ["branch_staff.view", "branches.view"],
    isSuperAdmin: false,
  });
  assert(sources.some((s) => s.key === "branch_staff.view"), "shop permissions included");

  const superSources = await getPermissionSources(1, 1, 1, { isSuperAdmin: true });
  assert(superSources[0]?.source === "super_admin", "super admin wildcard");

  console.log(`\n${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
