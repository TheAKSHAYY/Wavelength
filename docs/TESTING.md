# Testing Strategy

## Current State

This project does not yet have a formal automated test suite. It is currently best viewed as a local prototype with manual verification and build checks.

## Testing Principles

- validate the app works end-to-end locally
- verify the proxy and environment setup
- test the most critical business flows
- cover parsing logic and backend validation with unit tests where possible

## Recommended Test Layers

### 1. Unit tests

Best for:

- AI response extraction helpers
- storage helpers
- input validation logic
- prompt assembly functions

### 2. Integration tests

Best for:

- frontend requests hitting the backend proxy
- API contract validation
- environment failure handling

### 3. End-to-end tests

Best for:

- user journey flows
- dashboard rendering
- save/restore behavior
- API errors surfaced in UI

## Minimal Validation Checklist

Before shipping or changing core behavior, check:

- `npm install` succeeds
- `npm run build` succeeds
- `npm run dev` starts without fatal errors
- backend health endpoint responds
- API call path works with a valid environment variable
- UI loads without console-breaking runtime errors

## Suggested Future Automation

- Vitest for frontend logic and parsing
- supertest or a similar tool for Express endpoint validation
- Playwright for UI flow scoring and regression checks
- CI workflow to run build and tests automatically

## Testing Notes

Because this project is strongly prompt-driven, output parsing is a high-risk area. It should be tested thoroughly and treated as an explicit contract boundary.

---

Last updated: 2026-08-03
