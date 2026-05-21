/**
 * Verifies frontend roles service against live API (same paths as apiClient).
 * Run from frontend/: node scripts/test-roles-service.mjs
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";
const BASE = `${API_URL}/roles`;

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    console.error(`  ✗ ${label}`);
  }
}

async function json(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function main() {
  console.log("\n=== Frontend API path test (v1) ===\n");
  console.log(`URL: ${BASE}\n`);

  const get = await json("GET", "");
  assert(get.status === 200 && get.data.success, "GET /roles via v1");
  assert(Array.isArray(get.data.data), "Response data array");

  const shops = await fetch(`${API_URL.replace(/\/roles$/, "")}/users`).catch(() => null);
  // ensure shop 1 exists via POST role with shop 1
  const name = `FE_Test_${Date.now()}`;
  const post = await json("POST", "", { shopId: 1, name });
  assert(post.status === 201 && post.data.data?.name === name, "POST create via v1");
  const id = post.data.data.id;

  const put = await json("PUT", `/${id}`, { name: `${name}_EDIT` });
  assert(put.status === 200 && put.data.data?.name === `${name}_EDIT`, "PUT update via v1");

  const get2 = await json("GET", "");
  assert(
    get2.data.data.some((r) => r.id === id && r.name === `${name}_EDIT`),
    "GET reflects update (cache would refetch same)",
  );

  const del = await json("DELETE", `/${id}`);
  assert(del.status === 200 && del.data.message?.includes("deleted"), "DELETE via v1");

  const get3 = await json("GET", "");
  assert(!get3.data.data.some((r) => r.id === id), "GET after delete excludes role");

  console.log(`\nPassed: ${passed}, Failed: ${failed}\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
