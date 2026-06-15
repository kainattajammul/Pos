/**
 * Unit tests for BranchOpeningStatusService logic.
 * Run: node scripts/test-branch-opening-status.mjs
 */
import { calculateBranchOpeningStatus } from "../src/services/branchOpeningStatus.service.js";

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

function baseBranch(overrides = {}) {
  return {
    timezone: "UTC",
    status: "ACTIVE",
    isActive: true,
    archivedAt: null,
    deletedAt: null,
    manualOpeningStatus: null,
    manualStatusExpiresAt: null,
    openingHours: [
      {
        dayOfWeek: "MONDAY",
        isClosed: false,
        opensAt: "09:00",
        closesAt: "18:00",
        breakStartsAt: "13:00",
        breakEndsAt: "14:00",
      },
    ],
    ...overrides,
  };
}

function mondayAt(hour, minute = 0) {
  // 2026-06-15 is a Monday
  return new Date(Date.UTC(2026, 5, 15, hour, minute, 0));
}

async function main() {
  console.log("\n=== Branch opening status unit tests ===\n");

  const open = calculateBranchOpeningStatus(baseBranch(), {
    at: mondayAt(10, 30),
  });
  assert(open.status === "open", "open during business hours");
  assert(open.is_open === true, "is_open true when open");

  const closedEarly = calculateBranchOpeningStatus(baseBranch(), {
    at: mondayAt(8, 0),
  });
  assert(closedEarly.status === "closed", "closed before opening");
  assert(closedEarly.is_open === false, "is_open false before opening");

  const closedLate = calculateBranchOpeningStatus(baseBranch(), {
    at: mondayAt(19, 0),
  });
  assert(closedLate.status === "closed", "closed after hours");

  const onBreak = calculateBranchOpeningStatus(baseBranch(), {
    at: mondayAt(13, 30),
  });
  assert(onBreak.status === "closed", "closed during break");
  assert(onBreak.reason.includes("break"), "break reason");

  const inactive = calculateBranchOpeningStatus(
    baseBranch({ status: "INACTIVE", isActive: false }),
    { at: mondayAt(10, 0) },
  );
  assert(inactive.status === "inactive", "inactive branch never open");
  assert(inactive.is_open === false, "inactive is_open false");

  const archived = calculateBranchOpeningStatus(
    baseBranch({ status: "ARCHIVED", archivedAt: new Date() }),
    { at: mondayAt(10, 0) },
  );
  assert(archived.status === "archived", "archived branch");

  const closure = calculateBranchOpeningStatus(baseBranch(), {
    at: mondayAt(10, 0),
    activeClosure: {
      title: "Bank Holiday",
      endsAt: new Date("2026-06-15T23:59:59.000Z"),
    },
  });
  assert(closure.status === "temporarily_closed", "closure overrides schedule");
  assert(closure.is_open === false, "closed during closure");

  const manualOpen = calculateBranchOpeningStatus(
    baseBranch({
      manualOpeningStatus: "OPEN",
      manualStatusExpiresAt: new Date("2026-06-16T00:00:00.000Z"),
    }),
    { at: mondayAt(20, 0) },
  );
  assert(manualOpen.status === "open", "manual override keeps branch open");
  assert(manualOpen.is_open === true, "manual open is_open true");

  const manualExpired = calculateBranchOpeningStatus(
    baseBranch({
      manualOpeningStatus: "OPEN",
      manualStatusExpiresAt: new Date("2026-06-15T08:00:00.000Z"),
    }),
    { at: mondayAt(20, 0) },
  );
  assert(manualExpired.status === "closed", "manual override expires");

  const manualNoExpiry = calculateBranchOpeningStatus(
    baseBranch({ manualOpeningStatus: "CLOSED" }),
    { at: mondayAt(10, 0) },
  );
  assert(manualNoExpiry.status === "closed", "manual override without expiry");

  console.log(`\n${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
