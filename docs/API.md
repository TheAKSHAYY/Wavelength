# API Documentation

## Overview

The backend is a lightweight Express (TypeScript) service that exposes a REST API for the dashboard. Its primary responsibility is to protect the API keys (OpenAI, Gemini, YouTube Data API v3) and provide predictable routes for authentication, user profiles, per-user state, AI generation, and chat intelligence.

## Base URL

In development the frontend is served through Vite and proxied to the backend:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:<PORT>` (`PORT` from `.env`, default `3001`)

The frontend calls the same-origin `/api/*` path via the Vite proxy (`/api` → backend). In a browser these are relative requests, e.g. `/api/health`. A reverse proxy (nginx, see `nginx.conf`) maps `/api` to the server in production builds.

## Authentication

Routes use an httpOnly, SameSite=Lax cookie named `wl_token` containing a signed JWT (7-day expiry). Passwords are hashed with **scrypt** (16-byte random salt). Requests that need a user carry the cookie automatically; the shared `API_TOKEN` is an alternative for headless clients.

---

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

---

### POST /api/auth/register

Create an account. Sets the session cookie on success.

Request body:

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `email` | string | yes | Valid email (normalized to lowercase) |
| `password` | string | yes | ≥ 8 characters |
| `name` | string | yes | Display name (≤ 60 chars) |

Response (`201`):

```json
{ "user": { "id": "uuid", "email": "a@example.com", "name": "A", "avatar_color": "#6366f1" } }
```

Errors: `400` (invalid email / short password), `409` (email already taken).

---

### POST /api/auth/login

Sign in. Sets the session cookie on success.

Request body: `{ "email": "a@example.com", "password": "…" }`

Response (`200`): `{ "user": { "id", "email", "name", "avatar_color", "niche", "social_links" } }`

Errors: `401` (invalid email or password).

---

### POST /api/auth/logout

Clears the session cookie.

Response (`200`): `{ "ok": true }`

---

### GET /api/auth/me

Current user profile and preferences. Requires the session cookie.

Response (`200`):

```json
{
  "user": {
    "id": "uuid",
    "email": "creator@wavelength.studio",
    "name": "Akshay",
    "channel_name": "CodeWavelength",
    "handle": "akshaydev",
    "bio": "Building developer tools...",
    "avatar_color": "#6366f1",
    "niche": "Coding & AI",
    "target_audience": "CS Students & Developers",
    "tone": "deep-analytical",
    "youtube_channel_id": "UC6sFFiZztnKzGrMqwS3rD4w",
    "upload_goal": "2 videos / week",
    "social_links": {
      "twitter": "https://x.com/...",
      "github": "https://github.com/...",
      "discord": "https://discord.gg/...",
      "website": "https://portfolio.dev"
    },
    "created_at": "2026-08-19T21:44:00Z"
  }
}
```

Errors: `401` (not logged in).

---

### PUT /api/auth/profile

Update creator profile information, channel persona, and social handles. Requires the session cookie.

Request body:

| Field | Type | Description |
| --- | --- | --- |
| `name` | string | Display name |
| `channel_name` | string | Channel public name |
| `handle` | string | Creator handle (@handle) |
| `bio` | string | Elevator channel bio (≤ 500 chars) |
| `avatar_color` | string | Hex color accent |
| `niche` | string | Primary domain category |
| `target_audience` | string | Target audience description |
| `tone` | string | Default script narration tone |
| `youtube_channel_id` | string | YouTube channel ID |
| `upload_goal` | string | Weekly upload target |
| `social_links` | object | Social media and portfolio links |

Response (`200`): `{ "user": { ...updatedUser } }`

---

### PUT /api/auth/password

Securely update the user's password. Requires valid current password.

Request body:

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `currentPassword` | string | yes | Existing password |
| `newPassword` | string | yes | New password (≥ 8 characters) |

Response (`200`): `{ "ok": true, "message": "Password updated successfully." }`

---

### GET /api/state

Load the user's app state blob. Requires the session cookie.

Response (`200`):

```json
{ "state": { "niche": "…", "trends": [], "ideas": [], "titles": [], "calendar": [] } }
```

---

### PUT /api/state

Save the user's app state blob. Requires the session cookie. Body must be an object.

Request body: `{ "state": { /* any AppState fields */ } }` (≤ 2 MB)

Response (`200`): `{ "ok": true }`

---

### POST /api/generate

Proxies to the OpenAI Responses API with automatic fallback to live YouTube data synthesis. Rate-limited.

Request body:

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `system` | string | no | Instructions / persona for the model |
| `prompt` | string | yes | The user task |
| `useWebSearch`| boolean | no | Attach web search tool |

Response (`200`): `{ "text": "<raw model output, usually JSON>" }`

---

### POST /api/chat

Interactive YouTube Strategist Chat endpoint supporting multi-turn conversation and context injection.

Request body: `{ "messages": [ { "role": "user", "content": "..." } ], "niche": "..." }`

---

### GET /api/youtube/analytics

Fetches real (public) per-video lifetime view counts via the YouTube Data API v3. Requires session cookie.

Response (`200`):

```json
{ "configured": true, "data": [ { "title": "…", "views": 12300, "publishedAt": "…" } ] }
```

---

## Error Handling

- JSON error bodies: `{ "error": "message" }` or `{ "ok": false, "error": "…" }`.
- Auth failures return `401` and the client dispatches an `auth:expired` event to roll the user back to the login screen.
- Upstream AI errors return `502` with descriptive error messages without invalidating user session.

---

Last updated: August 2026
