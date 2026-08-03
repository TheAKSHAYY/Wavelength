# Folder Structure

## Project Layout

```text
wavelength/
├── docs/
│   ├── README.md
│   ├── PROJECT_CONTEXT.md
│   ├── PRD.md
│   ├── FEATURES.md
│   ├── TECH_STACK.md
│   ├── DATABASE.md
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── FOLDER_STRUCTURE.md
│   ├── UI_GUIDELINES.md
│   ├── CODING_STANDARDS.md
│   ├── SECURITY.md
│   ├── PERFORMANCE.md
│   ├── TESTING.md
│   ├── DEPLOYMENT.md
│   ├── ENVIRONMENT_VARIABLES.md
│   ├── ROADMAP.md
│   ├── CHANGELOG.md
│   ├── TODO.md
│   ├── KNOWN_ISSUES.md
│   ├── AI_CONTEXT.md
│   ├── AI_RULES.md
│   ├── PROMPT_HISTORY.md
│   ├── CONTRIBUTING.md
│   ├── LICENSE.md
│   └── FAQ.md
├── server/
│   └── index.js
├── src/
│   ├── components/
│   │   └── SharedUI.jsx
│   ├── data/
│   │   └── dashboardData.js
│   ├── services/
│   │   └── aiService.js
│   ├── styles/
│   │   └── app.css
│   ├── utils/
│   │   └── storage.js
│   ├── main.jsx
│   ├── WavelengthDashboard.jsx
│   └── App.jsx (if introduced later)
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
├── README.md
└── LICENSE
```

## File Responsibilities

### Root-level files

- `package.json`: defines scripts and package dependencies
- `vite.config.js`: defines Vite behavior and `/api` proxy
- `index.html`: app HTML shell
- `.env.example`: environment variable template
- `README.md`: general product overview

### `server/`

Contains the Express backend service and its runtime logic.

### `src/`

Contains all frontend UI, logic, and supporting modules.

#### `components/`

Reusable UI blocks that are not tied to a specific dashboard feature.

#### `data/`

Seed configuration and structured data for the dashboard.

#### `services/`

Interaction layer for backend calls and AI integration.

#### `styles/`

CSS and visual system definitions.

#### `utils/`

Persistence and helper utilities.

## File Ownership Guidance

- UI concerns belong in the dashboard and component files.
- API logic belongs in the backend or service files.
- prompt behavior should remain centralized where possible.
- environment variables belong in `.env`, not in source code.

## Structural Recommendations

The project is already improved from a single-file dashboard. The continued pattern should be:

- keep business logic close to the UI or its consuming feature
- isolate external integration behind service modules
- keep prompt and JSON parsing logic centralized
- avoid scattering config values across the app

---

Last updated: 2026-08-03
