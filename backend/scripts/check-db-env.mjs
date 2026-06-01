import { resolveStudioDatabaseUrl } from "./resolve-studio-database-url.mjs";

const { url, source } = resolveStudioDatabaseUrl();

console.log("\n--- Database URL check (backend/.env) ---\n");

if (!url) {
  console.error("FAIL: No usable connection string found.");
  process.exit(1);
}

const host = url.match(/@([^/]+)/)?.[1] ?? "unknown";
const port = url.match(/:(\d+)\//)?.[1] ?? "?";

console.log("Studio / recommended host:", host);
console.log("Port:", port);
console.log("Resolved via:", source);

const issues = [];
if (host.includes("pooler")) {
  issues.push("Host is a pooler — Prisma Studio may error. Use db.YOUR_REF.supabase.co in DIRECT_URL.");
}
if (port === "6543") {
  issues.push("Port 6543 is transaction pooler — use 5432 for local dev.");
}
if (!host.includes("db.") && !host.includes("pooler")) {
  issues.push("Unexpected host format — copy strings from Supabase Dashboard → Database.");
}

if (issues.length) {
  console.log("\nWarnings:");
  issues.forEach((line) => console.log("  •", line));
  console.log(
    "\nFix: Supabase Dashboard → Project Settings → Database → Connection string → URI (Direct)",
  );
  process.exit(1);
}

console.log("\nOK: Configuration looks good for Prisma Studio.\n");
