# API Documentation

## Overview

The backend is a lightweight Express service that exposes a small API layer for the dashboard. Its primary responsibility is to protect OpenAI credentials and provide a predictable route for the frontend to call AI functions.

## Base URL

In development, the frontend is served through Vite and proxied to the backend:

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

The frontend uses the same-origin `/api` path via Vite proxy. In a browser, calls usually look like:

```text
/api/claude
```

## Endpoints

### GET /api/health

Returns a simple health status for the backend service.

Example response:

```json
{
  "ok": true,
  "status": "healthy",
  "timestamp": "2026-08-03T12:00:00.000Z"
}
```

Purpose:

- server readiness checks
- smoke testing during local development
- operational health verification

### POST /api/claude

Primary AI endpoint for the dashboard. Accepts a structured request payload and proxies it to OpenAI’s Responses API.

Request body:

```json
{
  "system": "You are a helpful growth strategist.",
  "prompt": "Generate 5 YouTube topic ideas for AI education.",
  "useWebSearch": true
}
```

Fields:

| Field | Type | Required | Description |
|---|---|---:|---|
| system | string | yes | Role or behavior instructions for the model |
| prompt | string | yes | The actual user task to perform |
| useWebSearch | boolean | no | Enables web search features when supported |

Behavior:

- validates required fields
- reads the OpenAI API key from environment
- forwards the request to OpenAI
- reads and normalizes the response
- returns text output to the client

Example successful response:

```json
{
  "ok": true,
  "text": "Here are several topic ideas..."
}
```

Example failure response:

```json
{
  "ok": false,
  "error": "OpenAI API key not configured."
}
```

## Authentication and Security

The project includes optional support for an `API_TOKEN` header check.

If configured, requests may require:

- `x-api-key`
- or `Authorization: Bearer <token>`

This is intended for safer local or deployed usage.

## Error Handling

The backend should return clear and minimal errors. Common cases include:

- missing environment variables
- malformed requests
- upstream API response failures
- invalid return format from the model provider

## Notes

- Requests are intentionally routed through the backend to avoid exposing secrets in browser code.
- The API contract is intentionally simple and prompt-driven.
- The endpoint is currently optimized for small local operations rather than hardened production traffic.

## Future API Improvements

Recommended next improvements:

- request validation schema
- rate limiting
- structured output guarantees
- per-user session or project scopes
- endpoint auth and API key rotation handling
- audit logging

---

Last updated: 2026-08-03
