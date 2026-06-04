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

Uses **Turbopack** by default (`next dev --turbopack`). After changing `next.config.ts`, env files that affect the bundler, or when dev compile times look stuck or wrong, clear the cache and restart:

```bash
npm run dev:clean
```

`dev:clean` deletes `.next` and starts dev with Turbopack. Use `npm run dev:webpack` for the classic webpack dev server.

### Fast local workflow

- Prefer **`npm run dev`** (keeps the `.next` cache). Avoid **`npm run dev:clean`** unless manifests are corrupt (ENOENT under `.next`) or you changed bundler config.
- Run **one** dev server (port 3000). A second instance on 3001 forces a cold cache and looks much slower.
- First visit to a route compiles on demand (~seconds in dev); **revisit the same route** to stay near ~200ms.
- For demos or prod-like speed, use **`npm run build`** then **`npm run start`**.

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
| `npm run dev:clean` | Remove `.next`, then dev (use after config changes) |
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
