# Architecture

## System Overview

Wavelength follows a two-layer, TypeScript architecture:

- **frontend** — React + Vite SPA (TypeScript/JSX) that presents the dashboard, routes between pages, and orchestrates user actions.
- **backend** — Express API (TypeScript, run via `tsx`) that proxies requests to OpenAI, owns the API key, and persists per-user state server-side.

The client and backend run side by side in local development, driven by a single `npm run dev` command (see [./README.md](./README.md)).

## Runtime Flow

### Local development flow

1. The user opens the Vite development server at `http://localhost:5173`.
2. `vite.config.ts` runs `import "dotenv/config"` so the backend port (`PORT`) is read from `.env` before the proxy target is computed.
3. The React app boots. The root layout (`StoreProvider`) calls `GET /api/auth/me`; if unauthenticated it renders the `AuthPage`, otherwise the main layout with `Sidebar`, `TopNav`, and routed pages.
4. A user action triggers a fetch to `/api/...` (relative, same-origin).
5. Vite proxies `/api` to `http://localhost:<PORT>` (default `3001`, from `.env`).
6. Express reads environment variables and calls the OpenAI Responses API.
7. The backend returns parsed text; the frontend validates it with **zod** and renders structured data into the dashboard.

> **Proxy port note.** `vite.config.ts` and `server/config.ts` both load `.env` (`import "dotenv/config"`). This keeps the Vite proxy target (`localhost:${PORT}`) and the Express `listen(PORT)` in sync. Without the dotenv import in the Vite config the dev server proxies to the fallback port (`4180`) while the server listens on `3001`, producing `ECONNREFUSED` proxy errors.

## Component Architecture

### Frontend responsibilities

- UI layout and panels (`src/components/`)
- routing and page-level state (`src/pages/`, `src/App.tsx`)
- auth + server-backed app state via React Context (`src/lib/store.tsx`)
- zod-validated AI output parsing (`src/lib/parse.ts`, `src/lib/ai.ts`)
- orchestration of calls to backend endpoints (`src/lib/client.ts`)

### Backend responsibilities

- secret management (OpenAI key, JWT secret — env only, never sent to the browser)
- OpenAI Responses API integration (`server/routes/generate.ts`)
- auth: scrypt password hashing + signed JWT cookies (`server/auth.ts`)
- server-side persistence in SQLite (`server/db.ts`)
- request validation, rate limiting, and CORS (`server/middleware.ts`)

## Architectural Pattern

The project uses a thin backend proxy pattern: the browser never speaks to OpenAI directly, and the OpenAI API key lives only in the Express process.

Advantages:

- secrets never reach the browser
- simpler backend environment management
- reduced security exposure
- single place for rate limiting and request shaping

## Auth & State Model

- **Accounts**: register/login with scrypt-hashed passwords. A signed JWT is stored in an httpOnly, SameSite=Lax cookie (`wl_token`, 7-day expiry).
- **Per-user state**: each user's dashboard state (trends, ideas, scripts, calendar, etc.) is persisted in SQLite keyed by user id and synced on a 400ms debounce via `PUT /api/state`.
- **Dev account**: a known local-development account is seeded with `npm run seed:dev` (`admin@wavelength.local` / `password123`) so the dashboard is usable immediately — see [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md).

See [./DATABASE.md](./DATABASE.md) for the schema and [./API.md](./API.md) for endpoints.

## Data Flow Pattern

The project's main data flow is event-driven:

1. the user enters a prompt or chooses a feature action
2. the frontend calls `generateJSON()` → `POST /api/generate`
3. the backend calls the OpenAI Responses API with `system` + `prompt` (and optionally `web_search_preview`)
4. the model text response is returned to the client
5. the client extracts + zod-validates the JSON and writes it into shared app state
6. state updates trigger visible dashboard refreshes
7. the new state is debounced and persisted to SQLite server-side

## Major Code Boundaries

- `src/App.tsx` — root app: routing, `StoreProvider`, and the `AuthPage` / layout switch
- `src/lib/store.tsx` — auth + server-backed app state (React Context)
- `src/lib/ai.ts` — `generateJSON()` with zod validation + id helpers (`uid`, `withIds`)
- `src/lib/client.ts` — typed `fetch` wrapper (same-origin, cookie credentials)
- `src/lib/parse.ts` — robust JSON extraction from model output
- `src/lib/schemas.ts` — zod schemas for every AI panel
- `src/lib/{format,icons,nav}.ts` — small UI helpers
- `src/components/` — `Sidebar`, `TopNav`, `Chat`, `Landing`, `Upload`, `SharedUI`
- `src/pages/` — one page per sidebar route
- `src/styles/app.css` — design-token CSS (variables, layout, components)
- `src/types.ts` — TypeScript interfaces for all domain data
- `server/index.ts` — Express app, CORS, route mounting, health check
- `server/{config,db,auth,middleware}.ts` — config, SQLite, auth, shared middleware
- `server/routes/{auth,state,generate,youtube}.ts` — route handlers

## Interaction Logic

The dashboard is driven by user actions such as:

- refresh trends (web search)
- generate ideas / keywords / titles / scripts
- track competitors (web search)
- research a field and build a 5-video roadmap
- generate a one-click content package (idea + thumbnail + script + sources)
- plan and manage a content calendar
- view the dashboard recommendations

Each action typically performs the following:

1. validate a user input (length / shape checks in the component)
2. call `generateJSON()` → `POST /api/generate`
3. parse + zod-validate the model response
4. write the result into app state (`useAppState`)
5. state is saved is debounced and persisted to SQLite server-side
6. render on the dashboard

## Scalability Considerations

This prototype is intentionally not built for high concurrency or large-scale analytics. Scaling it would involve:

- per-user database isolation (already in place via SQLite per-user `kv`)
- auth and workspaces (present at a basic level)
- a background job queue for AI tasks
- per-user + per-endpoint rate limits (auth + AI limiters already exist)
- observability and error tracking

## Security Architecture

The security model is minimal but sound for a local prototype:

- no secrets in browser JS
- backend owns the OpenAI API key
- optional shared `API_TOKEN` for headless `/api/generate` calls
- scrypt password hashing + JWT sessions in httpOnly cookies
- restricted CORS (`CORS_ORIGIN`), rate limiting (`express-rate-limit`)

## Future Architecture Direction

Near-term hardening:

- migrate SQLite to a connection-pooling store if multi-process concurrency is needed
- add OAuth / YouTube Analytics API for 7-day delta analytics
- background generation and notification jobs
- analytics and monitoring stack (request logging, structured errors)

---

Last updated: 2026-08-03
