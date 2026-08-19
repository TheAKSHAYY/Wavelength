# Wavelength Documentation

## Purpose

This document is the entry point for the Wavelength project. It explains the product vision, architecture, setup, and operational expectations for engineers, AI coding assistants, and future maintainers.

Wavelength is a local-first, AI-powered YouTube growth dashboard for content creators. It combines trend discovery, competitor research, keyword analysis, content idea/title/script generation, a field-research → 5-video roadmap tool, and a one-click "full content package" generator. Powered by OpenAI (with live web search for research-heavy panels).

## Overview

Wavelength is a Vite + React (TypeScript) frontend backed by an Express (TypeScript) API proxy that forwards requests to OpenAI. The app keeps secrets on the backend and never exposes the API key in the browser.

The product follows a "research assistant for creator strategy" model:

- discover what is trending in a niche
- track competitor activity
- research keyword demand
- generate video ideas and titles
- draft scripts and outlines
- assemble a five-video strategy roadmap
- maintain a lightweight publishing calendar
- get AI-driven recommendations

## Quick start

```bash
npm install
cp .env.example .env   # then set OPENAI_API_KEY and JWT_SECRET
npm run dev            # backend :3001 + frontend :5173
npm run seed:dev       # create a ready-to-sign-in dev account
```

Open **http://localhost:5173**. Sign in with the seeded dev account or register a new one from the login screen.

See [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) for every `.env` option.

## Features

### Core features

- Trend discovery via live web search
- Competitor tracking for YouTube channels
- Keyword demand research
- AI-generated YouTube ideas
- AI-generated title options with CTR-oriented heuristics
- Script drafting assistant
- 5-video field research roadmap generation
- One-click content package generation
- Content calendar planning
- Alert and recommendation panels
- **Server-side persistence**: per-user state is saved in SQLite (not localStorage), so it survives restarts and is scoped per account

### Target user

- Individual YouTube creators
- Creator-led startups
- Channel operators focused on content planning and growth
- Students and emerging developers building content systems

## Screenshots

The project currently has no production screenshots checked in. Suggested placeholders for future documentation:

- Dashboard overview
- Trend discovery panel
- Competitor intelligence panel
- Field research + roadmap
- One-click package output
- Content calendar

Suggested naming convention:

- docs/assets/screenshots/dashboard-overview.png
- docs/assets/screenshots/trend-discovery.png
- docs/assets/screenshots/roadmap.png

## Installation

### Prerequisites

- Node.js 22.5+ (for the built-in `node:sqlite` module used by the backend)
- npm
- An OpenAI API key (pay-as-you-go billing at platform.openai.com — **not** a ChatGPT Plus subscription)
- A local environment that can run Vite and Express together

### Install dependencies

```bash
npm install
```

### Environment setup

Create a local `.env` file using the project example:

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

## Local Development

Start the app locally:

```bash
npm run dev
```

This launches:

- Express backend on port `3001` (or `PORT` from `.env`)
- Vite frontend on port `5173`

Open **http://localhost:5173**, sign in (or run `npm run seed:dev` for a ready dev account), and you are in.

### Useful commands

```bash
npm run dev          # backend + frontend together
npm run dev:server   # backend only (tsx watch)
npm run dev:client   # frontend only (Vite)
npm run seed:dev     # seed a dev account (admin@wavelength.local / password123)
npm run build        # compile the server and build the client
npm run server       # runs the compiled server from server/dist
npm run preview      # serves the production client build locally
npm run typecheck    # type-checks client + server
npm run lint         # ESLint
npm run format       # Prettier
npm test             # Vitest unit tests
```

## Cost / Model Notes

- Default model is `gpt-4o-mini` — cheap and fast, good enough for most panels.
- Web-search panels (Trend Discovery, Competitor Intel, Keyword Research, Field Research, One-Click Package) use OpenAI's `web_search_preview` tool, which costs a little extra per call.
- Want higher-quality output? Set `OPENAI_MODEL=gpt-4o` in `.env`.

## Real YouTube Analytics

The Analytics page shows sample data until you configure the YouTube Data API in `.env`:

- Create a public-data API key at https://console.cloud.google.com/apis/credentials
- Enable the "YouTube Data API v3"
- Set `YOUTUBE_API_KEY` and `YOUTUBE_CHANNEL_ID` in `.env`

It then charts the all-time views of your most recent uploads. 7-day deltas require OAuth via the YouTube Analytics API, which is out of scope.

## Deploying

### Docker (recommended)

```bash
cp .env.example .env   # fill in real values first
docker compose up -d --build
```

Open **http://localhost:8080**. The web service serves the client and proxies `/api` to the server service; SQLite data persists in a Docker volume.

### Manual

1. Build: `npm run build`
2. Run the server: `npm run server` (with the same env vars set)
3. Serve the `dist/` folder from any static host, pointing `/api` at the server (or put it behind the same nginx/domain and proxy `/api`).

## Folder Structure

```text
wavelength/
├── docs/            project documentation
├── server/          Express + TypeScript backend
│   ├── index.ts     app setup, CORS, routes
│   ├── config.ts    env/config
│   ├── db.ts        SQLite (node:sqlite) users + per-user state
│   ├── auth.ts      scrypt hashing + JWT
│   ├── middleware.ts  requireAuth, rate limits
│   ├── seed.ts      dev account seeder
│   └── routes/      auth, state, generate (AI proxy), youtube
├── src/             React + TypeScript frontend
│   ├── components/  Sidebar, TopNav, Chat, Landing, Upload, SharedUI
│   ├── lib/         store, ai, client, schemas, parse, hooks
│   ├── pages/       one page per sidebar route
│   ├── styles/      app.css (design tokens)
│   └── main.tsx     entry point
├── data/            SQLite database file (wavelength.db)
├── dist/            production client build
└── ...
```

See [FOLDER_STRUCTURE.md](./FOLDER_STRUCTURE.md) for a full breakdown.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, Vite 6, TypeScript |
| Routing | React Router DOM v7 |
| Backend | Node.js + Express, TypeScript (tsx) |
| Auth | scrypt (node:crypto) + JWT (jsonwebtoken), httpOnly cookies |
| Storage | SQLite (node:sqlite), per-user `kv` blob |
| AI | OpenAI Responses API (web_search_preview for research) |
| Validation | zod (client-side schemas) |
| Rate limiting | express-rate-limit |
| Charts | Recharts |
| Icons | lucide-react |
| Styling | CSS custom properties / design tokens |
| Build | Vite + TypeScript |
| Tests | Vitest (unit: auth hashing, JSON parsing) |

See [TECH_STACK.md](./TECH_STACK.md) for rationale and trade-offs.

## Architecture

The architecture is intentionally simple:

- React UI renders the dashboard and calls REST endpoints through the same-origin Vite proxy
- Express backend stores the OpenAI key (never sent to the browser)
- OpenAI calls happen only on the server
- per-user state is persisted server-side in SQLite

See [ARCHITECTURE.md](./ARCHITECTURE.md) and [API.md](./API.md).

## Contributing

Contributions are welcome. Please follow the repository conventions described in [CONTRIBUTING.md](./CONTRIBUTING.md) and [CODING_STANDARDS.md](./CODING_STANDARDS.md).

Before making changes:

1. Review the architecture and product context
2. Understand the module boundaries
3. Avoid breaking the API contract
4. Update docs when behavior changes

## License

This project is licensed under the MIT License. See [LICENSE.md](./LICENSE.md).

## Cross references

- [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) — product and engineering context
- [PRD.md](./PRD.md) — requirements
- [FEATURES.md](./FEATURES.md) — feature details
- [ARCHITECTURE.md](./ARCHITECTURE.md) — system design
- [API.md](./API.md) — endpoints and contracts
- [DATABASE.md](./DATABASE.md) — persistence model and schema
- [SECURITY.md](./SECURITY.md) — attack surface and controls
- [TESTING.md](./TESTING.md) — validation strategy
- [ROADMAP.md](./ROADMAP.md) — future milestones

## Future Improvements

The project has a strong MVP foundation. Recommended next improvements include:

- multi-process-safe database (or a managed store)
- OAuth via the YouTube Analytics API for 7-day delta analytics
- content workflow integrations
- deployment hardening and CI/CD
- automated tests for API and full UI auth flows

## Notes

This documentation has been updated to match the current codebase (TypeScript frontend + TypeScript Express backend, SQLite per-user state, JWT auth).

---

Last updated: 2026-08-03
