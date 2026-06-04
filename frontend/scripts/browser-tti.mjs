/**
 * Production browser TTI check (Playwright + system Edge).
 * Usage: node scripts/browser-tti.mjs [baseUrl]
 */
import { chromium } from "playwright";

const BASE = process.argv[2] ?? "http://localhost:3000";
const AUTH_KEY = "repair_pos_auth";

const mockSession = {
  user: {
    id: "mock-admin",
    email: "admin@repairshop.local",
    role: "ADMIN",
    name: "Admin User",
  },
  accessToken: "mock-access-token",
  refreshToken: "mock-refresh-token",
};

const ROUTES = [
  {
    path: "/dashboard",
    targetMs: 2000,
    readyWhen: async (page) => {
      await page.locator("main").first().waitFor({ state: "visible", timeout: 20_000 });
      await page
        .locator(".recharts-wrapper, h1, h2")
        .first()
        .waitFor({ state: "visible", timeout: 20_000 });
    },
  },
  {
    path: "/repairs",
    targetMs: 3000,
    readyWhen: async (page) => {
      await page.locator("main, [class*='flex']").first().waitFor({ state: "visible", timeout: 20_000 });
      await page.waitForFunction(
        () => {
          const t = document.body.innerText;
          if (t.includes("Loading repairs")) return false;
          return t.includes("Repairs") || t.includes("Unlocking") || t.includes("Products");
        },
        { timeout: 20_000 },
      );
    },
  },
  {
    path: "/users",
    targetMs: 2000,
    readyWhen: async (page) => {
      await page.locator("main").first().waitFor({ state: "visible", timeout: 20_000 });
      await page
        .locator("table, [role='table'], h1")
        .first()
        .waitFor({ state: "visible", timeout: 20_000 });
    },
  },
];

async function seedAuth(context) {
  await context.addInitScript(
    ({ key, session }) => {
      localStorage.setItem(key, JSON.stringify(session));
    },
    { key: AUTH_KEY, session: mockSession },
  );
}

async function measureRoute(browser, route) {
  const rows = [];

  for (const [visitLabel, warm] of [
    ["first", false],
    ["repeat (hard reload)", true],
  ]) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    await seedAuth(context);
    const page = await context.newPage();

    const wallStart = Date.now();
    if (warm) {
      await page.goto(`${BASE}${route.path}`, { waitUntil: "load", timeout: 90_000 });
      await page.waitForTimeout(300);
      await page.reload({ waitUntil: "load", timeout: 90_000 });
    } else {
      await page.goto(`${BASE}${route.path}`, { waitUntil: "load", timeout: 90_000 });
    }

    let interactiveNote = "main content visible";
    try {
      await route.readyWhen(page);
    } catch (e) {
      interactiveNote = String(e.message ?? e).slice(0, 100);
    }
    const interactiveMs = Date.now() - wallStart;

    const perf = await page.evaluate(() => {
      const nav = performance.getEntriesByType("navigation")[0];
      return {
        domContentLoaded: Math.round(nav?.domContentLoadedEventEnd ?? 0),
        load: Math.round(nav?.loadEventEnd ?? 0),
      };
    });

    const subjective =
      interactiveMs <= route.targetMs ? "usable" : interactiveMs <= route.targetMs * 1.25 ? "mostly usable" : "slow";

    rows.push({
      route: route.path,
      visit: visitLabel,
      domContentLoaded: perf.domContentLoaded,
      load: perf.load,
      interactiveMs,
      interactiveNote,
      subjective,
      pass: interactiveMs <= route.targetMs,
    });

    await context.close();
  }

  return rows;
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
    channel: "msedge",
  });
  const all = [];
  for (const route of ROUTES) {
    all.push(...(await measureRoute(browser, route)));
  }
  await browser.close();
  console.log(JSON.stringify({ base: BASE, measuredAt: new Date().toISOString(), results: all }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
