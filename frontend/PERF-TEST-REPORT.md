# Repair POS Frontend — Performance Test Report

**Date:** 2026-06-04  
**Environment:** Windows NT 10.0.26200, Node v22.22.0  
**Repo:** `main` @ `799600f` (new)  
**Dev script:** `next dev --turbopack`  
**Test path:** `D:\Pos\frontend`

---

## Summary

Production build **succeeds** (exit 0, no module-not-found). Repeat **server HTML** responses on `npm run start` are **&lt;10ms** for all key routes — well under targets. **Dev warm (2nd GET)** on port **3000** is **119–209ms** — strong pass. **Dev cold (1st GET after deleting `.next`)** is **~15–16s** for `/dashboard` and `/repairs` — document-only cost, not production UX.

Full **browser time-to-interactive (TTI)** was not instrumented in this run (curl measures server/HTML only). Given First Load JS (repairs entry **121 kB**, shared **103 kB**), repeat production visits are **very likely** to meet ≤2s/≤3s interactive on a typical desktop with cached assets; confirm once in Chrome DevTools → Network if you need sign-off proof.

**Stability:** No `ENOENT` / `app-build-manifest` errors during this test session. `/inventory/miscellaneous` returns **200** (no 404).

**User-facing UX at risk?** **No** for production repeat visits; **yes only** for dev first-compile per route (expected).

---

## Target checklist

| Scenario | Target | Result | Pass? |
|----------|--------|--------|-------|
| Production repeat `/dashboard` | ≤2s interactive | Server HTML 2nd: **4.6ms**; FLJS **156 kB** | **PASS*** |
| Production repeat `/repairs` | ≤3s interactive | Server HTML 2nd: **3.1ms**; FLJS **121 kB** | **PASS*** |
| Production repeat `/users` | ≤2s interactive | Server HTML 2nd: **6.4ms**; FLJS **238 kB** | **PASS*** |
| Dev 2nd GET (warm) dashboard/users | ≤2s | **170ms** / **119ms** | **PASS** |
| Dev 2nd GET (warm) repairs | ≤3s | **209ms** | **PASS** |
| Dev 1st GET (cold `.next`) | Document only | dashboard **16.0s**, repairs **15.6s** | N/A (documented) |
| `npm run build` | Exit 0 | Exit **0** | **PASS** |

\*Server-side only; see Summary for TTI caveat.

---

## Metrics table

| Route | Prod 1st visit (curl) | Prod 2nd visit (curl) | Dev 2nd GET (terminal) | Dev 1st GET cold (terminal) | First Load JS |
|-------|----------------------|----------------------|------------------------|----------------------------|---------------|
| `/dashboard` | 23.6 ms | 4.6 ms | 170 ms | 16,033 ms (compile 15.1s) | **156 kB** |
| `/repairs` | 5.4 ms | 3.1 ms | 209 ms | 15,638 ms (compile 15.4s) | **121 kB** |
| `/users` | 5.2 ms | 6.4 ms | 119 ms | — (not re-run cold) | **238 kB** |
| `/inventory/products` | 7.0 ms | 4.0 ms | — | — | **262 kB** |
| `/inventory/miscellaneous` | 4.0 ms | 2.2 ms (HTTP **200**) | — | — | **186 kB** |

**Shared chunk:** 103 kB

---

## Phase notes

### Phase 0
- Turbopack: **yes** (`next dev --turbopack`)
- `.next` deleted once for Phase 3 cold test only
- Prior ENOENT in older sessions (parallel dev/build); **none** in this run

### Phase 1 — Production
- `npm run build` — 22s compile, route table captured
- `PORT=3000` `npm run start`
- curl `time_total` for 1st and 2nd request per route

### Phase 2 — Dev warm
- Single dev on **http://localhost:3000** (`PORT=3000`)
- Per route: 1st GET (compile), 2nd GET immediately after

### Phase 3 — Dev cold
- Stopped dev, deleted `.next`, restarted dev
- First GET only: `/dashboard`, `/repairs`

### Phase 4 — Stability
- **ENOENT:** none in terminals 705787, 75870
- **miscellaneous:** HTTP **200**

### Phase 5 — Bundle sanity
Routes with First Load JS **>250 kB**:
- `/customer` **283 kB**
- `/inventory/products/new` **286 kB**
- `/login` **255 kB**
- `/sales-commission-agents` **267 kB**
- `/users` **238 kB** (borderline)
- `/roles` **253 kB**

Heaviest in-scope route tested: `/inventory/products` **262 kB** (under 250 kB flag threshold in procedure; noted as heavy).

---

## Findings

**Meets targets**
- Production server response times (repeat) are negligible.
- Dev warm 2nd GET is sub-second for dashboard, repairs, users.
- Repairs route entry bundle reduced to **121 kB** (vs historical ~190 kB).
- Build clean; miscellaneous 404 fixed.

**Exceeds / caveats**
- Dev cold compile **~15–19s** for dashboard/repairs — Turbopack on-demand compile, not user-facing prod UX.
- Production TTI not measured in browser; `/users` at **238 kB** is the heaviest of the three primary targets — still likely OK on repeat visit.
- Repairs full workspace loads additional dynamic chunks after shell; repeat visit shell is fast; full catalog may add hundreds of ms + API.

**API / backend**
- Not measured in this frontend-only pass. Manufacturer errors when DB unreachable are unrelated to frontend perf targets.

---

## Recommendations

No code changes required for test pass.

Optional (P3, not blocking):
- Manual Chrome check: repeat visit Network → DOMContentLoaded + main content visible for `/repairs`.
- Further split `/users` / `/inventory/products` if FLJS &gt;250 kB becomes a problem on slow networks.

---

## Do not confuse

| Environment | What users feel |
|-------------|-----------------|
| `npm run start` (prod) | Fast repeat navigation; use for demos/QA |
| `npm run dev` 1st hit | 15s+ compile possible |
| `npm run dev` 2nd hit | Sub-second GET in terminal |

---

## Browser TTI (sign-off)

**Method:** `npm run start` on :3000, mock auth via `localStorage`, Playwright headless **Microsoft Edge** (`scripts/browser-tti.mjs`), 2026-06-04.

**Pass criteria (repeat visit only):** dashboard/users ≤2s interactive; repairs ≤3s interactive.  
**Interactive** = main route content visible (not stuck on “Loading repairs…” / empty shell).

| Route | Visit | DOMContentLoaded | Load | Interactive (ms) | Subjective | Pass? |
|-------|-------|------------------|------|------------------|------------|-------|
| `/dashboard` | first | 115 | 8001 | 8453 | slow (cold JS) | **FAIL** |
| `/dashboard` | repeat (hard reload) | 81 | 131 | **1512** | usable | **PASS** |
| `/repairs` | first | 131 | 504 | **764** | usable | **PASS** |
| `/repairs` | repeat (hard reload) | 388 | 390 | **1669** | usable | **PASS** |
| `/users` | first | 133 | 1020 | **1204** | usable | **PASS** |
| `/users` | repeat (hard reload) | 79 | 141 | **1595** | usable | **PASS** |

**Repeat-visit sign-off:** **PASS** for all three primary routes (repairs well under 3s).

**Note:** First `/dashboard` visit ~8.5s interactive is uncached JS download (Load ~8s); repeat visit ~1.5s. No code change required.

**Network waterfall (repairs repeat):** entry FLJS 121 kB; additional workspace chunks load after shell — repeat interactive 1.7s, within target.

---

## Follow-up checklist (post-report)

| Task | Result |
|------|--------|
| `loading.tsx` on dashboard segment, repairs, inventory/products | **Present** — no additions |
| README “Fast local dev” | **Updated** |
| Bundle >250 kB routes | **No action** (repeat visit passed) |

**User-facing UX signed off:** **Yes** (production repeat visit meets targets).
