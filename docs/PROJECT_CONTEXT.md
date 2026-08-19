# Project Context

## Purpose

This document captures everything an AI assistant or future developer should know before changing any code in this project. It is intentionally broad and operational, covering product, behavior, architecture, constraints, and implementation history.

## Product Summary

Wavelength is an AI-powered dashboard that helps YouTube creators plan and optimize their content workflow. It provides a single place to:

- monitor current trends in a niche
- analyze competitors
- research relevant keywords
- generate content ideas and titles
- draft scripts
- plan future video content
- organize a publishing calendar

The project is currently a local, research-focused MVP with a polished UI and backend AI orchestration layer.

## Business Goal

The product aims to reduce the cognitive load of content planning and research for creators. At a high level, the goal is to compress the time between:

- niche discovery
- content concept generation
- market validation
- planning and scripting
- publishing decisions

## Core User Experience

The app is organized around a dashboard model. Users enter a niche or topic and the UI offers multiple AI-assisted panels:

1. Trend discovery  
2. Competitor intelligence  
3. Keyword research  
4. Idea generation  
5. Title generation  
6. Script drafting  
7. Multi-video roadmap planning  
8. One-click package generation  
9. Content calendar management  
10. Notification and recommendation widgets

The interface is intentionally rich and fast-moving, similar to a creative dashboard rather than a traditional CRUD app.

## Current Product State

This project is best described as a prototype or MVP, not a production-grade SaaS platform.

### Current strengths

- Rich single-page dashboard experience
- Strong visual direction for creator tooling
- AI orchestration centered on prompt-driven generation
- Server-side persistence (SQLite) that survives restarts and is scoped per user
- Auth and session management (scrypt + JWT)
- Rapid prototyping-friendly setup with concurrent dev servers

### Current limitations

- No real analytics integrations
- No robust billing controls
- No formal monitoring or alerting system
- Not yet production-network-hardened (run behind nginx + HTTPS via Docker for real deployments)
- Test coverage is lightweight (focused on auth hashing, JWT, and JSON parsing)

## Architecture Summary

The app has two main runtime pieces:

- a React/Vite frontend for interactive UI
- an Express backend that proxies AI calls to OpenAI

### Why this architecture is used

The design keeps the API key private, since browsers cannot safely store production secrets. This prevents leaking credentials through the frontend and is the primary reason the Express proxy exists.

## Important Domain Assumptions

The system assumes the following:

- the user is a creator operating in a content niche
- the user wants AI-assisted research rather than deterministic data processing
- data is mostly per-browser and not shared across users
- prompts are optimized for open-ended, research-style generation
- generated content is exploratory and may need review and editing before publishing

## Known Domain Rules

- AI output should be considered draft-quality guidance, not final publishing content.
- Trend and competitor data are approximate and should not be treated as authoritative market data.
- Search results and keyword results are best-effort and may vary by the time they are generated.
- The product is not a legal or financial advisory system.

## Data Model (current implementation)

The system persists per-user dashboard state **server-side in SQLite** (`node:sqlite`). The frontend keeps state in memory during a session and debounces a `PUT /api/state` to persist it; on boot it loads state with `GET /api/state` after authenticating via `GET /api/auth/me`. The DB holds two tables: `users` (id, email, name, password_hash) and `kv` (user_id, key, value text, updated_at).

Examples of persisted data (stored as one `app` JSON blob per user):

- trends
- ideas
- competitors
- recommendations
- calendar entries
- titles
- script draft
- keyword results
- research summary
- roadmap data
- plan scripts

This persistence layer is intentionally simple and local-first (file-based SQLite, no external service). It is not enterprise-grade persistence.

## Current Functional Modules

### 1. Trend discovery

Uses live web search and identifies topic opportunities with:

- score
- source origin
- growth number
- competition level
- format
- length

### 2. Competitor intelligence

Accepts a channel or creator name and builds a lightweight competitive profile:

- upload frequency
- average views
- trend direction
- latest upload summary
- gap/opportunity description

### 3. Keyword research

Researches terms and classifies them by intent and opportunity strength.

### 4. Topic and idea generation

Generates creative ideas optimized around audience interest and content opportunity.

### 5. Title generation

Generates title options with style and CTR heuristics.

### 6. Script drafting

Creates outlines or narrative structures for videos.

### 7. Field research and roadmap

Takes a broad field such as “System Design” or “Android development” and produces a 5-video journey.

### 8. Full content package generation

Generates an idea, thumbnail concept, script, and sources in one pass.

## Business Logic Patterns

The core business logic is prompt-driven. The app does not use a strict domain model or database schema for most content generation. Instead, it relies on:

- prompt design
- response extraction from AI output
- server-side state hydration
- serializable JSON objects
- per-panel user interactions

This is intentionally lightweight and fast to build, but not robust for complex workflows.

## Architectural Constraints

### Security constraints

- API keys must stay on the backend
- browser cannot be trusted with secrets
- localStorage is not secure storage for sensitive data

### Operational constraints

- persistence is file-based SQLite (single `data/wavelength.db`), not a managed database
- no queueing system for heavy AI tasks (generation is synchronous per request)
- app is best-effort and synchronous for user requests

### Product constraints

- feature complexity is tightly coupled to prompt quality
- output quality varies based on model version and web search availability

## AI Coding Assistant Guidance

AI agents working on this project should:

- prefer preserving the current architecture over rearchitecting it
- not introduce persistent user state without a clear (SQLite) storage model
- treat the AI service layer as a controlled integration boundary
- avoid shipping breaking changes to the JSON payload contracts without updating all consumers
- keep server-side state serialization compatible with older app state shapes
- preserve user experience patterns that are already established in the dashboard

## Do's and Don'ts

### Do

- reuse existing component patterns
- keep API routes explicit and intentional
- maintain the server-side state sync flow when possible
- update docs when changing prompt contracts or state shapes
- keep key management server-side

### Don't

- move secrets to the client
- rewrite the app into a backend-heavy architecture without a clear migration plan
- break the prompt-output expectations without inspecting all call sites
- create a new database layer without documenting it
- assume all AI outputs are correct or complete

## Assumptions

This document intentionally marks places where the project does not yet implement enterprise features. Assumptions include:

- user identity is implemented (scrypt + JWT sessions; per-user state in SQLite)
- content generation is prototype-level, not production-validated
- AI tools are used for research and ideation, not fully deterministic content automation
- there is no formal data retention policy yet

## Related Files

- [README.md](README.md)
- [PRD.md](PRD.md)
- [ARCHITECTURE.md](ARCHITECTURE.md)
- [AI_CONTEXT.md](AI_CONTEXT.md)
- [AI_RULES.md](AI_RULES.md)
- [SECURITY.md](SECURITY.md)
- [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md)

## Future Outlook

This is a well-scoped creator tooling MVP. The most valuable next step is to evolve from local experimentation into a real platform that includes:

- a managed database and per-user isolation
- managed AI jobs
- deployment infrastructure (Docker + nginx + HTTPS)
- metrics and observability

---

Last updated: 2026-08-03
