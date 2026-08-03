# Coding Standards

## Purpose

This project should remain understandable, maintainable, and safe for future iteration. The standards below define the expected approach for code changes.

## General Principles

- prefer clarity over cleverness
- keep modules focused and explicit
- centralize AI request logic
- avoid mixing state, UI, and API concerns in one place where possible
- update docs and prompts when contracts change

## Frontend Standards

### Component rules

- keep components focused on presentation and interaction
- avoid embedding large prompt blocks directly inside page components when they can be centralized
- prefer reusable UI building blocks for repeated patterns

### State rules

- keep app state predictable and serializable when persisting
- prefer a single, consistent localStorage strategy
- avoid introducing hidden side effects in common render paths

### Styling rules

- keep CSS organized and readable
- avoid scattered inline styles when a broader system exists
- maintain a consistent spacing and color palette

## Backend Standards

- keep environment reading in one place for the Node process
- validate required inputs before upstream calls
- return strict, readable error responses
- do not expose secrets in client code

## AI Integration Standards

- keep model calls inside a dedicated service boundary
- centralize prompt assembly and result parsing
- ensure all AI response handling is robust to malformed or partial output
- avoid assuming model output is valid JSON unless structured output is explicitly enforced

## Security Standards

- never commit real secrets
- keep all API keys in `.env` or a deployment secret store
- avoid console logging sensitive values
- treat browser localStorage as untrusted and non-sensitive storage

## Testing Standards

- prefer small, behavior-focused tests for critical logic
- add regression coverage for parsing functions, API validation, and UI edge cases
- test the failure path as much as the success path

## Documentation Standards

Whenever changing behavior, update the relevant docs in the `docs/` directory.

## Pull Request Guidance

Before merge, verify:

- the app still builds
- the API still starts correctly
- environment variables are documented
- docs are updated if behavior changed
- no secrets or private values were introduced

---

Last updated: 2026-08-03
