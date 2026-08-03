# Environment Variables

## Overview

The application depends on environment variables for local configuration and backend secrets. These should always be stored in a local `.env` file and never committed to version control.

## Example File

See [../.env.example](../.env.example) for the canonical template.

## Required Variables

| Variable | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | Yes | API key used by the backend to call OpenAI |
| `PORT` | Yes for deployment | The port used by the Express backend |
| `CORS_ORIGIN` | Usually | Allowed origin for backend CORS |
| `OPENAI_MODEL` | Optional | Model name to use for AI calls |
| `API_TOKEN` | Optional | Shared API token for endpoint protection |

## Example Values

```env
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4o-mini
PORT=3001
CORS_ORIGIN=http://localhost:5173
API_TOKEN=
```

## Notes

- `OPENAI_API_KEY` is essential for AI functionality.
- If it is missing, the server may warn but still start.
- The app expects the frontend to reach the backend over port 3001 by default.

## Security Guidance

- never commit real keys
- rotate keys regularly
- use deployment secrets in hosted environments
- keep the `.env` file local-only

---

Last updated: 2026-08-03
