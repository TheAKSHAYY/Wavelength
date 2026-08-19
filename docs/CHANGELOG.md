# Changelog

## 2026-08-19 (v2.1.0)

### Added

- **Creator Profile & Persona Section (`/profile`)**:
  - Dedicated Profile Page ([`ProfilePage.tsx`](file:///c:/Users/Pc/OneDrive/Desktop/wavelength/wavelength/src/pages/ProfilePage.tsx)) with 4 modular tabs:
    1. **Creator Persona & Brand**: Name, channel name, handle, 500-character elevator bio, custom avatar theme color picker (8 palettes), upload frequency target, and YouTube channel sync.
    2. **Socials & Links**: Social profile connectors for X/Twitter, GitHub, Discord community, LinkedIn, and personal portfolio.
    3. **Workspace Activity & Pipeline Stats**: Live computed metrics (Saved Ideas, Script Drafts, Scheduled Videos, Tracked Competitors, Researched Keywords).
    4. **Security & Credentials**: Session status overview, account email, and secure password update form with live validation.
- **Backend Profile & Security API**:
  - `PUT /api/auth/profile`: Update creator profile attributes, social links, and channel branding.
  - `PUT /api/auth/password`: Secure password change verifying existing hashed credentials.
  - SQLite auto-migrations for profile columns (`channel_name`, `handle`, `bio`, `avatar_color`, `niche`, `target_audience`, `tone`, `youtube_channel_id`, `upload_goal`, `social_links`).
- **Intelligence Test Suites**:
  - Added unit tests for Title Intelligence 10-framework synthesis and Script Assistant multi-language generators in `server/__tests__/intelligence.test.ts`.

### Fixed & Improved

- **Top Navigation Dropdown Positioning**:
  - Fixed popover horizontal clipping by anchoring with `right: 0 !important; left: auto !important` and smooth entry transitions.
  - Introduced dedicated `.dropdown-menu-item` classes replacing generic buttons for pixel-perfect hover states.
- **Security & Push Hygiene**:
  - Sanitized `.env.example` placeholder tokens to pass GitHub Secret Scanning Push Protection.
  - Updated `.gitignore` to prevent log artifacts from being staged.

---

## 2026-08-03

### Fixed

- **runtime crash**: `TopNav` referenced `useLocation` without importing it, crashing the app for any signed-in user → removed the unused reference.
- **invalid JSX prop**: removed the invalid `as="span"` attribute on a `<button>` in `Upload.tsx`.
- **unused imports** left over from the UI refactor across all pages → cleaned up; `npm run typecheck` and `npm run lint` now pass clean.
- **Vite proxy port desync**: `vite.config.ts` now imports `dotenv/config` so the `/api` proxy target reads `PORT` from `.env` and stays in sync with the Express backend.

### Added

- **dev seed utility**: `server/seed.ts` and the `npm run seed:dev` script create a ready-to-sign-in local account (`admin@wavelength.local` / `password123`).

---

Last updated: August 2026
