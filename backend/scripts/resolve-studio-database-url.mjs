/**
 * Resolves a Prisma Studio–friendly Postgres URL for Supabase.
 * Studio often fails on pooler hosts (especially port 6543).
 */
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "..");

export function loadBackendEnv() {
  dotenv.config({ path: path.join(backendRoot, ".env") });
}

function parseConnectionString(url) {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

function projectRefFromSupabaseUrl(supabaseUrl) {
  const match = supabaseUrl?.match(/https?:\/\/([a-z0-9]+)\.supabase\.co/i);
  return match?.[1] ?? null;
}

function isDirectSupabaseHost(url) {
  return Boolean(url && url.includes("db.") && url.includes(".supabase.co"));
}

function passwordFromEnv() {
  for (const key of ["DIRECT_URL", "DATABASE_URL"]) {
    const parsed = parseConnectionString(process.env[key]?.trim() ?? "");
    if (parsed?.password) {
      return decodeURIComponent(parsed.password);
    }
  }
  return null;
}

function buildDirectUrl(projectRef, password) {
  const user = encodeURIComponent("postgres");
  const pass = encodeURIComponent(password);
  return `postgresql://${user}:${pass}@db.${projectRef}.supabase.co:5432/postgres?sslmode=require`;
}

/** Prefer direct host; otherwise build from SUPABASE_URL + password in .env */
export function resolveStudioDatabaseUrl() {
  loadBackendEnv();

  const directUrl = process.env.DIRECT_URL?.trim() ?? "";
  const databaseUrl = process.env.DATABASE_URL?.trim() ?? "";

  if (isDirectSupabaseHost(directUrl)) {
    return { url: directUrl, source: "DIRECT_URL (direct host)" };
  }

  const projectRef =
    projectRefFromSupabaseUrl(process.env.SUPABASE_URL) ??
    (() => {
      const parsed = parseConnectionString(databaseUrl) ?? parseConnectionString(directUrl);
      const user = parsed?.username ?? "";
      const fromUser = user.match(/^postgres\.([a-z0-9]+)$/i);
      return fromUser?.[1] ?? null;
    })();

  const password = passwordFromEnv();

  if (projectRef && password) {
    return {
      url: buildDirectUrl(projectRef, password),
      source: `built direct URL (db.${projectRef}.supabase.co)`,
    };
  }

  if (databaseUrl.includes(":6543")) {
    return {
      url: databaseUrl.replace(":6543", ":5432"),
      source: "DATABASE_URL with port 6543→5432 (still pooler — set DIRECT_URL to db.*.supabase.co)",
    };
  }

  if (directUrl) {
    return { url: directUrl, source: "DIRECT_URL (pooler — may fail in Studio)" };
  }

  if (databaseUrl) {
    return { url: databaseUrl, source: "DATABASE_URL" };
  }

  return { url: null, source: null };
}

if (process.argv[1]?.endsWith("resolve-studio-database-url.mjs")) {
  const { url, source } = resolveStudioDatabaseUrl();
  if (!url) {
    console.error("No DATABASE_URL / DIRECT_URL / SUPABASE_URL+password found in backend/.env");
    process.exit(1);
  }
  console.log("Studio will use:", source);
  const host = url.match(/@([^/]+)/)?.[1] ?? "(unknown)";
  console.log("Host:", host);
}
