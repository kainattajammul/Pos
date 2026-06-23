/**
 * Unit tests for branch audit sanitization.
 * Run: node scripts/test-branch-system-sanitization.mjs
 */
import { sanitizeAuditPayload, maskIpAddress } from "../src/services/branchAuditSanitization.service.js";

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

const sanitized = sanitizeAuditPayload({
  password: "secret123",
  access_token: "tok",
  nested: { api_key: "key", name: "Branch" },
});

assert(sanitized.password === "[REDACTED]", "redacts password");
assert(sanitized.access_token === "[REDACTED]", "redacts token");
assert(sanitized.nested.api_key === "[REDACTED]", "redacts nested api_key");
assert(sanitized.nested.name === "Branch", "preserves safe fields");

assert(maskIpAddress("192.168.1.10", false) === "192.168.***.***", "masks IP");
assert(maskIpAddress("192.168.1.10", true) === "192.168.1.10", "shows IP when permitted");

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
