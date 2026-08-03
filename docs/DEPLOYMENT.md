# Deployment Guide

## Current State

The project is currently designed primarily for local development. It is not yet set up as a hardened production deployment.

## Local Development Deployment

Use the following flow:

```bash
npm install
cp .env.example .env
npm run dev
```

This will run:

- Vite frontend on port 5173
- Express backend on port 3001

## Production Deployment Considerations

A production deployment should include:

- secure environment variable management
- HTTPS termination
- backend behind a proper server or reverse proxy
- protected secret storage
- rate limiting and abuse protection
- monitoring and logs

## Recommended Production Architecture

### Option A: single-node containerized deployment

- build frontend assets
- serve static files through an optimized server or reverse proxy
- run Express backend in the same deployment environment or behind a platform gateway

### Option B: separate frontend and backend services

- Vite build artifacts served as static site assets
- Express backend deployed as a Node service with API routing
- use environment variables and a secret manager

## Suggested Deployment Checklist

- set `OPENAI_API_KEY` securely
- set `PORT` correctly
- set `CORS_ORIGIN` to the allowed deployed origin
- set `API_TOKEN` if protecting backend endpoints
- validate the health endpoint
- verify the frontend can reach the backend through the production path

## Limitations

This project is not yet designed for full production operational maturity. Features like auth, user data persistence, and job scheduling are still missing.

---

Last updated: 2026-08-03
