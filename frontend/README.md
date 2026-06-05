# Repair Shop POS — Frontend

Production-ready **Next.js 15** dashboard for a repair shop point-of-sale system. Matches the backend API in `/backend` and follows the same standalone folder layout.

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** + **ShadCN UI**
- **TanStack Query** (server state) + **Redux Toolkit** (UI/auth state)
- **Axios** API client with refresh-token interceptors
- **Recharts** analytics + **GSAP** animations
- **TanStack Table** for the products grid

## Requirements

- Node.js **>= 20.10**

## Installation

```bash
cd frontend
cp .env.example .env.local
npm install
```

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Light / dark mode

- **Toggle:** dashboard navbar, repairs top nav (POS/inventory/reports/settings), login page, and the dashboard accent toolbar.
- **Modes:** Light, Dark, System — persisted in `localStorage` (`theme` key) via `next-themes`.
- **Brand accent:** the color picker (teal/orange/purple presets) works in both modes; saved separately in `app-theme-v1`.
- **POS surfaces:** repairs/inventory pages use semantic tokens (`--pos-page-bg`, `--pos-surface`, etc.) in `src/styles/repairs-pos.css`; legacy hardcoded grays remap automatically in `.dark`.

Uses **Turbopack** by default (`next dev --turbopack`). After changing `next.config.ts`, env files that affect the bundler, or when dev compile times look stuck or wrong, clear the cache and restart:

```bash
npm run dev:clean
```

`dev:clean` and `npm run dev:reset` delete `.next` and start dev with Turbopack. Use `npm run dev:webpack` for the classic webpack dev server.

**Internal Server Error on refresh?** See [DEV-TROUBLESHOOTING.md](./DEV-TROUBLESHOOTING.md) (ENOENT / `app-build-manifest.json` / `_buildManifest.js.tmp`).

### Fast local dev (avoid false “slow UX”)

- **One** dev server on **port 3000**. On Windows if Next picks 3001: `$env:PORT='3000'; npm run dev`
- **Do not** run `npm run build` while `npm run dev` is running — corrupts `.next` (`ENOENT`, `_buildManifest.js.tmp`).
- **`npm run dev:clean`** only when the cache is broken or after ENOENT; not for everyday use.
- **Judge user-facing speed** with `npm run build` then **`npm run start`** (production). Use dev **2nd GET** in the terminal for warm dev speed — not the first compile.
- **Cold dev first hit** (~15s for `/dashboard` and `/repairs`) is Turbopack on-demand compile — **not** production UX.
- If port 3000 is busy, stop the other `node` process before measuring; two servers cause misleading timings and cache errors.
- After auth hydrates, **AuthGuard** idle-prefetches `/dashboard` and `/repairs`; the sidebar also prefetches key manage routes after mount.
- Optional: exclude `frontend/.next` from real-time antivirus scanning if ENOENT or slow compiles persist on Windows.

**Browser sign-off (production):** `npm run start` on :3000, then Chrome/Edge repeat visit. Optional script: `npx playwright install` (once) and `node scripts/browser-tti.mjs` (uses system Edge).

### Mock mode (default)

With `NEXT_PUBLIC_USE_MOCK=true`, the dashboard uses local mock data when the API is unavailable. On the login page, click **Continue with mock data** to enter the dashboard without a running backend.

### Live API

1. Start the backend (`cd ../backend && npm run dev`).
2. Set `NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1` in `.env.local`.
3. Sign in with seeded credentials (see backend README), e.g. `admin@repairshop.local` / `ChangeMe!123456`.

## Scripts

| Command           | Description                                      |
|-------------------|--------------------------------------------------|
| `npm run dev`     | Dev server (Turbopack)                           |
| `npm run dev:reset` | Remove `.next`, then dev (fix ENOENT / 500 on refresh) |
| `npm run dev:clean` | Same as `dev:reset`                             |
| `npm run dev:webpack` | Dev server (webpack, no Turbopack)            |
| `npm run build`   | Production build                                 |
| `npm run start`| Start production server  |
| `npm run lint` | ESLint                   |

## Folder structure

```
src/
├── app/                 # App Router pages & layouts
├── components/
│   ├── ui/              # ShadCN primitives
│   ├── dashboard/       # Dashboard widgets
│   ├── charts/          # Recharts wrappers
│   ├── tables/          # Data tables
│   ├── layout/          # Sidebar, navbar, shell
│   └── shared/          # Theme toggle, empty states, etc.
├── hooks/
├── services/            # API service layer
├── store/               # Redux Toolkit slices
├── lib/                 # Axios, GSAP, mock data, utils
├── types/
├── providers/
├── constants/
└── utils/
```

## Features

- Collapsible GSAP-animated sidebar with nested navigation
- Sticky navbar (search, notifications, profile, theme switcher)
- KPI stat cards with sparklines and counter animations
- Stock status, sales channels, repair reports (donut charts)
- Monthly activity bar chart
- Live activity timeline
- Products table (search, sort, pagination, filters, export)
- Light / dark mode via `next-themes`
- Login + protected dashboard layout
- Skeleton loaders, error boundary, toast notifications

## API integration

- Base path: `/api/v1` (configurable via `NEXT_PUBLIC_API_URL`)
- Auth: `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`
- Dashboard: `/dashboard/summary`, `/dashboard/monthly-sales`, `/dashboard/repair-reports`, `/dashboard/recent-activities`

Responses follow the backend envelope: `{ success, message, data, meta? }`.
