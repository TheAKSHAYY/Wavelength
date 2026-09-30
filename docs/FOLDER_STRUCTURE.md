# Folder Structure

## Project Layout

```text
wavelength/
├── docs/                        # project documentation set
├── server/                      # Express + TypeScript backend
│   ├── index.ts                 # app setup, CORS, routes mounting, health check
│   ├── config.ts                # env/config loader (dotenv, runtime config)
│   ├── db.ts                    # node:sqlite init + per-user state helpers
│   ├── auth.ts                  # scrypt hashing + JWT sign/verify
│   ├── middleware.ts            # rate limiters + requireAuth / requireAuthOrToken
│   ├── seed.ts                  # dev-only account seeder (npm run seed:dev)
│   ├── tsconfig.json
│   ├── __tests__/
│   │   └── auth.test.ts
│   ├── routes/
│   │   ├── auth.ts              # register, login, logout, me
│   │   ├── state.ts             # GET/PUT per-user app state (auth required)
│   │   ├── generate.ts          # POST proxy to OpenAI Responses API
│   │   └── youtube.ts           # GET /analytics (optional YouTube Data API)
│   └── dist/                    # compiled server output (npm run build:server)
├── src/                         # React + TypeScript frontend
│   ├── App.tsx                  # root app: routing + layout switch (auth aware)
│   ├── main.tsx                 # DOM entry point, BrowserRouter + StrictMode
│   ├── types.ts                 # domain TypeScript interfaces
│   ├── components/
│   │   ├── SharedUI.tsx         # reusable UI blocks (SignalMeter, StatCard, Pill, etc.)
│   │   ├── Sidebar.tsx          # collapsible navigation tree
│   │   ├── TopNav.tsx           # topbar, search, command palette, theme toggle
│   │   ├── Chat.tsx             # AI assistant chat surface
│   │   ├── Landing.tsx          # landing page
│   │   └── Upload.tsx           # file upload zone + progress
│   ├── lib/
│   │   ├── store.tsx            # auth + server-backed app state (Context)
│   │   ├── ai.ts                # generateJSON() + zod validation + id helpers
│   │   ├── client.ts            # typed fetch wrapper (same-origin, cookies)
│   │   ├── parse.ts             # robust JSON extraction from model output
│   │   ├── schemas.ts           # zod schemas for every AI panel
│   │   ├── hooks.ts             # useTask (loading/error/run)
│   │   ├── format.ts            # greeting/initials/relativeTime helpers
│   │   ├── icons.ts             # source/alert icon maps
│   │   ├── nav.ts               # sidebar nav groups
│   │   └── __tests__/
│   │       ├── format.test.ts
│   │       └── parse.test.ts
│   ├── pages/                 # one page per sidebar route
│   │   ├── DashboardPage.tsx
│   │   ├── AuthPage.tsx
│   │   ├── TrendsPage.tsx
│   │   ├── CompetitorsPage.tsx
│   │   ├── KeywordsPage.tsx
│   │   ├── IdeasPage.tsx
│   │   ├── TitlesPage.tsx
│   │   ├── ScriptPage.tsx
│   │   ├── PackagePage.tsx
│   │   ├── FieldResearchPage.tsx
│   │   ├── CalendarPage.tsx
│   │   └── AnalyticsPage.tsx
│   └── styles/
│       └── premium.css        # premium shell CSS (vars, layout, components)
├── dist/                        # production client build (npm run build:client)
├── data/                        # SQLite database file (wavelength.db)
├── .env.example
├── .env
├── .gitignore
├── .prettierrc / .prettierignore
├── eslint.config.js
├── index.html
├── package.json
├── tsconfig.json / tsconfig.node.json
├── vite.config.ts
├── docker-compose.yml
├── Dockerfile.server / Dockerfile.web
└── nginx.conf
```

## File Responsibilities

### Root-level files

- `package.json` — defines scripts and package dependencies
- `vite.config.ts` — defines Vite behavior and the `/api` proxy (loads `.env` via `import "dotenv/config"`)
- `index.html` — app HTML shell
- `.env.example` — environment variable template
- `README.md` — general product overview

### `server/`

Contains the Express + TypeScript backend service and its runtime logic. The backend owns the OpenAI API key, handles auth (scrypt + JWT), and persists per-user state in SQLite (`node:sqlite`, no native dependencies).

### `src/`

Contains all frontend UI, logic, and supporting modules.

#### `components/`

Reusable UI blocks that are not tied to a specific dashboard feature: the shared style primitives (`SharedUI`), page scaffolding (`Sidebar`, `TopNav`), and surface components (`Chat`, `Landing`, `Upload`).

#### `lib/`

Logic and helpers consumed across pages: the store/context, AI client, zod schemas, JSON parser, and small utilities.

#### `pages/`

One route component per sidebar entry. Each page owns its inputs and renders AI-generated results.

#### `styles/`

CSS custom properties (design tokens) and the full component style system in `premium.css`.

## File Ownership Guidance

- UI concerns belong in `src/components/` and `src/pages/`.
- API/AI logic belongs in the backend (`server/`) or `src/lib/`.
- Prompt and JSON parsing logic is centralized in `src/lib/ai.ts`, `src/lib/parse.ts`, and `src/lib/schemas.ts`.
- Environment variables belong in `.env`, never in source code.

## Structural Recommendations

The project is a TypeScript SPA + TypeScript Express backend. The maintained pattern is:

- keep business logic close to the UI or its consuming feature
- isolate external integration behind the backend `/api/generate` proxy
- keep prompt and JSON parsing logic centralized
- avoid scattering config values across the app

---

Last updated: 2026-08-03
