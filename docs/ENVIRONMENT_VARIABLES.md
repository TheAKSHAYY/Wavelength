# Environment Variables

## Overview

The application depends on environment variables for local configuration and backend secrets. These should always be stored in a local `.env` file and never committed to version control.

## Example File

See [../.env.example](../.env.example) for the canonical template.

## Required Variables

| Variable | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | Yes (for AI features) | API key used by the backend to call OpenAI. Get it at platform.openai.com. A ChatGPT Plus subscription is **not** sufficient. |
| `JWT_SECRET` | Yes | Secret used to sign login session tokens. Generate a long random string. |
| `PORT` | Yes for deployment | The port used by the Express backend. Must match the Vite proxy target. |
| `CORS_ORIGIN` | Usually | Allowed origin for backend CORS (the frontend dev URL). |

## Optional Variables

| Variable | Default | Description |
|---|---|---|
| `OPENAI_MODEL` | `gpt-4o-mini` | Model name to use for AI calls |
| `API_TOKEN` | (empty) | Shared API token for headless `/api/generate` access (`x-api-key` header) |
| `DB_PATH` | `./data/wavelength.db` | Path to the SQLite database file |
| `COOKIE_SECURE` | `false` | Set to `true` when serving over HTTPS |
| `YOUTUBE_API_KEY` | (empty) | Public-data YouTube Data API key |
| `YOUTUBE_CHANNEL_ID` | (empty) | Channel whose uploads are charted (Analytics page) |
| `VITE_PORT` | `5173` | Vite dev server port |

## Example Values

```env
# --- OpenAI (required for AI panels) ---
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4o-mini

# --- Server ---
PORT=3001
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=6eceb2f29629fe4335c771f24a2a853c560efcfb453b07c44768a1687ddd1f81976b9da27a3138ec99830e42f94f903a
API_TOKEN=
DB_PATH=./data/wavelength.db
COOKIE_SECURE=false

# --- Optional: real YouTube analytics ---
YOUTUBE_API_KEY=
YOUTUBE_CHANNEL_ID=
```

## Notes

- `OPENAI_API_KEY` is essential for AI functionality.
- If it is missing, the server warns and AI features will not function; the rest of the app (auth, state, dashboard, calendar) still works.
- The app expects the frontend to reach the backend over the configured `PORT` by default; `vite.config.ts` loads `.env` so the `/api` proxy target matches `PORT`.
- A ready dev account is seeded with `npm run seed:dev` (`admin@wavelength.local` / `password123`).

## Security Guidance

- never commit real keys
- rotate keys regularly
- use deployment secrets in hosted environments
- keep the `.env` file local-only

---

Last updated: 2026-08-03
