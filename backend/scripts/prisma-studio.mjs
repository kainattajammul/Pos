import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveStudioDatabaseUrl } from "./resolve-studio-database-url.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "..");

const { url: studioUrl, source } = resolveStudioDatabaseUrl();

if (!studioUrl) {
  console.error("Missing database config in backend/.env");
  console.error("Set SUPABASE_URL, DATABASE_URL (with password), and ideally:");
  console.error(
    "  DIRECT_URL=postgresql://postgres:PASSWORD@db.YOUR_REF.supabase.co:5432/postgres?sslmode=require",
  );
  process.exit(1);
}

console.log(`Prisma Studio → ${source}`);

const child = spawn("npx prisma studio", {
  cwd: backendRoot,
  stdio: "inherit",
  shell: true,
  env: {
    ...process.env,
    DATABASE_URL: studioUrl,
  },
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
