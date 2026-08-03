# Frequently Asked Questions

## What is Wavelength?

Wavelength is a local-first AI dashboard for creator research and content planning. It helps users discover trends, research topics, generate ideas, draft scripts, and plan a multi-video content roadmap.

## Why is there a backend server if the app is a frontend?

The backend exists to protect the OpenAI API key and proxy requests in a safe way. Browsers should not directly call OpenAI with a secret key.

## Why does the app use localStorage?

It is a lightweight, browser-based persistence layer for a prototype environment. It is easy to use during development and supports refresh continuity without a database.

## Do I need an OpenAI API key?

Yes, for AI-powered features. The app reads `OPENAI_API_KEY` from the `.env` file in local development.

## Why am I seeing a port conflict?

A previous Node process may still be holding port 3001 or 5173. Stopping stale processes resolves the issue.

## Is this production-ready?

Not yet. It is a strong MVP and local prototype, but it needs additional hardening for production deployment, auth, persistence, monitoring, and security.

## Can I deploy it?

Yes, conceptually, but it should be treated as a deployment-in-progress and configured with secure environment variables, HTTPS, and production-level validation.

## How do I start the app?

```bash
npm install
cp .env.example .env
npm run dev
```

---

Last updated: 2026-08-03
