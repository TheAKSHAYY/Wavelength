# Known Issues

## Current State

This project is operational in local development mode, but it is not yet production-hardened. The following issues are known and should be understood before shipping or expanding the app.

## 1. Missing API key in local environment

If `OPENAI_API_KEY` is not set, the backend warns and the AI feature set will not function as intended.

Mitigation:

- copy `.env.example` to `.env`
- add a valid OpenAI API key
- verify the env file is loaded correctly by the Node process

## 2. Port conflicts on local machine

The app can fail if ports 3001 or 5173 are already occupied by stale Node or Vite processes.

Mitigation:

- stop stale Node processes before rerunning `npm run dev`
- confirm no other service is bound to the ports

## 3. Browser-local-only persistence

The app uses browser `localStorage` for data persistence. This is fine for a prototype but unsuitable for multi-user or production-grade workflows.

## 4. AI output variability

Model responses can vary across runs and input prompts. This affects content quality and requires careful prompt design and validation.

## 5. No formal automated tests

The app still relies heavily on manual verification and build checks.

## 6. No production deployment hardening

The app is not yet secured and monitored in a production environment.

## 7. No auth or user separation

The app does not support multiple users, personal workspaces, or role-based access.

---

Last updated: 2026-08-03
