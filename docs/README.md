# Wavelength Documentation

## Purpose

This document is the entry point for the Wavelength project. It explains the product vision, architecture, setup, and operational expectations for engineers, AI coding assistants, and future maintainers.

This project is a local-first AI-powered YouTube growth dashboard for content creators. It combines trend discovery, market research, keyword analysis, content idea generation, editing support, and publishing planning in a single interface.

## Overview

Wavelength is a Vite + React frontend backed by an Express API proxy that forwards requests to OpenAI. The app is designed to keep secrets on the backend and avoid exposing API credentials in the browser.

The product follows a “research assistant for creator strategy” model:

- discover what is trending in a niche
- track competitor activity
- research keyword demand
- generate video ideas and titles
- draft scripts and outlines
- assemble a five-video strategy roadmap
- maintain a lightweight publishing calendar

## Features

### Core features

- Trend discovery via live web search
- Competitor tracking for YouTube channels
- Keyword demand research
- AI-generated YouTube ideas
- AI-generated title options with CTR-oriented heuristics
- Script drafting assistant
- 5-video field research roadmap generation
- One-click content package generation
- Content calendar planning
- Alert and recommendation panels
- Browser-side persistence via localStorage

### Target user

- Individual YouTube creators
- Creator-led startups
- Channel operators focused on content planning and growth
- Students and emerging developers building content systems

## Screenshots placeholders

The project currently has no production screenshots checked in. Recommended placeholders for future documentation:

- Dashboard overview
- Trend discovery panel
- Competitor intelligence panel
- Field research + roadmap
- One-click package output
- Content calendar

Suggested naming convention:

- docs/assets/screenshots/dashboard-overview.png
- docs/assets/screenshots/trend-discovery.png
- docs/assets/screenshots/roadmap.png

## Installation

### Prerequisites

- Node.js 18+
- npm
- OpenAI API key
- Local environment that can run Vite and Express together

### Install dependencies

```bash
npm install
```

### Environment setup

Create a local `.env` file using the project example:

```bash
cp .env.example .env
```

Required variables are described in [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md).

## Local Development

Start the app locally:

```bash
npm run dev
```

This launches:

- Express backend on port 3001
- Vite frontend on port 5173

### Useful commands

```bash
npm run server
npm run client
npm run build
npm run preview
```

## Deployment

The project is currently designed for local development, not production deployment. It can be deployed to a Node-capable environment with a secure API proxy layer, environment variables configured, and a production build generated via Vite.

See [DEPLOYMENT.md](DEPLOYMENT.md) for more details.

## Folder Structure

```text
wavelength/
├── docs/
├── server/
│   └── index.js
├── src/
│   ├── components/
│   ├── data/
│   ├── services/
│   ├── styles/
│   ├── utils/
│   ├── main.jsx
│   └── WavelengthDashboard.jsx
├── .env.example
├── index.html
├── package.json
├── vite.config.js
├── README.md
└── .gitignore
```

See [FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md) for a full breakdown.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite |
| Backend | Express |
| AI API | OpenAI Responses API |
| Styling | CSS modules / custom CSS |
| Data persistence | browser localStorage |
| Build tooling | Vite |
| Charts | Recharts |
| Icons | lucide-react |

See [TECH_STACK.md](TECH_STACK.md) for rationale and trade-offs.

## Architecture

The architecture is intentionally simple:

- React UI renders the dashboard and calls REST endpoints through the same-origin Vite proxy
- Express backend stores no secrets in the client
- OpenAI calls happen only on the server
- localStorage stores generated data locally in the browser for lightweight persistence

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full runtime and component flows.

## Contributing

Contributions are welcome. Please follow the repository conventions described in [CONTRIBUTING.md](CONTRIBUTING.md) and [CODING_STANDARDS.md](CODING_STANDARDS.md).

Before making changes:

1. Review the architecture and product context
2. Understand the module boundaries
3. Avoid breaking the API contract
4. Update docs when behavior changes

## License

This project is licensed under the MIT License. See [LICENSE.md](LICENSE.md).

## Cross references

- [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) — product and engineering context
- [PRD.md](PRD.md) — requirements
- [FEATURES.md](FEATURES.md) — feature details
- [ARCHITECTURE.md](ARCHITECTURE.md) — system design
- [API.md](API.md) — endpoints and contracts
- [SECURITY.md](SECURITY.md) — attack surface and controls
- [TESTING.md](TESTING.md) — validation strategy
- [ROADMAP.md](ROADMAP.md) — future milestones

## Future Improvements

The project has a strong MVP foundation. Recommended next improvements include:

- real database persistence
- auth and user accounts
- YouTube API integration
- audience analytics and search trend imports
- content workflow integrations
- deployment hardening and CI/CD
- automated tests for API and UI flows

## Notes

This documentation has been inferred from the current codebase and project behavior. Assumptions are explicitly noted where the project does not yet have full implementation details.

---

Last updated: 2026-08-03
