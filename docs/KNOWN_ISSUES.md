# Known Issues

## Current State

This project is operational in local development mode. The following describes the actual current limitations and rough edges to be aware of before expanding or shipping.

## 1. Missing or placeholder OpenAI API key

If `OPENAI_API_KEY` is not set (or is left as the `sk-your-key-here` placeholder in `.env`), `/api/health` reports `hasApiKey: false`, and all AI-powered panels will fail with a 500 ("OPENAI_API_KEY is not set").

Mitigation:

- copy `.env.example` to `.env`
- add a valid OpenAI API key with pay-as-you-go billing (a ChatGPT Plus subscription is **not** sufficient)
- verify with `/api/health` that `hasApiKey` is `true`

## 2. Port conflicts on local machine

The app can fail if ports `3001` (`PORT`) or `5173` (`VITE_PORT`) are already occupied by stale processes.

Mitigation:

- stop stale Node/Vite processes before rerunning `npm run dev`
- confirm no other service is bound to the ports (`Get-NetTCPConnection -State Listen` on Windows)
- override the ports via `PORT` / `VITE_PORT` in `.env`

## 3. Proxy port desync (fixed — documented)

Previously the Vite dev server proxied `/api` to a fallback port (`4180`) while the server listened on `3001`, causing `ECONNREFUSED` errors. `vite.config.ts` now imports `dotenv/config` so both read `PORT` from `.env`; the proxy target and the server listen port stay in sync.

## 4. Single dev account only

There is a seeded dev account (`admin@wavelength.local` / `password123`, created by `npm run seed:dev`) for immediate sign-in. It is development convenience only and should not be treated as production credentials. Set a strong `JWT_SECRET` and register real accounts for any non-local environment.

## 5. AI output variability

Model responses can vary across runs and prompts. The client parses + zod-validates output, so a malformed response fails with a clear message instead of rendering broken data, but output quality still depends on prompts and model choice.

## 6. No production deployment hardening

The app is not yet production-network-hardened. For a real deployment, run behind nginx + HTTPS (Docker compose is provided), set a strong `JWT_SECRET`, and rotate keys regularly.

## Resolved During Stabilization

- runtime crash: `TopNav` referenced `useLocation` without importing it → fixed by importing/removing the unused reference
- invalid `as="span"` prop on a `<button>` in `Upload.tsx` → removed
- many unused imports after the UI refactor → cleaned up; `tsc --noEmit` and `eslint .` now pass clean
- auth flow through the Vite proxy → verified end-to-end (register → cookie → `/me` returns 200)

---

Last updated: 2026-08-03
