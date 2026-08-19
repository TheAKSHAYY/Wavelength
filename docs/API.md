# API Documentation

## Overview

The backend is a lightweight Express (TypeScript) service that exposes a small REST API for the dashboard. Its primary responsibility is to protect the OpenAI API key and provide predictable routes for authentication, per-user state, and AI generation.

## Base URL

In development the frontend is served through Vite and proxied to the backend:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:<PORT>` (`PORT` from `.env`, default `3001`)

The frontend calls the same-origin `/api/*` path via the Vite proxy (`/api` → backend). In a browser these are relative requests, e.g. `/api/health`. A reverse proxy (nginx, see `nginx.conf`) maps `/api` to the server in production builds.

## Authentication

Routes use an httpOnly, SameSite=Lax cookie named `wl_token` containing a signed JWT (7-day expiry). Passwords are hashed with **scrypt** (16-byte random salt). Requests that need a user carry the cookie automatically; the shared `API_TOKEN` is an alternative for headless clients.

## Endpoints

### GET /api/health

Liveness/readiness probe.

Example response (`200`):

```json
{
  "ok": true,
  "hasApiKey": true,
  "model": "gpt-4o-mini"
}
```

### POST /api/auth/register

Create an account. Sets the session cookie on success.

Request body:

| Field    | Type   | Required | Description                          |
| -------- | ------ | -------- | ------------------------------------ |
| `email`  | string | yes      | Valid email (normalized to lowercase) |
| `password` | string | yes  | ≥ 8 characters                       |
| `name`   | string | yes      | Display name (≤ 60 chars)            |

Response (`201`):

```json
{ "user": { "id": "uuid", "email": "a@example.com", "name": "A" } }
```

Errors: `400` (invalid email / short password), `409` (email already taken).

### POST /api/auth/login

Sign in. Sets the session cookie on success.

Request body: `{ "email": "a@example.com", "password": "…" }`

Response (`200`): `{ "user": { "id", "email", "name" } }`

Errors: `401` (invalid email or password).

### POST /api/auth/logout

Clears the session cookie.

Response (`200`): `{ "ok": true }`

### GET /api/auth/me

Current user. Requires the session cookie.

Response (`200`): `{ "user": { "id", "email", "name" } }`
Errors: `401` (not logged in).

### GET /api/state

Load the user's app state blob. Requires the session cookie.

Response (`200`):

```json
{ "state": { "niche": "…", "trends": [], "ideas": [], /* … */ } }
```

### PUT /api/state

Save the user's app state blob. Requires the session cookie. Body must be an object.

Request body: `{ "state": { /* any AppState fields */ } }` (≤ 2 MB)

Response (`200`): `{ "ok": true }`
Errors: `400` (body is not an object), `401`.

### POST /api/generate

Proxies to the OpenAI Responses API. The OpenAI key lives only on the server. Accepts either the session cookie (browser) or a shared `API_TOKEN` via `x-api-key` / `Authorization: Bearer` (headless). Rate-limited (60/min default).

Request body:

| Field         | Type    | Required | Description                          |
| ------------- | ------- | -------- | ------------------------------------ |
| `system`      | string  | no       | Instructions / persona for the model   |
| `prompt`      | string  | yes      | The user task                        |
| `useWebSearch`| boolean | no       | Attach a `web_search_preview` tool   |

Response (`200`):

```json
{ "text": "<raw model output, usually JSON>" }
```

Errors:

| Status | Meaning |
| --- | --- |
| `400` | missing or invalid `prompt` |
| `401` | caller not authenticated (session expired / no token) — the client treats this as a real auth expiry |
| `500` | `OPENAI_API_KEY` is not set |
| `502` | upstream OpenAI API rejected or failed (e.g. invalid key, rate limit) — message preserved, session **not** invalidated |

> Upstream (OpenAI) non-2xx responses are mapped to **502** so the client does not mistake them for an expired session.

Errors: `400` (missing/invalid `prompt`), `401` (auth), `500` (OpenAI not configured / upstream failure).

### GET /api/youtube/analytics

Fetches real (public) per-video lifetime view counts via the YouTube Data API. Requires the session cookie. If `YOUTUBE_API_KEY` / `YOUTUBE_CHANNEL_ID` are not set, returns `{ "configured": false, "data": null }` and the client falls back to sample data.

Response (`200`):

```json
{ "configured": true, "data": [ { "title": "…", "views": 12300, "publishedAt": "…" } ] }
```

Errors: `401`, `404` (uploads playlist not found), `500` (YouTube API failure).

## Error Handling

- JSON error bodies: `{ "error": "message" }` or `{ "ok": false, "error": "…" }`.
- Auth failures return `401` and the client dispatches an `auth:expired` event to roll the user back to the login screen.
- AI failures return a clear message derived from the zod validation or upstream error.

## Future API Improvements

- request-validation schema (zod on the server side)
- structured streaming of model output
- per-user scope tokens
- audit logging of AI usage
- endpoint auth and key rotation handling

---

Last updated: 2026-08-03
