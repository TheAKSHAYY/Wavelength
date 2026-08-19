# Tech Stack

## Summary

Wavelength is a TypeScript full-stack app optimized for a fast, local-first creator dashboard: a React + Vite frontend, an Express + TypeScript backend that proxies to OpenAI, and SQLite for per-user persistence. Secrets are kept entirely server-side.

## Frontend

### React 18 + TypeScript

React powers the dashboard's interactive panels, routing, and stateful components. TypeScript provides compile-time safety across the React + Vite toolchain.

Benefits:

- rapid interface iteration
- component-based composition
- React Context for shared auth/state
- strong typing for zod-validated AI output

Trade-offs:

- no server-side rendering (dev-only local build)

### Vite + Vite Plugin React

Vite provides fast HMR and the production build. `vite.config.ts` imports `dotenv/config` so the `/api` proxy target reads `PORT` from `.env`, keeping client and server ports in sync.

### React Router DOM (v7)

Client-side routing between the dashboard pages and auth screen.

### Recharts

Recharts renders the analytics charts (area + bar charts) on the Analytics page.

### Lucide React

Accessible icon set used throughout the dashboard.

### CSS (design tokens)

A single `src/styles/app.css` defines the entire visual system via CSS custom properties (colors, radii, shadows, transitions) and responsive layout — no CSS-in-JS.

## Backend

### Node.js + TypeScript

The backend is TypeScript run with `tsx` (no separate compile step in dev). Node 22+ provides `node:sqlite` and native `fetch` out of the box.

### Express

Express exposes the API routes and proxies to OpenAI.

Responsibilities:

- expose `/api/*` routes for the frontend
- read environment configuration
- validate request inputs
- forward requests to OpenAI securely (key never leaves the server)
- return normalized text output

### node:sqlite

Zero-dependency SQLite via Node's built-in module — users + per-user state, no native build step.

### jsonwebtoken + node:crypto (scrypt)

JWT signed with `JWT_SECRET`, stored in an httpOnly cookie. Passwords hashed with `scryptSync`.

### express-rate-limit

Two rate limiters: an auth limiter (20 req/min) and an AI limiter (60 req/min).

### zod

Schemas for every AI panel validate the model output on the client; the backend returns raw text and lets the client validate.

## AI Layer

### OpenAI Responses API

The backend calls `https://api.openai.com/v1/responses`. Web-search-enabled panels attach a `web_search_preview` tool.

Why this fits:

- model flexibility (`OPENAI_MODEL`, default `gpt-4o-mini`)
- prompt-driven generation
- web search for research-heavy panels

## Data and State

### SQLite (server-side)

Per-user dashboard state is persisted in SQLite (`users` + `kv` tables). The frontend debounces a `PUT /api/state` to keep the server blob in sync, and loads it on login/boot. See [DATABASE.md](./DATABASE.md).

## Networking and Security

### CORS

CORS is restricted to `CORS_ORIGIN` (frontend origin) with credentials enabled.

### Proxy configuration

The Vite dev server proxies `/api` to `http://localhost:<PORT>`. In production, `nginx.conf` serves the static `dist/` and proxies `/api` to the server container (`docker-compose.yml`).

This design keeps the browser from speaking to OpenAI directly and centralizes secret management.

## Build and Runtime Tools

- **Node.js** (22.5+ for `node:sqlite`) with npm
- **tsx** — TypeScript execution for the backend (no compile in dev)
- **concurrently** — runs backend + frontend together under `npm run dev`
- **ESLint + Prettier** — linting and formatting
- **Vitest** — unit tests for the server (`/auth`) and shared client utils (`/parse`, /`format`)

## Dependency Profile

| Layer        | Dependencies                                          |
| ------------ | ----------------------------------------------------- |
| Runtime (FE) | react, react-dom, react-router-dom, recharts, zod     |
| Runtime (BE) | express, cors, cookie-parser, jsonwebtoken, express-rate-limit, dotenv, node:sqlite |
| UI           | lucide-react                                           |
| Dev          | vite, @vitejs/plugin-react, typescript, tsx, concurrently, eslint, prettier, vitest |

Note: the backend uses Node's built-in `fetch` and `node:sqlite` — no `node-fetch` dependency.

## Architectural Trade-offs

### Strengths

- simple and easy to understand
- fast iteration cycle
- secrets never reach the browser
- small dependency footprint (no native modules)

### Weaknesses

- single-file SQLite DB under concurrent multi-process load
- not production-network-hardened (use Docker/nginx for that)
- AI orchestration is prompt-driven, so output quality depends on prompts + validation

## Recommendation

This is a strong local-dev stack. For production, the project should:

- run behind nginx + HTTPS (Docker compose provided)
- set a strong `JWT_SECRET` and rotate `OPENAI_API_KEY`
- use a managed database if multi-process concurrency is needed

---

Last updated: 2026-08-03
