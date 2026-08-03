# Tech Stack

## Summary

The project uses a light-weight application stack intentionally optimized for a fast, local-first creator dashboard. It combines React on the frontend, Express on the backend, and OpenAI as the AI inference layer.

## Frontend

### React 18

React is used as the UI framework for building the dashboard’s interactive panels and stateful components.

Benefits:

- rapid interface iteration
- component-based composition
- straightforward local state handling
- strong fit for a dashboard MVP

Trade-offs:

- no server-side rendering
- browser-only state needs explicit persistence design

### Vite

Vite is used for local development and build optimization.

Benefits:

- fast HMR and dev feedback
- simple static build pipeline
- good performance for front-end prototypes

### Recharts

Recharts provides charting for analytic and trend-driven visuals.

Benefits:

- simple charts and trend lines
- quick visual communication of metrics
- good fit for dashboard data summaries

### Lucide React

This is used for accessible icons in the dashboard.

Benefits:

- consistent visual language
- lightweight icon set
- minimal integration overhead

## Backend

### Express

Express provides the API layer and proxy for the AI backend.

Responsibilities:

- expose a local API route for the frontend
- read environment configuration
- validate request inputs
- forward requests to OpenAI securely
- return parsed results to the client

## AI Layer

### OpenAI Responses API

The backend calls OpenAI via the Responses API.

Why this fits:

- model flexibility
- powerful prompt-driven generation
- good compatibility with structured output patterns
- simple integration for a local prototype

## Data and State

### localStorage

The frontend persists generated state in the browser using localStorage.

Why it is used:

- developer speed
- no database required during prototype phase
- easy persistence across refreshes

Limitations:

- not secure for sensitive data
- not multi-user
- not scalable for production workloads

## Networking and Security

### CORS

CORS is configured to allow the frontend to access the backend during development.

### Proxy configuration

Vite proxies all `/api` requests to the backend on `localhost:3001`.

This design keeps the browser from speaking directly to OpenAI and centralizes secret management.

## Build and Runtime Tools

### Node.js

The project runs in a Node.js environment with npm as its package manager.

### Concurrently

The project uses `concurrently` in the dev script so both backend and frontend can start together.

## Dependency Profile

| Category | Dependencies |
|---|---|
| Runtime | react, react-dom, express, cors, dotenv, node-fetch |
| UI | lucide-react, recharts |
| Dev | vite, @vitejs/plugin-react, concurrently |

## Architectural Trade-offs

### Strengths

- simple and easy to understand
- fast iteration cycle
- secret-safe architecture
- small dependency footprint

### Weaknesses

- no database or session layer
- no production networking hardening
- no user-centric security model
- AI orchestration is prompt-based and not deeply structured

## Recommendation

This is a strong MVP stack. For the next production phase, the project should likely evolve into:

- a real database layer
- auth and user workspaces
- a queueing and job system for AI workloads
- better telemetry and monitoring
- deployment automation

---

Last updated: 2026-08-03
