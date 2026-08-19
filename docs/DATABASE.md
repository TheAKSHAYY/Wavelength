# Database and Persistence

## Current State

Wavelength persists data **server-side in SQLite** using Node's built-in `node:sqlite` module (no native dependencies). Per-user dashboard state is stored per account and synced on a debounce from the browser.

## Storage Model

The application uses a single on-disk SQLite database (path from `DB_PATH`, default `./data/wavelength.db`). It holds two tables:

- `users` — account credentials (email + scrypt-hashed password)
- `kv` — an arbitrary per-user JSON blob keyed by `user_id` + `key`

`data/` is created automatically at startup if it does not exist (`mkdirSync(..., { recursive: true })`).

## Schema

### `users`

| Column          | Type    | Notes                                   |
| --------------- | ------- | --------------------------------------- |
| `id`            | TEXT PK | `randomUUID()` from `node:crypto`       |
| `email`         | TEXT    | UNIQUE, NOT NULL; normalized to lowercase |
| `name`          | TEXT    | NOT NULL                                |
| `password_hash` | TEXT    | `salt:scryptHash` (scrypt, 16-byte salt) |
| `created_at`    | TEXT    | `datetime('now')`                       |

### `kv`

| Column       | Type    | Notes                              |
| ------------ | ------- | ---------------------------------- |
| `user_id`    | TEXT FK | → `users.id`, ON DELETE CASCADE    |
| `key`        | TEXT    | e.g. `app`                         |
| `value`      | TEXT    | JSON blob of the user's app state  |
| `updated_at` | TEXT    | `datetime('now')` on each write    |

Composite primary key: `(user_id, key)`.

## What Gets Stored

A single `app` state blob per user contains the entire dashboard state:

- `niche` — configured content niche
- `trends`, `competitors`, `keywords`, `ideas`, `titles` — generated lists
- `script`, `pkg`, `research` — generated single objects
- `videoPlan`, `planScripts` — roadmap + per-video scripts
- `calendar` — scheduled entries
- `alerts`, `recommendations` — dashboard insights

## Persistence Behavior

- The React `StoreProvider` keeps state in memory during a session.
- On a debounced 400ms timer (and on logout), state is flushed with `PUT /api/state`.
- On boot, the store loads state with `GET /api/state` after confirming the session via `GET /api/auth/me`.

## Why SQLite

- ships with Node 22+ (`node:sqlite`) — zero native dependencies
- file-based, no external service required for local dev
- fast enough for a single-user local dashboard
- persists across server restarts, unlike browser-only storage

## Risks / Limitations

- single-file database — concurrent multi-process writes need WAL + care
- no encryption at rest
- no automated backups
- no schema migration framework (schema is created with `CREATE TABLE IF NOT EXISTS`)

## Future Database Direction

- migrate to PostgreSQL (or a managed equivalent) for multi-user / hosted deployments
- add a migrations tool (e.g. `drizzle-kit`, `kysely`)
- add audit/logging tables for AI usage and user actions
- index `kv` on `key` if more keys are introduced

## Accessing the Database

```bash
# inspect with the sqlite3 CLI if installed
sqlite3 data/wavelength.db ".tables"
sqlite3 data/wavelength.db "SELECT id, email, name FROM users;"
```

---

Last updated: 2026-08-03
