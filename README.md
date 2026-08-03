# Wavelength — AI YouTube Growth Dashboard

An AI-powered dashboard for YouTube creators: trend discovery, competitor
intel, keyword research, video idea/title/script generation, a field-research
→ 5-video roadmap tool, and a one-click "full content package" generator.
Powered by OpenAI (with live web search for research-heavy panels).

## What it is now

- **React 18 + Vite 6 + TypeScript** frontend with real routing, lazy-loaded
  pages, and a working sidebar + mobile navigation.
- **Express + TypeScript backend** that proxies to the OpenAI Responses API.
  Your API key lives only on the server — never sent to the browser.
- **Real accounts**: register/login with scrypt-hashed passwords and JWT
  sessions in httpOnly cookies.
- **Server-side storage** in SQLite (Node's built-in `node:sqlite`, no native
  deps) — all generated trends, ideas, scripts, and calendar entries are saved
  per account, not in localStorage.
- **Schema-validated AI output** (zod) — panels fail with a clear message
  instead of rendering broken data.
- **Optional real YouTube analytics** via the public YouTube Data API.
- **Hardened**: restricted CORS, rate limiting, optional shared token, tests,
  linting, typechecking, CI, and Docker deployment.

## Important: this needs an OpenAI *API* key, not a ChatGPT subscription

A ChatGPT Plus/Go plan only works on chat.openai.com / the ChatGPT app. It
does **not** give you API access. You need a separate account at
platform.openai.com with its own pay-as-you-go billing.

## Setup (local dev)

**1. Install dependencies**

```bash
npm install
```

**2. Create `.env`**

```bash
cp .env.example .env
```

Then open `.env` and set at least:

```
OPENAI_API_KEY=sk-...
JWT_SECRET=<long random string>
```

Generate a `JWT_SECRET` with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

**3. Run it**

```bash
npm run dev
```

Starts the backend (port 3001) and frontend (port 5173) together. Open
**http://localhost:5173**, create an account, and you're in.

## Available scripts

| Command | What it does |
|---|---|
| `npm run dev` | Backend + frontend together (local dev) |
| `npm run dev:server` | Backend only (tsx watch) |
| `npm run dev:client` | Frontend only (Vite) |
| `npm run build` | Type-check-compiles the server and builds the client |
| `npm run server` | Runs the compiled server from `server/dist` |
| `npm run preview` | Serves the production client build locally |
| `npm run typecheck` | Type-checks client + server |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm test` | Vitest unit tests |

## Cost / model notes

- Default model is `gpt-4o-mini` — cheap and fast, good enough for most panels.
- Web-search panels (Trend Discovery, Competitor Intel, Keyword Research,
  Field Research, One-Click Package) use OpenAI's `web_search_preview` tool,
  which costs a little extra per call.
- Want higher-quality output? Set `OPENAI_MODEL=gpt-4o` in `.env`.

## Real YouTube analytics

The Analytics page shows sample data until you configure the YouTube Data API
in `.env`:

- Create a public-data API key at https://console.cloud.google.com/apis/credentials
- Enable the "YouTube Data API v3"
- Set `YOUTUBE_API_KEY` and `YOUTUBE_CHANNEL_ID` in `.env`

It then charts the all-time views of your most recent uploads. 7-day deltas
require OAuth via the YouTube Analytics API, which is out of scope.

## Deploying

### Docker (recommended)

```bash
cp .env.example .env   # fill in real values first
docker compose up -d --build
```

Open **http://localhost:8080**. The web service serves the client and proxies
`/api` to the server service; SQLite data persists in a Docker volume.

### Manual

1. Build: `npm run build`
2. Run the server: `npm run server` (with the same env vars set)
3. Serve the `dist/` folder from any static host, pointing `/api` at the
   server (or put it behind the same nginx/domain and proxy `/api`).

## Architecture

```
server/            Express + TypeScript backend
  index.ts         app setup, CORS, routes
  db.ts            SQLite (node:sqlite) users + per-user state
  auth.ts          scrypt hashing + JWT
  middleware.ts    requireAuth, rate limits
  routes/          auth, state, generate (AI proxy), youtube
src/               React + TypeScript frontend
  lib/store.tsx    auth + server-backed app state (Context)
  lib/ai.ts        generateJSON() with zod validation
  lib/schemas.ts   zod schemas for every AI panel
  lib/parse.ts     robust JSON extraction from model output
  pages/           one page per sidebar route
  components/      Layout, SharedUI
```

## API

| Route | Auth | Purpose |
|---|---|---|
| `POST /api/auth/register` | – | Create account (sets session cookie) |
| `POST /api/auth/login` | – | Sign in (sets session cookie) |
| `POST /api/auth/logout` | – | Clear session |
| `GET /api/auth/me` | cookie | Current user |
| `GET /api/state` | cookie | Load the user's app state |
| `PUT /api/state` | cookie | Save the user's app state |
| `POST /api/generate` | cookie or `API_TOKEN` | Proxy to OpenAI Responses API |
| `GET /api/youtube/analytics` | cookie | Real view counts (optional) |
| `GET /api/health` | – | Health check |
