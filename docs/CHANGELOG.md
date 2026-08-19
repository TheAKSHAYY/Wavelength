# Changelog

## 2026-08-03

### Fixed

- **runtime crash**: `TopNav` referenced `useLocation` without importing it, crashing the app for any signed-in user → removed the unused reference.
- **invalid JSX prop**: removed the invalid `as="span"` attribute on a `<button>` in `Upload.tsx`.
- **unused imports** left over from the UI refactor across all pages → cleaned up; `npm run typecheck` and `npm run lint` now pass clean.
- **Vite proxy port desync**: `vite.config.ts` now imports `dotenv/config` so the `/api` proxy target reads `PORT` from `.env` and stays in sync with the Express backend (fixes the `ECONNREFUSED` errors seen in `dev.log`).

### Added

- **dev seed utility**: `server/seed.ts` and the `npm run seed:dev` script create a ready-to-sign-in local account (`admin@wavelength.local` / `password123`).

### Verified

- backend (port 3001) and frontend (port 5173) start together via `npm run dev`
- auth flow through the Vite proxy (register → cookie → `/api/auth/me` returns 200)
- server-side state read/write against SQLite (`GET`/`PUT /api/state`)
- `npm run typecheck`, `npm run lint`, and `npm test` (23 tests) all pass

### Documentation

- rewrote `ARCHITECTURE.md`, `DATABASE.md`, `API.md`, `TECH_STACK.md`, `FOLDER_STRUCTURE.md`, `docs/README.md`, and `KNOWN_ISSUES.md` to match the current TypeScript + SQLite + JWT codebase (previously described an older `.jsx`/`localStorage` prototype).

## 2026-08-03 (prior)

### Added

- created the complete project documentation set under `docs/`
- added architecture and project context guidance
- documented environment, security, and deployment assumptions
- captured roadmap, issues, and future work items

### Improved

- clarified the backend/frontend separation
- documented the local-first MVP architecture
- codified structure and standards for future maintenance

### Notes

- This repository remains a local prototype and should not be treated as enterprise production-ready yet.

---

Last updated: 2026-08-03
