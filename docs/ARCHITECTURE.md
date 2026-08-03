# Architecture

## System Overview

Wavelength follows a simple two-layer architecture:

- frontend: React SPA that presents the dashboard and orchestrates user actions
- backend: Express API that proxies requests to OpenAI and keeps secrets secure

## Runtime Flow

### Local development flow

1. The user opens the Vite development server at http://localhost:5173.
2. The React app renders the dashboard and local state.
3. A user action triggers a fetch to `/api/...`.
4. Vite proxy forwards the request to `http://localhost:3001`.
5. Express reads environment variables and calls OpenAI.
6. The backend returns the AI response to the frontend.
7. The frontend parses and renders the output into the dashboard.

## Component Architecture

### Frontend responsibilities

- UI layout and panels
- user interactions and control state
- local storage persistence
- parsing and rendering AI output
- orchestration of calls to backend endpoints

### Backend responsibilities

- secret management
- OpenAI integration
- validation and request shaping
- proxy behavior for browser code

## Architectural Pattern

This project uses a thin backend proxy pattern. This is a common and practical solution for local AI dashboards and prototypes.

Advantages:

- secrets never reach the browser
- easier backend environment management
- reduced security exposure
- simpler local development story

## State Model

The current app stores most transient or generated state in browser memory and localStorage. This keeps the product simple but means the app is not truly multi-user or server-backed.

## Data Flow Pattern

The project’s main data flow is event-driven:

- user enters a prompt or chooses a feature action
- frontend calls the appropriate backend endpoint
- backend calls AI model with system and prompt instructions
- output is parsed into the UI’s structured objects
- state updates trigger visible dashboard refreshes

## Major Code Boundaries

The architecture is intentionally modularized into several logical categories:

- `src/WavelengthDashboard.jsx` — main dashboard orchestration
- `src/services/aiService.js` — backend request layer
- `src/data/dashboardData.js` — seed and config data
- `src/components/SharedUI.jsx` — reusable UI blocks
- `src/utils/storage.js` — persistence helpers
- `server/index.js` — backend server and routes

## Interaction Logic

The dashboard is driven by user actions such as:

- refresh trends
- generate ideas
- research keywords
- create scripts
- track competitors
- generate package summaries
- review recommendations

Each action typically performs the following:

1. validate a user input
2. call the AI endpoint
3. parse result into structured JSON or text
4. write to state
5. persist to localStorage
6. render on the dashboard

## Scalability Considerations

This prototype is intentionally not built for high concurrency or large-scale analytics. Scaling it would involve:

- persistent project data
- auth and workspaces
- server-side storage
- job queues for AI tasks
- user-level rate limits
- observability and error tracking

## Security Architecture

The security model is intentionally minimal but sound for a local prototype:

- no secrets in browser JS
- backend owns API credentials
- optional API token on requests
- environment-only configuration

## Future Architecture Direction

A likely next-generation architecture would include:

- a database-backed API
- identity and auth
- queue-based AI jobs
- content history and project workspaces
- background generation and notifications
- analytics and monitoring stack

---

Last updated: 2026-08-03
